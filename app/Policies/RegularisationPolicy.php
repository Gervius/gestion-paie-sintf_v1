<?php

namespace App\Policies;

use App\Models\User;

class RegularisationPolicy
{
    public function create(User $user): bool
    {
        return $user->can('creer_regularisation') || $user->can('*');
    }
}