<?php

namespace App\Policies;

use App\Models\Pointage;
use App\Models\User;

class PointagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('creer_pointage') || $user->can('*');
    }

    public function create(User $user): bool
    {
        return $user->can('creer_pointage') || $user->can('*');
    }

    public function update(User $user, Pointage $pointage): bool
    {
        return $pointage->statut === 'PREPARATION'
            && ($user->can('modifier_brouillon') || $user->can('*'));
    }

    public function submitQuantities(User $user, Pointage $pointage): bool
    {
        return $pointage->statut === 'EDITE_TERRAIN'
            && ($user->can('cloturer_pointage') || $user->can('*'));
    }
}