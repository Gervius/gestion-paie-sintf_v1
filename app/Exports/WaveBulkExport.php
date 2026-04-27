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
        $site = $personnel->siteTravail; 
        
        $dateDebut = \Carbon\Carbon::parse($ticket->etatPaiement->date_debut);
        $mois = $dateDebut->translatedFormat('F');  
        $annee = $dateDebut->year;

        $nomSection = $section ? strtoupper($section->nom_section) : 'PRODUCTION';
        $nomSite = $site ? strtoupper($site->nom_site) : 'SINTF';

        $motif = sprintf("%s %s %s %s", $nomSection, $mois, $annee, $nomSite);

        // Récupération de la donnée brute exacte
        $numeroTelephone = $personnel->tel_compte_wave 
                           ?? ($personnel->a_telephone_propre ? $personnel->telephone : $personnel->telephone_sc);

        return [
            strtoupper($personnel->nom . ' ' . $personnel->prenom),
            
            // On injecte le numéro tel qu'il est en base de données
            $numeroTelephone,
            
            $ticket->montant_net,
            $motif,
            $personnel->num_cnib ?? 'N/A',
            $ticket->reference_paiement ?? 'TICK-'.$ticket->id
        ];
    }
    

    /**
     * Utilitaire de formatage pour l'opérateur Wave (+226)
     */
    /**
     * Utilitaire de formatage pour l'opérateur Wave (Format Local)
     */
    private function formatPhone($n) 
    {
        // 1. Ne garder que les chiffres
        $n = preg_replace('/[^0-9]/', '', (string) $n);

        // 2. Si le numéro commence par 226 et fait plus de 8 caractères, on coupe le 226
        if (strlen($n) > 8 && str_starts_with($n, '226')) {
            $n = substr($n, 3);
        }

        return $n;
    }
}