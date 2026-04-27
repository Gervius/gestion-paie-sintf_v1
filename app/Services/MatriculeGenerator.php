<?php

namespace App\Services;

use App\Models\Sequence;
use Illuminate\Support\Facades\DB;

class MatriculeGenerator
{
    public function generate(string $siteCode): string
    {
        return DB::transaction(function () use ($siteCode) {
            $year = now()->year;

            // 1. S'assurer que la séquence existe SANS verrouiller
            Sequence::firstOrCreate(
                ['id' => 1],
                ['dernier_numero' => 0]
            );

            // 2. Maintenant qu'elle existe à 100%, on la verrouille proprement
            $sequence = Sequence::lockForUpdate()->find(1);

            $sequence->increment('dernier_numero');
            $numero = str_pad($sequence->dernier_numero, 5, '0', STR_PAD_LEFT);

            return "{$siteCode}-{$year}-{$numero}";
        });
    }
}