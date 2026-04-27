<?php

namespace App\Policies;

use App\Models\Localite;
use App\Models\User;

class LocalitePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('localites.lire') ;
    }

    public function create(User $user): bool
    {
        return $user->can('localites.creer');
    }

    public function update(User $user, Localite $localite): bool
    {
        return $user->can('localites.modifier');
    }

    public function delete(User $user, Localite $localite): bool
    {
        return $user->can('localites.supprimer') ;
    }
}