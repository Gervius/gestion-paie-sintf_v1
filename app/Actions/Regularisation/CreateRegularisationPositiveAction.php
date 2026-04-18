<?php

namespace App\Actions\Regularisation;

use App\Models\Pointage;
use App\Models\PointageLigne;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

class CreateRegularisationPositiveAction
{
    /**
     * Ajoute une régularisation positive (oubli ou sous-évaluation).
     *
     * @param Pointage $pointage Feuille clôturée concernée
     * @param int $personnelId
     * @param float $quantiteManquante Quantité positive à ajouter
     * @param string $motif
     * @return PointageLigne
     */
    public function execute(Pointage $pointage, int $personnelId, float $quantiteManquante, string $motif): PointageLigne
    {
        if ($pointage->statut !== 'CLOTURE') {
            throw new \Exception('La feuille doit être clôturée pour effectuer une régularisation positive.');
        }

        if ($quantiteManquante <= 0) {
            throw new \Exception('La quantité doit être strictement positive.');
        }

        return DB::transaction(function () use ($pointage, $personnelId, $quantiteManquante, $motif) {
            $personnel = Personnel::findOrFail($personnelId);
            $montant = $quantiteManquante * $pointage->taux_applique;

            $ligne = PointageLigne::create([
                'pointage_id'          => $pointage->id,
                'personnel_id'         => $personnel->id,
                'matricule_personnel'  => $personnel->matricule,
                'quantite'             => $quantiteManquante,
                'montant_brut'         => $montant,
                'type_ligne'           => 'REGULARISATION',
                'motif_regularisation' => $motif,
                'statut_ligne'         => 'EN_ATTENTE',
            ]);

            return $ligne;
        });
    }
}