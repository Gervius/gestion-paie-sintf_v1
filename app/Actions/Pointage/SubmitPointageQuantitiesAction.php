<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use App\Models\PointageLigne;
use Illuminate\Support\Facades\DB;

class SubmitPointageQuantitiesAction
{
    public function execute(Pointage $pointage, array $quantities)
    {
        DB::transaction(function () use ($pointage, $quantities) {
            
            $lockedPointage = Pointage::where('id', $pointage->id)->lockForUpdate()->first();

            if (!in_array($lockedPointage->statut, ['PREPARATION', 'EDITE_TERRAIN'])) {
                throw new \Exception("Action impossible : Ce pointage est déjà clôturé ou en cours de traitement.");
            }

            $taux = $lockedPointage->taux_applique;
            $lignesTraiteesIds = [];
            
            // 1. Récupérer toutes les lignes concernées en 1 seule requête
            $lignesExistant = PointageLigne::whereIn('id', array_column($quantities, 'ligne_id'))
                                           ->where('pointage_id', $lockedPointage->id)
                                           ->get()
                                           ->keyBy('id');

            $upsertData = [];

            // 2. Préparer le tableau de données en mémoire (ultra-rapide)
            foreach ($quantities as $item) {
                $ligne = $lignesExistant->get($item['ligne_id']);
                if (!$ligne) continue;

                $quantite = (float) $item['quantite'];
                $nouveauStatut = $quantite > 0 ? 'EN_ATTENTE' : 'ABSENT';
                
                // Calcul du montant
                $montantBrut = $quantite * $taux;

                $upsertData[] = [
                    'id'                  => $ligne->id,
                    'pointage_id'         => $ligne->pointage_id,
                    'personnel_id'        => $ligne->personnel_id,
                    'matricule_personnel' => $ligne->matricule_personnel,
                    'quantite'            => $quantite,
                    'montant_brut'        => $montantBrut,
                    // 👇 On force l'injection des centimes dans la BDD pour l'upsert
                    'montant_brut_centimes' => (int) round($montantBrut * 100), 
                    'type_ligne'          => $ligne->type_ligne,
                    'statut_ligne'        => $nouveauStatut,
                    'moyen_paiement'      => $item['moyen_paiement'] ?? 'WAVE',
                ];
                
                $lignesTraiteesIds[] = $ligne->id;
            }

            // Plus bas, dans l'exécution de l'Upsert, ajoute la colonne pour qu'elle soit mise à jour :
            if (!empty($upsertData)) {
                PointageLigne::upsert(
                    $upsertData,
                    ['id'],
                    
                    ['quantite', 'montant_brut', 'montant_brut_centimes', 'statut_ligne', 'moyen_paiement'] 
                );
            }

            // 4. Nettoyage des lignes orphelines (agents présents sur feuille mais non soumis)
            if (!empty($lignesTraiteesIds)) {
                PointageLigne::where('pointage_id', $lockedPointage->id)
                    ->whereNotIn('id', $lignesTraiteesIds)
                    ->update([
                        'quantite'     => 0,
                        'montant_brut' => 0,
                        'statut_ligne' => 'ABSENT'
                    ]);
            }

            app(\App\Actions\Pointage\AppliquerGarantieJournaliereAction::class)->execute($lockedPointage);

            // 5. Clôture définitive du pointage
            $lockedPointage->update(['statut' => 'CLOTURE']);
        });
    }
}