<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;
use Illuminate\Support\Facades\DB;

class AppliquerGarantieJournaliereAction
{
    /**
     * Calcule et applique le complément pour les agents sous le rendement.
     * OPTIMISÉ : Exécution en une seule requête SQL (Zero N+1).
     */
    public function execute(Pointage $pointage): void
    {
        if (!$pointage->garantie_journaliere_active) {
            return;
        }

        $pointage->loadMissing('section');
        $tauxJournalierForfait = $pointage->section->taux_journalier;
        $tauxCentimes = (int) round($tauxJournalierForfait * 100);

        // INTENTION : Une seule requête UPDATE massive.
        // PostgreSQL calcule lui-même la différence (compensation) ligne par ligne
        // de manière atomique et instantanée.
        $pointage->lignes()
            ->where('statut_ligne', 'EN_ATTENTE') 
            ->where('montant_brut', '<', $tauxJournalierForfait)
            ->update([
                'montant_compensation_centimes' => DB::raw("{$tauxCentimes} - montant_brut_centimes"),
                'montant_brut_centimes' => $tauxCentimes,
                'montant_brut' => $tauxJournalierForfait,
            ]);
    }
}