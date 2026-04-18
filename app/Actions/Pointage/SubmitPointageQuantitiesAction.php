<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use App\Models\PointageLigne;
use Illuminate\Support\Facades\DB;

class SubmitPointageQuantitiesAction
{
    public function execute(Pointage $pointage, array $quantities): void
    {
        if ($pointage->statut !== 'EDITE_TERRAIN') {
            throw new \Exception('La feuille doit être en édition terrain pour recevoir les quantités.');
        }

        DB::transaction(function () use ($pointage, $quantities) {
            $taux = $pointage->taux_applique;
            $ligneIds = array_column($quantities, 'ligne_id');

            $lignes = PointageLigne::where('pointage_id', $pointage->id)
                ->whereIn('id', $ligneIds)
                ->get()
                ->keyBy('id');

            $lignesAvecQuantite = [];

            foreach ($quantities as $item) {
                $ligneId = $item['ligne_id'];
                $quantite = max(0, (float) $item['quantite']);

                if (!isset($lignes[$ligneId])) continue;

                $ligne = $lignes[$ligneId];

                if ($quantite > 0) {
                    $ligne->quantite = $quantite;
                    $ligne->montant_brut = $quantite * $taux;
                    $ligne->statut_ligne = 'EN_ATTENTE';
                    $lignesAvecQuantite[] = $ligneId;
                }
            }

            if (!empty($lignesAvecQuantite)) {
                PointageLigne::upsert(
                    $lignes->only($lignesAvecQuantite)->map->only([
                        'id', 'quantite', 'montant_brut', 'statut_ligne'
                    ])->toArray(),
                    ['id'],
                    ['quantite', 'montant_brut', 'statut_ligne']
                );
            }

            PointageLigne::where('pointage_id', $pointage->id)
                ->whereNotIn('id', $lignesAvecQuantite)
                ->delete();

            $pointage->update(['statut' => 'CLOTURE']);
        });
    }
}