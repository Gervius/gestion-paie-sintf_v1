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

            // 2. LOGIQUE DE RETENUE : Déduction sur les avances
            $retenueAAppliquer = $ticket->montant_deduit_manuel;

            if ($retenueAAppliquer > 0) {
                // INTENTION : lockForUpdate() indispensable pour prévenir les accès concurrents
                // (ex: double clic ou paiement multi-sections simultané) qui créeraient des soldes d'avances négatifs.
                $avances = Avance::where('personnel_id', $ticket->personnel_id)
                    ->where('statut', 'ACTIVE')
                    ->where('solde_restant', '>', 0)
                    ->orderBy('date_avance')
                    ->lockForUpdate() 
                    ->get();

                foreach ($avances as $avance) {
                    if ($retenueAAppliquer <= 0) break;

                    $deduction = min($avance->solde_restant, $retenueAAppliquer);
                    $nouveauSolde = $avance->solde_restant - $deduction;

                    $avance->update([
                        'solde_restant' => $nouveauSolde,
                        'solde_restant_centimes' => (int) round($nouveauSolde * 100),
                        'statut' => $nouveauSolde <= 0 ? 'SOLDEE' : 'ACTIVE'
                    ]);

                    $retenueAAppliquer -= $deduction;
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
            // INTENTION : On abandonne le mass update() SQL qui bypassait la logique métier.
            // On verrouille les tickets et on réutilise payer() pour que chaque retenue 
            // manuelle soit impérativement déduite des avances de l'employé.
            $tickets = TicketPaiement::whereIn('id', $ticketIds)
                ->where('mode_paiement', 'ESPECES')
                ->where('statut', 'NON_SOLDE')
                ->lockForUpdate()
                ->get();

            $count = 0;
            foreach ($tickets as $ticket) {
                $this->payer($ticket);
                // Mise à jour silencieuse de la date (sans déclencher les observers)
                $ticket->updateQuietly(['date_paiement' => now()]); 
                $count++;
            }
            
            return $count;
        });
    }
}