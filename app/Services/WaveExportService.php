<?php

namespace App\Services\Finance;

use App\Models\LotPaiementWave;
use App\Models\TicketPaiement;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\WaveLotExport;

class WaveExportService
{
    public function genererLot(int $etatPaiementId, int $userId): LotPaiementWave
    {
        return DB::transaction(function () use ($etatPaiementId, $userId) {
            $tickets = TicketPaiement::where('etat_paiement_id', $etatPaiementId)
                ->where('mode_paiement', 'WAVE')
                ->where('statut', 'NON_SOLDE')
                ->with('personnel')
                ->get();

            if ($tickets->isEmpty()) {
                throw new \Exception('Aucun ticket Wave en attente pour cet état.');
            }

            $reference = 'WAVE-' . now()->format('YmdHis');
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