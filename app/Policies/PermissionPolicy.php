<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Permission;

class PermissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function create(User $user): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function update(User $user, Permission $permission): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function delete(User $user, Permission $permission): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }
}