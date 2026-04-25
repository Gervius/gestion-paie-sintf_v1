<?php

namespace App\Policies;

use App\Models\Personnel;
use App\Models\User;

class PersonnelPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('importer_personnel') 
            || $user->can('modifier_personnel') 
            || $user->can('*');
    }

    public function create(User $user): bool
    {
        return $user->can('create_personnel') || $user->can('*');
    }


    public function update(User $user, Personnel $personnel): bool
    {
        return $user->can('modifier_personnel') || $user->can('*');
    }

    public function import(User $user): bool
    {
        return $user->can('importer_personnel') || $user->can('*');
    }
}