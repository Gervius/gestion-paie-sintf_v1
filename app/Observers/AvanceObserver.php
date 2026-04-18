<?php

namespace App\Observers;

use App\Models\Avance;

class AvanceObserver
{
    public function creating(Avance $avance): void
    {
        if (!$avance->solde_restant) {
            $avance->solde_restant = $avance->montant_initial;
        }
    }
}