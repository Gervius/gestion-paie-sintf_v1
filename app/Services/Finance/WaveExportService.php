<?php

namespace App\Services\Finance;

use App\Models\LotPaiementWave;
use App\Models\TicketPaiement;
use Illuminate\Support\Facades\DB;

class WaveExportService
{
    /**
     * Génère un lot Wave pour TOUS les tickets validés non payés de l'usine
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