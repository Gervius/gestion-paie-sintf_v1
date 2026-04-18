<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function create(User $user): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function update(User $user, Role $role): bool
    {
        if ($role->name === 'Super Admin' && !$user->can('*')) {
            return false;
        }
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->name === 'Super Admin') {
            return false;
        }
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }
}