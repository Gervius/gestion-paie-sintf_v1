<?php

namespace App\Policies;

use App\Models\EtatPaiement;
use App\Models\User;

class EtatPaiementPolicy
{
    public function valider(User $user, EtatPaiement $etat): bool
    {
        return $etat->statut === 'PROVISOIRE'
            && ($user->can('valider_etat_paiement') || $user->can('*'));
    }
}