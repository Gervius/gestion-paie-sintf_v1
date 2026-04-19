<?php

namespace App\Services\Finance;

use App\Models\TicketPaiement;
use App\Models\Avance;
use Illuminate\Support\Facades\DB;

class PaiementEspecesService
{
    public function payer(TicketPaiement $ticket): void
    {
        DB::transaction(function () use ($ticket) {
            if ($ticket->statut !== 'NON_SOLDE') {
                throw new \Exception('Ce ticket ne peut pas être payé.');
            }
            if ($ticket->etatPaiement->statut !== 'VALIDE') {
                throw new \Exception('L\'état de paiement associé n\'est pas encore validé.');
            }

            // 1. On solde le ticket
            $ticket->update(['statut' => 'SOLDE']);
            $ticket->pointageLignes()->update(['statut_ligne' => 'PAYE']);

            // 2. LOGIQUE MANUELLE : On récupère le montant décidé par le caissier
            $retenueAAppliquer = $ticket->montant_deduit_manuel;

            if ($retenueAAppliquer > 0) {
                // On récupère les avances actives de l'employé
                $avances = Avance::where('personnel_id', $ticket->personnel_id)
                    ->where('statut', 'ACTIVE')
                    ->where('solde_restant', '>', 0)
                    ->orderBy('date_avance')
                    ->get();

                foreach ($avances as $avance) {
                    if ($retenueAAppliquer <= 0) break;

                    // On déduit soit la totalité de la retenue, soit ce qu'il reste sur cette avance
                    $deduction = min($avance->solde_restant, $retenueAAppliquer);
                    
                    $avance->decrement('solde_restant', $deduction);
                    $retenueAAppliquer -= $deduction;

                    if ($avance->solde_restant <= 0) {
                        $avance->update(['statut' => 'SOLDEE']);
                    }
                }
            }
        });
    }

    /**
     * Paiement de masse pour l'état complet
     */
    public function payerEtatComplet($etatId): int
    {
        $tickets = TicketPaiement::where('etat_paiement_id', $etatId)
            ->where('mode_paiement', 'ESPECES')
            ->where('statut', 'NON_SOLDE')
            ->get();

        $count = 0;
        foreach ($tickets as $ticket) {
            $this->payer($ticket);
            $count++;
        }
        return $count;
    }
}