<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function update(User $user, User $model): bool
    {
        // Empêche un non-Super Admin de modifier un Super Admin
        if ($model->hasRole('Super Admin') && !$user->can('*')) {
            return false;
        }
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }

    public function delete(User $user, User $model): bool
    {
        if ($model->id === $user->id) {
            return false;
        }
        if ($model->hasRole('Super Admin') && !$user->can('*')) {
            return false;
        }
        return $user->can('gerer_utilisateurs') || $user->can('*');
    }
}