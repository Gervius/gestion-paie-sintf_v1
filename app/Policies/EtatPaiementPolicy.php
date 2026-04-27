<?php

namespace App\Policies;

use App\Models\EtatPaiement;
use App\Models\User;

class EtatPaiementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('etats.lire');
    }

    public function view(User $user, EtatPaiement $etat): bool
    {
        return $user->can('etats.lire');
    }

    public function create(User $user): bool
    {
        return $user->can('etats.creer');
    }

    public function valider(User $user, EtatPaiement $etat): bool
    {
        return $etat->statut === 'PROVISOIRE' && $user->can('etats.valider');
    }

    public function delete(User $user, EtatPaiement $etat): bool
    {
        // Règle métier : Un état validé ne doit jamais être supprimé
        return $etat->statut === 'PROVISOIRE' && $user->can('etats.supprimer');
    }
}