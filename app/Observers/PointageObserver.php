<?php

namespace App\Observers;

use App\Models\Pointage;
use App\Models\AuditPointage;
use Illuminate\Support\Facades\Auth;

class PointageObserver
{
    public function updating(Pointage $pointage): void
    {
        if ($pointage->isDirty('statut')) {
            AuditPointage::create([
                'pointage_id'    => $pointage->id,
                'user_id'        => Auth::id(),
                'ancien_statut'  => $pointage->getOriginal('statut'),
                'nouveau_statut' => $pointage->statut,
            ]);
        }
    }
}