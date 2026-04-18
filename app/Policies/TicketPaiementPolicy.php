<?php

namespace App\Policies;

use App\Models\TicketPaiement;
use App\Models\User;

class TicketPaiementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('voir_ticket_valide') || $user->can('*');
    }

    public function payerEspeces(User $user, TicketPaiement $ticket): bool
    {
        return $ticket->statut === 'NON_SOLDE'
            && $ticket->etatPaiement->statut === 'VALIDE'
            && ($user->can('payer_especes') || $user->can('*'));
    }

    public function genererLotWave(User $user): bool
    {
        return $user->can('generer_lot_wave') || $user->can('*');
    }
}