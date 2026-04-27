<?php

namespace App\Policies;

use App\Models\Personnel;
use App\Models\User;

class PersonnelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('personnels.lire') ;
    }

    public function create(User $user): bool
    {
        return $user->can('personnels.creer') ;
    }

    public function update(User $user, Personnel $personnel): bool
    {
        return $user->can('personnels.modifier') ;
    }

    public function delete(User $user, Personnel $personnel): bool
    {
        return $user->can('personnels.supprimer') ;
    }

    
}