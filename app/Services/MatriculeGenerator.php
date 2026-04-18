<?php

namespace App\Services;

use App\Models\Sequence;
use Illuminate\Support\Facades\DB;

class MatriculeGenerator
{
    /**
     * Génère un matricule unique pour un site donné.
     */
    public function generate(string $siteCode): string
    {
        return DB::transaction(function () use ($siteCode) {
            $year = now()->year;

            $sequence = Sequence::where('site_code', $siteCode)
                ->where('annee', $year)
                ->lockForUpdate()
                ->first();

            if (!$sequence) {
                $sequence = Sequence::create([
                    'site_code'      => $siteCode,
                    'annee'          => $year,
                    'dernier_numero' => 0,
                ]);
            }

            $sequence->increment('dernier_numero');
            $numero = str_pad($sequence->dernier_numero, 4, '0', STR_PAD_LEFT);

            return "{$siteCode}-{$year}-{$numero}";
        });
    }
}