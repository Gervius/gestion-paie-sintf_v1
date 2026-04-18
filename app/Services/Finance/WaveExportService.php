<?php

namespace App\Services\Finance;

use App\Models\LotPaiementWave;
use App\Models\TicketPaiement;
use Illuminate\Support\Facades\DB;

class WaveExportService
{
    /**
     * Génère un lot Wave pour un état spécifique
     */
    public function genererLot(int $etatPaiementId, int $userId): LotPaiementWave
    {
        return $this->processLotCreation(
            TicketPaiement::where('etat_paiement_id', $etatPaiementId)
                ->where('mode_paiement', 'WAVE')
                ->where('statut', 'NON_SOLDE'),
            $userId
        );
    }

    /**
     * NOUVEAU : Génère un lot Wave GLOBAL pour TOUS les états validés de l'entreprise
     */
    public function genererLotGlobal(int $userId): LotPaiementWave
    {
        $query = TicketPaiement::where('mode_paiement', 'WAVE')
            ->where('statut', 'NON_SOLDE')
            ->whereHas('etatPaiement', function ($q) {
                $q->where('statut', 'VALIDE'); // Seulement les états visés par le Chef de section/Admin
            });

        return $this->processLotCreation($query, $userId);
    }

    /**
     * Logique commune de création du lot
     */
    private function processLotCreation($query, int $userId): LotPaiementWave
    {
        return DB::transaction(function () use ($query, $userId) {
            $tickets = $query->with('personnel')->get();

            if ($tickets->isEmpty()) {
                throw new \Exception('Aucun ticket Wave validé en attente de paiement.');
            }

            $reference = 'WAVE-' . now()->format('Ymd-His');
            
            $lot = LotPaiementWave::create([
                'reference_lot'   => $reference,
                'date_generation' => now()->toDateString(),
                'statut'          => 'PREPARE',
                'generated_by_id' => $userId,
            ]);
            
            TicketPaiement::whereIn('id', $tickets->pluck('id'))
                ->update([
                    'lot_wave_id' => $lot->id,
                    'statut'      => 'EN_COURS', // ou SOLDE directement si tu ne gères pas le retour API de Wave
                ]);

            // Note : L'export CSV physique (Excel::download) se fera dans le contrôleur via le LotPaiementWave généré.
            return $lot;
        });
    }
}