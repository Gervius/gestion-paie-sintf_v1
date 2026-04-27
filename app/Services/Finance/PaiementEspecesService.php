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
     * Paiement de masse pour l'état complet (SÉCURISÉ)
     */
    public function payerEtatComplet($etatId): int
    {
        return DB::transaction(function () use ($etatId) {
            // lockForUpdate() est crucial ici pour éviter que quelqu'un d'autre
            // (ex: un autre caissier ou un script) ne modifie ces tickets en même temps.
            $tickets = TicketPaiement::where('etat_paiement_id', $etatId)
                ->where('mode_paiement', 'ESPECES')
                ->where('statut', 'NON_SOLDE')
                ->lockForUpdate() 
                ->get();

            $count = 0;
            foreach ($tickets as $ticket) {
                // Ta méthode payer() gère déjà sa propre logique de retenue
                // mais elle sera englobée dans cette transaction parente !
                $this->payer($ticket);
                $count++;
            }
            
            return $count;
        });
    }

    /**
     * Traite un paiement en espèces massif pour une liste de tickets.
     * * @param array $ticketIds Liste des IDs des tickets à payer
     * @param int $userId ID de l'utilisateur qui valide le paiement
     * @return int Le nombre de tickets mis à jour
     */
    public function traiterPaiementMassif(array $ticketIds, int $userId): int
    {
        return DB::transaction(function () use ($ticketIds, $userId) {
            // On s'assure de ne payer que les tickets en espèces qui ne sont pas encore soldés
            return TicketPaiement::whereIn('id', $ticketIds)
                ->where('mode_paiement', 'ESPECES')
                ->where('statut', 'NON_SOLDE')
                ->update([
                    'statut' => 'SOLDE',
                    'date_paiement' => now(), // Tu peux ajouter 'paye_par_id' => $userId si tu as la colonne
                ]);
        });
    }
}