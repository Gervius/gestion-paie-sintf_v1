<?php

namespace App\Actions\Pointage;

use App\Models\Pointage;

class AppliquerGarantieJournaliereAction
{
    /**
     * Calcule et applique le complément pour les agents sous le rendement.
     */
    public function execute(Pointage $pointage): void
    {

        
        if (!$pointage->garantie_journaliere_active) {
            return;
        }

        
        $pointage->loadMissing('section');

        
        $tauxJournalierForfait = $pointage->section->taux_journalier;

        
        $lignesACompenser = $pointage->lignes()
            ->where('statut_ligne', 'EN_ATTENTE') 
            ->where('montant_brut', '<', $tauxJournalierForfait)
            ->get();

        foreach ($lignesACompenser as $ligne) {
            $compensation = $tauxJournalierForfait - $ligne->montant_brut;
            
            $ligne->update([

                'montant_brut' => $tauxJournalierForfait, 
                'montant_brut_centimes' => (int) round($tauxJournalierForfait * 100),
                'montant_compensation_centimes' => (int) round($compensation * 100), 
                
            ]);
        }
    }
}