<?php
namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('roles.lire') || $user->can('*');
    }
    public function create(User $user): bool
    {
        return $user->can('roles.creer') || $user->can('*');
    }
    // app/Policies/RolePolicy.php

    public function update(User $user, Role $role): bool
    {
        // On interdit à quiconque (sauf Super Admin géré par le Gate) 
        // de modifier le rôle Super Admin lui-même.
        if ($role->name === 'Super Admin') {
            return false;
        }
        return $user->can('roles.modifier');
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->name === 'Super Admin') {
            return false;
        }
        return $user->can('roles.supprimer');
    }
}