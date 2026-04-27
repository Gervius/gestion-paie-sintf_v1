<?php

namespace App\Policies;

use App\Models\TicketPaiement;
use App\Models\User;

class TicketPaiementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tickets.lire');
    }

    // Autorisation globale pour le paiement massif
    public function payer(User $user): bool
    {
        return $user->can('tickets.payer');
    }

    // Autorisation spécifique pour un ticket
    public function payerEspeces(User $user, TicketPaiement $ticket): bool
    {
        return $ticket->statut === 'NON_SOLDE'
            && $ticket->etatPaiement->statut === 'VALIDE'
            && $user->can('tickets.payer');
    }

    // Remplacement de l'absence d'AvancePolicy pour la modification de retenue
    public function modifierRetenue(User $user, TicketPaiement $ticket): bool
    {
        return $ticket->statut === 'NON_SOLDE' && $user->can('tickets.payer');
    }

    public function genererLotWave(User $user): bool
    {
        return $user->can('tickets.wave.generer');
    }

    public function validerLotWave(User $user): bool
    {
        return $user->can('tickets.wave.valider');
    }
}