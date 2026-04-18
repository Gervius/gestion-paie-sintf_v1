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
                throw new \Exception('L\'état de paiement associé n\'est pas validé.');
            }

            
            $ticket->update(['statut' => 'SOLDE']);

            
            $ticket->pointageLignes()->update(['statut_ligne' => 'PAYE']);

            
            $avances = Avance::where('personnel_id', $ticket->personnel_id)
                ->where('statut', 'ACTIVE')
                ->where('solde_restant', '>', 0)
                ->orderBy('date_avance')
                ->get();

            $montantRestant = $ticket->montant_net;
            foreach ($avances as $avance) {
                if ($montantRestant <= 0) break;
                $deduction = min($avance->solde_restant, $montantRestant);
                $avance->decrement('solde_restant', $deduction);
                $montantRestant -= $deduction;
                if ($avance->solde_restant == 0) {
                    $avance->update(['statut' => 'SOLDEE']);
                }
            }
        });
    }
}