<?php

namespace App\Exports;

use App\Models\LotPaiementWave;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class WaveBulkExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $lot;

    public function __construct(LotPaiementWave $lot)
    {
        $this->lot = $lot;
    }

    public function collection()
    {
        // 💡 CORRECTION : On enlève le .site de la section 
        // et on le récupère via le personnel (personnel.siteTravail)
        return $this->lot->tickets()
            ->with(['personnel.siteTravail', 'etatPaiement.section'])
            ->get();
    }

    public function headings(): array
    {
        return [
            'NOM ET PRENOM', 
            'NUMERO DE TELEPHONE', 
            'MONTANT', 
            'MOTIF', 
            'CNIB', 
            'REFERENCE'
        ];
    }

    public function map($ticket): array
    {
        $personnel = $ticket->personnel;
        $section = $ticket->etatPaiement->section;
        $site = $personnel->siteTravail; // Récupération propre du site via l'agent
        
        // Récupération de la date de début de l'état de paiement
        $dateDebut = Carbon::parse($ticket->etatPaiement->date_debut);
        $mois = $dateDebut->translatedFormat('F');  // Janvier, Février...
        $annee = $dateDebut->year;

        $nomSection = $section ? strtoupper($section->nom_section) : 'PRODUCTION';
        $nomSite = $site ? strtoupper($site->nom_site) : 'SINTF';

        // Motif court : Section + Mois + Année + Site
        $motif = sprintf("%s %s %s %s", $nomSection, $mois, $annee, $nomSite);

        return [
            // 1. NOM ET PRENOM
            strtoupper($personnel->nom . ' ' . $personnel->prenom),
            
            // 2. TÉLÉPHONE
            $this->formatPhone($personnel->tel_compte_wave ?? $personnel->telephone),
            
            // 3. MONTANT
            $ticket->montant_net,
            
            // 4. MOTIF
            $motif,
            
            // 5. CNIB
            $personnel->num_cnib ?? 'N/A',
            
            // 6. RÉFÉRENCE
            $ticket->reference_paiement ?? 'TICK-'.$ticket->id
        ];
    }

    /**
     * Utilitaire de formatage pour l'opérateur Wave (+226)
     */
    private function formatPhone($n) 
    {
        $n = preg_replace('/[^0-9]/', '', (string)$n);
        
        if (strlen($n) === 8) {
            return '+226' . $n;
        }
        
        if (strlen($n) === 11 && str_starts_with($n, '226')) {
            return '+' . $n;
        }
        
        return $n;
    }
}