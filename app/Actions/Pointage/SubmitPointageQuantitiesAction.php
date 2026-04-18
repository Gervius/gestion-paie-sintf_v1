<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use App\Models\PointageLigne;
use Illuminate\Support\Facades\DB;

class SubmitPointageQuantitiesAction
{
    public function execute(Pointage $pointage, array $quantities)
    {
        // On sécurise l'opération pour que tout passe ou tout échoue en même temps
        DB::transaction(function () use ($pointage, $quantities) {
            
            $taux = $pointage->taux_applique;

            // 1. Mise à jour de chaque ligne existante
            foreach ($quantities as $item) {
                PointageLigne::where('id', $item['ligne_id'])
                    ->where('pointage_id', $pointage->id) // Sécurité : on s'assure que la ligne appartient bien à ce pointage
                    ->update([
                        'quantite'     => $item['quantite'],
                        'montant_brut' => $item['quantite'] * $taux,
                        'statut_ligne' => 'EN_ATTENTE' // Ou 'VALIDE' selon tes règles métier
                    ]);
            }

            // 2. Clôture définitive de la feuille de pointage
            $pointage->update([
                'statut' => 'CLOTURE'
            ]);
            
        });
    }
}