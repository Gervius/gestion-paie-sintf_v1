<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('utilisateurs.lire');
    }

    public function create(User $user): bool
    {
        return $user->can('utilisateurs.creer');
    }

    public function update(User $user, User $model): bool
    {
        if ($model->hasRole('Super Admin')) {
            return false;
        }
        
        return $user->can('utilisateurs.modifier');
    }

    public function delete(User $user, User $model): bool
    {
        // On ne peut pas se supprimer soi-même
        if ($model->id === $user->id) {
            return false;
        }

        // Un utilisateur normal ne peut pas supprimer un Super Admin
        if ($model->hasRole('Super Admin')) {
            return false;
        }

        return $user->can('utilisateurs.supprimer');
    }
}