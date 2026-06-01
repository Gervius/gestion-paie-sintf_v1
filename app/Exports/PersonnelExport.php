<?php

namespace App\Exports;

use App\Models\Personnel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

class PersonnelExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithColumnWidths
{
    /**
     * Récupération de la liste triée par nom
     */
    public function collection()
    {
        return Personnel::orderBy('nom')->orderBy('prenom')->get();
    }

    /**
     * En-têtes du fichier Excel
     */
    public function headings(): array
    {
        return [
            ['SINTF - Société Industrielle de Transformation de Fruits'],
            ['LISTE GLOBALE DU PERSONNEL OCCASIONNEL'],
            ['Exporté le : ' . Carbon::now()->format('d/m/Y à H:i')],
            [''], // Ligne vide de séparation
            [
                'MATRICULE',
                'NOM',
                'PRÉNOM(S)',
                'SEXE',
                'TÉLÉPHONE',
                'DATE DE NAISSANCE'
            ]
        ];
    }

    /**
     * Mappage et nettoyage des données par ligne
     */
    public function map($personnel): array
    {
        return [
            $personnel->matricule,
            mb_strtoupper($personnel->nom, 'UTF-8'),
            ucwords(mb_strtolower($personnel->prenom, 'UTF-8')),
            $personnel->sexe ?? '-',
            $personnel->telephone ?? '-',
            $personnel->date_naissance ? Carbon::parse($personnel->date_naissance)->format('d/m/Y') : '-',
        ];
    }

    /**
     * Design et stylisation de la feuille Excel
     */
    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();

        $styles = [
            // Titre de l'entreprise
            'A1' => ['font' => ['bold' => true, 'size' => 12, 'color' => ['argb' => 'FF4B5563']]],
            
            // Titre du document (Bannière verte SINTF)
            'A2:F2' => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            
            // Ligne d'en-tête du tableau (Slate-800)
            'A5:F5' => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E293B']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],

            // Alignements des colonnes de données
            'A6:A' . $lastRow => ['font' => ['bold' => true, 'size' => 10], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]], // Matricules
            'D6:F' . $lastRow => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]], // Sexe, Tél, Date
        ];

        // Fusion pour la bannière de titre
        $sheet->mergeCells('A2:F2');
        $sheet->getRowDimension(2)->setRowHeight(30);
        $sheet->getRowDimension(5)->setRowHeight(22);

        // Application des bordures fines sur la grille de données
        $sheet->getStyle('A5:F' . $lastRow)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => 'E2E8F0']]],
        ]);

        return $styles;
    }

    /**
     * Dimensions des colonnes ajustées pour éviter les textes tronqués
     */
    public function columnWidths(): array
    {
        return [
            'A' => 16, // Matricule
            'B' => 25, // Nom
            'C' => 30, // Prénom
            'D' => 10, // Sexe
            'E' => 18, // Téléphone
            'F' => 20, // Date Naissance
        ];
    }
}