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
            
            $taux = $pointage->taux_applique;

            foreach ($quantities as $item) {
                PointageLigne::where('id', $item['ligne_id'])
                    ->where('pointage_id', $pointage->id)
                    ->update([
                        'quantite'       => $item['quantite'],
                        'montant_brut'   => $item['quantite'] * $taux,
                        'moyen_paiement' => $item['moyen_paiement'] ?? 'ESPECES', // 💡 C'EST CETTE LIGNE QUI MANQUAIT !
                        'statut_ligne'   => 'EN_ATTENTE'
                    ]);
            }

            $pointage->update([
                'statut' => 'CLOTURE'
            ]);
            
        });
    }
}