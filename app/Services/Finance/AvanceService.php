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
            return Avance::create([
                'personnel_id'     => $personnel->id,
                'montant_initial'  => $montant,
                'solde_restant'    => $montant, 
                'date_avance'      => $date ?? now()->toDateString(),
                'motif'            => $motif,
                'statut'           => 'ACTIVE',
            ]);
        });
    }
}