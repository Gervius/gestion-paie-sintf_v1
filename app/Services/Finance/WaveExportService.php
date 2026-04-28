<?php

namespace App\Services\Finance;

use App\Models\EtatPaiement;
use App\Models\LotPaiementWave;
use App\Models\TicketPaiement;
use App\Models\Avance;
use Illuminate\Support\Facades\DB;

class WaveExportService
{
    /**
     * Étape 1 : Génère un lot Wave spécifiquement pour un état de paiement.
     * Isole les tickets concernés pour éviter les doubles paiements (ex: espèces).
     */
    public function genererLotPourEtat(EtatPaiement $etat, int $userId): LotPaiementWave
    {
        return DB::transaction(function () use ($etat, $userId) {
            // 1. Trouver les tickets Wave de cet état (Non soldés et sans lot)
            $tickets = $etat->tickets()
                ->where('mode_paiement', 'WAVE')
                ->where('statut', 'NON_SOLDE')
                ->whereNull('lot_wave_id') // Sécurité anti-doublon
                ->get();

            if ($tickets->isEmpty()) {
                throw new \Exception("Aucun paiement Wave en attente n'a été trouvé pour cet état (ou ils ont déjà été assignés à un lot).");
            }

            // 2. Création du lot en base de données
            $reference = 'WAVE-' . $etat->reference_etat . '-' . now()->format('YmdHi');
            $lot = LotPaiementWave::create([
                'reference_lot'   => $reference,
                'date_generation' => now()->toDateString(),
                'statut'          => 'PREPARE',
                'generated_by_id' => $userId,
            ]);

            // 3. Verrouillage : assignation des tickets au lot
            // Ils restent NON_SOLDE car l'argent n'est pas encore parti
            TicketPaiement::whereIn('id', $tickets->pluck('id'))
                ->update(['lot_wave_id' => $lot->id]);

            return $lot;
        });
    }

    /**
     * Étape 2 : Confirme que le transfert a bien été exécuté côté opérateur (Wave/Orange).
     * Solde les tickets, clôture les lignes de production, et rembourse les avances.
     */
    public function confirmerTransfertLot(int $lotId): void
    {
        DB::transaction(function () use ($lotId) {
            // Verrouillage de la ligne du lot pour empêcher les doubles clics
            $lot = LotPaiementWave::lockForUpdate()->findOrFail($lotId);

            if ($lot->statut === 'VALIDE') {
                throw new \Exception("Ce lot Wave a déjà été validé et soldé.");
            }

            $tickets = TicketPaiement::where('lot_wave_id', $lotId)
                ->where('statut', 'NON_SOLDE')
                ->lockForUpdate()
                ->get();

            if ($tickets->isEmpty()) {
                $lot->update(['statut' => 'VALIDE']);
                return;
            }

            foreach ($tickets as $ticket) {
                // 1. On solde le ticket et ses lignes de pointage sources
                $ticket->update(['statut' => 'SOLDE']);
                $ticket->pointageLignes()->update(['statut_ligne' => 'PAYE']);

                // 2. Traitement des retenues sur Avances
                $retenueAAppliquer = $ticket->montant_deduit_manuel;

                if ($retenueAAppliquer > 0) {
                    // lockForUpdate() est crucial ici si l'employé est payé sur plusieurs sections en même temps
                    $avances = Avance::where('personnel_id', $ticket->personnel_id)
                        ->where('statut', 'ACTIVE')
                        ->where('solde_restant', '>', 0)
                        ->orderBy('date_avance')
                        ->lockForUpdate() 
                        ->get();

                    foreach ($avances as $avance) {
                        if ($retenueAAppliquer <= 0) break;

                        // On déduit le maximum possible sur cette avance
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
            }

            // 3. On marque le lot comme définitivement validé
            $lot->update(['statut' => 'VALIDE']);
        });
    }
}