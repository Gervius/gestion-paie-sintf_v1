<?php

namespace App\Actions\Regularisation;

use App\Models\PointageLigne;
use App\Models\Avance;
use Illuminate\Support\Facades\DB;

class CreateRegularisationNegativeAction
{
    /**
     * Crée une avance correspondant au trop-perçu sur une ligne erronée.
     *
     * @param PointageLigne $ligneErronee
     * @param string $motif
     * @param float|null $montantTropPercu Si null, utilise le montant total de la ligne
     * @return Avance
     */
    public function execute(PointageLigne $ligneErronee, string $motif, ?float $montantTropPercu = null): Avance
    {
        if ($ligneErronee->statut_ligne === 'PAYE') {
            throw new \Exception('Impossible de régulariser une ligne déjà payée. Utilisez une régularisation négative pour créer une avance.');
        }

        $montant = $montantTropPercu ?? $ligneErronee->montant_brut;

        if ($montant <= 0) {
            throw new \Exception('Le montant à régulariser doit être positif.');
        }

        return DB::transaction(function () use ($ligneErronee, $motif, $montant) {
            $avance = Avance::create([
                'personnel_id'             => $ligneErronee->personnel_id,
                'regularisation_source_id' => $ligneErronee->id,
                'montant_initial'          => $montant,
                'solde_restant'            => $montant,
                'date_avance'              => now()->toDateString(),
                'motif'                    => $motif,
                'statut'                   => 'ACTIVE',
            ]);

            // Optionnel : marquer la ligne erronée comme annulée
            // $ligneErronee->update(['statut_ligne' => 'ANNULE']);

            return $avance;
        });
    }
}