<?php

namespace App\Actions\Regularisation;

use App\Models\PointageLigne;
use App\Models\Avance;
use Illuminate\Support\Facades\DB;

class CreateRegularisationNegativeAction
{
    public function execute(PointageLigne $ligneErronee, string $motif, float $montantTropPercu): Avance
    {
        if ($montantTropPercu <= 0 || $montantTropPercu > $ligneErronee->montant_brut) {
            throw new \Exception('Montant invalide.');
        }

        return DB::transaction(function () use ($ligneErronee, $motif, $montantTropPercu) {
            // On ajoute juste la dette dans le "casier" de l'agent.
            return Avance::create([
                'personnel_id'             => $ligneErronee->personnel_id,
                'regularisation_source_id' => $ligneErronee->id,
                'montant_initial'          => $montantTropPercu,
                'solde_restant'            => $montantTropPercu,
                'date_avance'              => now()->toDateString(),
                'motif'                    => 'TROP-PERÇU (Pointage du ' . $ligneErronee->pointage->date_pointage . ') : ' . $motif,
                'statut'                   => 'ACTIVE',
            ]);
        });
    }
}