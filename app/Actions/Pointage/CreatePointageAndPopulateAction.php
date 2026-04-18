<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use App\Models\PointageLigne;
use App\Models\Personnel;
use App\Models\Section;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreatePointageAndPopulateAction
{
    public function execute(
        int $siteId,
        int $sectionId,
        Carbon $date,
        string $typePointage = 'RENDEMENT'
    ): Pointage {
        return DB::transaction(function () use ($siteId, $sectionId, $date, $typePointage) {
            $existant = Pointage::where('date_pointage', $date->toDateString())
                ->where('site_id', $siteId)
                ->where('section_id', $sectionId)
                ->where('type_pointage', $typePointage)
                ->first();

            if ($existant) {
                throw new \Exception("Une feuille de pointage existe déjà pour ce site, cette section, cette date et ce type.");
            }

            $section = Section::findOrFail($sectionId);
            $taux = $typePointage === 'JOURNALIER'
                ? $section->taux_journalier
                : $section->taux_rendement;

            $pointage = Pointage::create([
                'date_pointage' => $date->toDateString(),
                'site_id'       => $siteId,
                'section_id'    => $sectionId,
                'type_pointage' => $typePointage,
                'taux_applique' => $taux,
                'statut'        => 'PREPARATION',
            ]);

            $personnels = Personnel::where('site_travail_id', $siteId)
                ->where('section_defaut_id', $sectionId)
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

            return $pointage->fresh();
        });
    }
}