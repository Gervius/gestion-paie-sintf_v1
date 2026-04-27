<?php
namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Permission;

class PermissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('permissions.lire') ;
    }
    public function create(User $user): bool
    {
        return $user->can('permissions.creer') ;
    }
    public function update(User $user, Permission $permission): bool
    {
        return $user->can('permissions.modifier') ;
    }
    public function delete(User $user, Permission $permission): bool
    {
        return $user->can('permissions.supprimer') ;
    }
}