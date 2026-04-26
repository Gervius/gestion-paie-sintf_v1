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
            
            // 1. VERROUILLAGE ANTI-DOUBLE CLIC (Row Level Locking)
            $lockedPointage = Pointage::where('id', $pointage->id)->lockForUpdate()->first();

            if (!in_array($lockedPointage->statut, ['PREPARATION', 'EDITE_TERRAIN'])) {
                throw new \Exception("Action impossible : Ce pointage est déjà clôturé ou en cours de traitement.");
            }

            $taux = $lockedPointage->taux_applique;
            $lignesTraiteesIds = [];

            // 2. MISE À JOUR DES QUANTITÉS SAISIES
            foreach ($quantities as $item) {
                $quantite = (float) $item['quantite'];
                $lignesTraiteesIds[] = $item['ligne_id'];

                // Règle Métier : Si l'agent a produit > 0, il est EN_ATTENTE de paie. Sinon, il est marqué ABSENT.
                $nouveauStatut = $quantite > 0 ? 'EN_ATTENTE' : 'ABSENT';

                PointageLigne::where('id', $item['ligne_id'])
                    ->where('pointage_id', $lockedPointage->id)
                    ->update([
                        'quantite'       => $quantite,
                        'montant_brut'   => $quantite * $taux,
                        'moyen_paiement' => $item['moyen_paiement'] ?? 'WAVE',
                        'statut_ligne'   => $nouveauStatut
                    ]);
            }

            // 3. NETTOYAGE DES LIGNES ORPHELINES (Sécurité)
            // Tous les agents présents sur la feuille mais qui n'ont pas été envoyés par le Frontend sont passés en ABSENT
            if (!empty($lignesTraiteesIds)) {
                PointageLigne::where('pointage_id', $lockedPointage->id)
                    ->whereNotIn('id', $lignesTraiteesIds)
                    ->update([
                        'quantite'     => 0,
                        'montant_brut' => 0,
                        'statut_ligne' => 'ABSENT'
                    ]);
            }

            // 4. CLÔTURE DÉFINITIVE
            $lockedPointage->update([
                'statut' => 'CLOTURE'
            ]);
            
        });
    }
}