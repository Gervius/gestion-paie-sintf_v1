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
}