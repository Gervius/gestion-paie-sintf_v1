<?php

namespace App\Policies;

use App\Models\Avance;
use App\Models\User;

class AvancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('avances.lire');
    }

    public function view(User $user, Avance $avance): bool
    {
        return $user->can('avances.lire');
    }

    public function create(User $user): bool
    {
        return $user->can('avances.creer');
    }

    public function update(User $user, Avance $avance): bool
    {
        // Règle métier : Impossible de modifier une avance qui est déjà entièrement remboursée
        return $avance->statut === 'ACTIVE' && $user->can('avances.modifier');
    }

    public function delete(User $user, Avance $avance): bool
    {
        // Règle métier CRITIQUE : On ne peut supprimer une avance QUE si 
        // l'agent n'a pas encore commencé à la rembourser.
        return $avance->montant_initial === $avance->solde_restant 
            && $user->can('avances.supprimer');
    }
}