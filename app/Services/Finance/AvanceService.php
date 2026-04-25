<?php

namespace App\Services\Finance;

use App\Models\Avance;
use App\Models\Personnel;
use Illuminate\Support\Facades\DB;

class AvanceService
{
    public function creerAvance(Personnel $personnel, float $montant, string $motif, ?string $date = null): Avance
    {
        return DB::transaction(function () use ($personnel, $montant, $motif, $date) {
            $avance = new Avance();
            $avance->personnel_id = $personnel->id;
            $avance->montant_initial = $montant;
            $avance->solde_restant = $montant;
            $avance->date_avance = $date ?? now()->toDateString();
            $avance->motif = $motif;
            $avance->statut = 'ACTIVE';
            $avance->save();

            return $avance;
        });
    }
}