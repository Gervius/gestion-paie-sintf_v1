<?php

namespace App\Exports;

use App\Models\LotPaiementWave;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class WaveBulkExport implements FromCollection, WithHeadings, WithMapping
{
    protected $lot;

    public function __construct(LotPaiementWave $lot)
    {
        $this->lot = $lot;
    }

    public function collection()
    {
        // On récupère les tickets de ce lot avec les infos du personnel
        return $this->lot->tickets()->with('personnel')->get();
    }

    public function headings(): array
    {
        // Les colonnes standards généralement attendues par les opérateurs Mobile Money
        return [
            'Prenom',
            'Nom',
            'Telephone',
            'Montant'
        ];
    }

    public function map($ticket): array
    {
        return [
            $ticket->personnel->prenom,
            $ticket->personnel->nom,
            // Priorité au numéro Wave, sinon on prend le téléphone classique
            $ticket->personnel->tel_compte_wave ?? $ticket->personnel->telephone,
            $ticket->montant_net,
        ];
    }
}