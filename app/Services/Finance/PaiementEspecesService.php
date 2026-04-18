<?php

namespace App\Services\Finance;

use App\Models\TicketPaiement;
use App\Models\EtatPaiement;
use App\Models\Avance;
use Illuminate\Support\Facades\DB;

class PaiementEspecesService
{
    /**
     * Paiement de masse : Paie tous les tickets espèces d'un état validé
     */
    public function payerEtatComplet(EtatPaiement $etat): int
    {
        if ($etat->statut !== 'VALIDE') {
            throw new \Exception("Impossible de payer un état non validé.");
        }

        $tickets = $etat->tickets()->where('mode_paiement', 'ESPECES')->where('statut', 'NON_SOLDE')->get();
        $count = 0;

        DB::transaction(function () use ($tickets, &$count) {
            foreach ($tickets as $ticket) {
                $this->payerTicket($ticket);
                $count++;
            }
        });

        return $count; // Retourne le nombre de tickets payés
    }

    /**
     * Paiement individuel avec déduction stricte de l'entente
     */
    public function payerTicket(TicketPaiement $ticket): void
    {
        DB::transaction(function () use ($ticket) {
            if ($ticket->statut !== 'NON_SOLDE') {
                throw new \Exception('Ce ticket est déjà soldé.');
            }

            $ticket->update(['statut' => 'SOLDE']);
            $ticket->pointageLignes()->update(['statut_ligne' => 'PAYE']);

            // Déduction de l'avance basée SUR LA SAISIE DU CAISSIER (montant_deduit_manuel)
            $montantARetenir = $ticket->montant_deduit_manuel;

            if ($montantARetenir > 0) {
                $avances = Avance::where('personnel_id', $ticket->personnel_id)
                    ->where('statut', 'ACTIVE')
                    ->where('solde_restant', '>', 0)
                    ->orderBy('date_avance')
                    ->get();

                foreach ($avances as $avance) {
                    if ($montantARetenir <= 0) break;
                    
                    $deduction = min($avance->solde_restant, $montantARetenir);
                    $avance->decrement('solde_restant', $deduction);
                    $montantARetenir -= $deduction;
                    
                    if ($avance->solde_restant == 0) {
                        $avance->update(['statut' => 'SOLDEE']);
                    }
                }
            }
        });
    }
}