<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use App\Models\PointageLigne;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

class ManagePointageListAction
{
    public function addAgent(Pointage $pointage, int $personnelId): PointageLigne
    {
        if ($pointage->statut !== 'PREPARATION') {
            throw new \Exception('La feuille n\'est plus modifiable.');
        }

        $personnel = Personnel::findOrFail($personnelId);

        if (PointageLigne::where('pointage_id', $pointage->id)->where('personnel_id', $personnelId)->exists()) {
            throw new \Exception('Cet agent est déjà présent sur la feuille.');
        }

        return PointageLigne::create([
            'pointage_id'         => $pointage->id,
            'personnel_id'        => $personnel->id,
            'matricule_personnel' => $personnel->matricule,
            'quantite'            => 0,
            'montant_brut'        => 0,
            'type_ligne'          => 'RENFORT',
            'statut_ligne'        => 'PREPARATION',
        ]);
    }

    public function removeAgent(Pointage $pointage, int $ligneId): void
    {
        if ($pointage->statut !== 'PREPARATION') {
            throw new \Exception('La feuille n\'est plus modifiable.');
        }

        PointageLigne::where('pointage_id', $pointage->id)->findOrFail($ligneId)->delete();
    }

    public function clearAll(Pointage $pointage): void
    {
        if ($pointage->statut !== 'PREPARATION') {
            throw new \Exception('La feuille n\'est plus modifiable.');
        }

        PointageLigne::where('pointage_id', $pointage->id)->delete();
    }

    public function resetToDefault(Pointage $pointage): void
    {
        if ($pointage->statut !== 'PREPARATION') {
            throw new \Exception('La feuille n\'est plus modifiable.');
        }

        DB::transaction(function () use ($pointage) {
            PointageLigne::where('pointage_id', $pointage->id)->delete();

            $personnels = Personnel::where('site_travail_id', $pointage->site_id)
                ->where('section_defaut_id', $pointage->section_id)
                ->where('actif', true)
                ->get(['id', 'matricule']);

            $lignes = $personnels->map(fn($p) => [
                'pointage_id'         => $pointage->id,
                'personnel_id'        => $p->id,
                'matricule_personnel' => $p->matricule,
                'quantite'            => 0,
                'montant_brut'        => 0,
                'type_ligne'          => 'NORMAL',
                'statut_ligne'        => 'PREPARATION',
                'created_at'          => now(),
                'updated_at'          => now(),
            ])->toArray();

            PointageLigne::insert($lignes);
        });
    }
}