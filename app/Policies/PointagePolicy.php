<?php

namespace App\Policies;

use App\Models\Pointage;
use App\Models\User;

class PointagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('pointages.lire');
    }
    
    public function view(User $user, Pointage $pointage): bool
    {
        return $user->can('pointages.lire');
    }

    public function create(User $user): bool
    {
        return $user->can('pointages.creer') ;
    }

    public function update(User $user, Pointage $pointage): bool
    {
        // Modification possible uniquement si le statut le permet
        if (($user->can('pointages.modifier')) 
            && in_array($pointage->statut, ['PREPARATION', 'EDITE_TERRAIN'])) {
            return true;
        }
        return false;
    }

    public function submitQuantities(User $user, Pointage $pointage): bool
    {
        return $pointage->statut === 'EDITE_TERRAIN'
            && ($user->can('pointages.soumettre') );
    }

    public function delete(User $user, Pointage $pointage): bool
    {
        return $pointage->statut === 'PREPARATION'
            && ($user->can('pointages.supprimer'));
    }

    public function reopen(User $user, Pointage $pointage): bool
    {
        $dejaEnPaie = $pointage->lignes()->whereNotNull('ticket_paiement_id')->exists();
        return $pointage->statut === 'CLOTURE'
            && !$dejaEnPaie
            && ($user->can('pointages.rouvrir'));
    }
}