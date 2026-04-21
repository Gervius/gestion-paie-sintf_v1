<?php

namespace App\Services\Finance;

use App\Models\EtatPaiement;
use App\Models\LotPaiementWave;
use App\Models\TicketPaiement;
use Illuminate\Support\Facades\DB;

class WaveExportService
{
    /**
     * Génère un lot Wave spécifiquement pour un état de paiement donné
     */
    public function genererLotPourEtat(EtatPaiement $etat, int $userId): LotPaiementWave
    {
        return DB::transaction(function () use ($etat, $userId) {
            // 1. Trouver les tickets Wave de cet état qui ne sont pas encore dans un lot et non soldés
            $tickets = $etat->tickets()
                ->where('mode_paiement', 'WAVE')
                ->where('statut', 'NON_SOLDE')
                ->whereNull('lot_wave_id') // Sécurité anti-doublon
                ->get();

            if ($tickets->isEmpty()) {
                throw new \Exception("Aucun paiement Wave en attente n'a été trouvé pour cet état (ou ils ont déjà été générés).");
            }

            // 2. Création du lot en base de données
            $reference = 'WAVE-' . $etat->reference_etat . '-' . now()->format('YmdHi');
            $lot = LotPaiementWave::create([
                'reference_lot'   => $reference,
                'date_generation' => now()->toDateString(),
                'statut'          => 'PREPARE',
                'generated_by_id' => $userId,
            ]);

            // 3. Verrouillage : assignation des tickets à ce lot et passage en statut "EN_COURS"
            TicketPaiement::whereIn('id', $tickets->pluck('id'))->update([
                'lot_wave_id' => $lot->id,
                'statut'      => 'EN_COURS',
            ]);

            return $lot;
        });
    }

    /**
     * Génère un lot Wave pour TOUS les tickets validés non payés de l'usine (Global)
     */
    public function genererLotGlobal(int $userId): LotPaiementWave
    {
        return DB::transaction(function () use ($userId) {
            // On récupère tous les tickets WAVE des états validés qui n'ont pas encore de lot
            $tickets = TicketPaiement::where('mode_paiement', 'WAVE')
                ->where('statut', 'NON_SOLDE')
                ->whereHas('etatPaiement', function ($q) {
                    $q->where('statut', 'VALIDE');
                })
                ->with('personnel')
                ->get();

            if ($tickets->isEmpty()) {
                throw new \Exception('Aucun paiement Wave validé en attente.');
            }

            $reference = 'WAVE-GLOBAL-' . now()->format('YmdHis');
            $lot = LotPaiementWave::create([
                'reference_lot'   => $reference,
                'date_generation' => now()->toDateString(),
                'statut'          => 'PREPARE',
                'generated_by_id' => $userId,
            ]);

            TicketPaiement::whereIn('id', $tickets->pluck('id'))
                ->update([
                    'lot_wave_id' => $lot->id,
                    'statut'      => 'EN_COURS',
                ]);

            return $lot;
        });
    }

    /**
     * Valide un lot Wave (Passe les tickets en SOLDE et déduit les avances)
     */
    public function validerLot(LotPaiementWave $lot): void
    {
        if ($lot->statut === 'VALIDE') {
            throw new \Exception('Ce lot Wave a déjà été validé.');
        }

        DB::transaction(function () use ($lot) {
            $tickets = $lot->tickets()->where('statut', 'EN_COURS')->get();

            foreach ($tickets as $ticket) {
                // 1. On solde le ticket et ses lignes
                $ticket->update(['statut' => 'SOLDE']);
                $ticket->pointageLignes()->update(['statut_ligne' => 'PAYE']);

                // 2. Déduction des avances (Identique au paiement espèces)
                $retenueAAppliquer = $ticket->montant_deduit_manuel;

                if ($retenueAAppliquer > 0) {
                    $avances = \App\Models\Avance::where('personnel_id', $ticket->personnel_id)
                        ->where('statut', 'ACTIVE')
                        ->where('solde_restant', '>', 0)
                        ->orderBy('date_avance')
                        ->get();

                    foreach ($avances as $avance) {
                        if ($retenueAAppliquer <= 0) break;

                        $deduction = min($avance->solde_restant, $retenueAAppliquer);
                        $avance->decrement('solde_restant', $deduction);
                        $retenueAAppliquer -= $deduction;

                        if ($avance->solde_restant <= 0) {
                            $avance->update(['statut' => 'SOLDEE']);
                        }
                    }
                }
            }

            // 3. On marque le lot lui-même comme terminé
            $lot->update(['statut' => 'VALIDE']);
        });
    }
}