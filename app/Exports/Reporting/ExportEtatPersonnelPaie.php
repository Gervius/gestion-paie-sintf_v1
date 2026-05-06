<?php

namespace App\Exports\Reporting;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ExportEtatPersonnelPaie implements FromArray, WithStyles, WithColumnWidths, WithColumnFormatting
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $rows = [];

        // --- EN-TÊTE ENTREPRISE (Lignes 1 à 4) ---
        $rows[] = ['SINTF - Société Industrielle de Transformation de Fruits'];
        $rows[] = ['BP 1200 Bobo-Dioulasso - Burkina Faso'];
        $rows[] = ['Tél : 76 69 82 23 / 78 46 96 86'];
        $rows[] = [''];

        // --- TITRE (Lignes 5 à 7) ---
        $rows[] = [''];
        $rows[] = ['DÉTAIL DE PRODUCTION ET PAIEMENT'];
        $rows[] = [''];

        // --- INFO AGENT & FILTRES (Lignes 8 à 12) ---
        $rows[] = ['Période :', 'Du ' . $this->data['periode']['debut'] . ' au ' . $this->data['periode']['fin']];
        $rows[] = ['Agent :', $this->data['personnel']['nom_complet']];
        $rows[] = ['Matricule :', $this->data['personnel']['matricule']];
        $rows[] = ['Téléphone :', $this->data['personnel']['telephone']];
        $rows[] = [''];

        // --- EN-TÊTES DU TABLEAU (Ligne 13) ---
        $rows[] = [
            'PRODUIT',
            'SECTION',
            'TAUX',
            'QTÉ TOTALE',
            'UNITÉ',
            'JOURS',
            'RDT MOYEN',
            'MONTANT BRUT'
        ];

        // --- DONNÉES DU TABLEAU (Lignes 14 et +) ---
        foreach ($this->data['lignes'] as $ligne) {
            $rows[] = [
                $ligne['produit'],
                $ligne['section'],
                $ligne['taux'],
                $ligne['quantite_totale'],
                $ligne['unite'],
                $ligne['nb_jours'],
                $ligne['rendement_moyen'],
                $ligne['montant_a_payer']
            ];
        }

        // --- LIGNE DU TOTAL FINAL ---
        $rows[] = ['', '', '', '', '', '', 'TOTAL À PAYER', $this->data['total_a_payer']];

        return $rows;
    }

    /**
     * Application du design visuel
     */
    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->array());

        $styles = [
            'A1' => ['font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF2D4A3E']]],
            'A2:A3' => ['font' => ['size' => 10, 'color' => ['argb' => 'FF4B5563']]],

            // Titre Principal
            'A6:H6' => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],

            // Fiche signalétique Agent
            'A8:A11' => ['font' => ['bold' => true, 'color' => ['argb' => 'FF4B5563']]],
            'B8:B11' => ['font' => ['bold' => true]],

            // En-têtes du tableau
            'A13:H13' => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ],
            
            // Alignements des colonnes de données
            'C14:F'.$lastRow => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            
            // Mise en évidence du Total
            'G'.$lastRow.':H'.$lastRow => [
                'font' => ['bold' => true, 'size' => 12],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFF9FAFB']],
            ],
        ];

        // Fusions
        $sheet->mergeCells('A1:E1');
        $sheet->mergeCells('A2:E2');
        $sheet->mergeCells('A3:E3');
        $sheet->mergeCells('A6:H6');
        
        // Bordures du tableau uniquement
        $sheet->getStyle('A13:H'.($lastRow-1))->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        return $styles;
    }

    /**
     * Largeur des colonnes
     */
    public function columnWidths(): array
    {
        return [
            'A' => 20, // Produit
            'B' => 30, // Section
            'C' => 12, // Taux
            'D' => 15, // Qté
            'E' => 10, // Unité
            'F' => 10, // Jours
            'G' => 15, // Rdt Moyen
            'H' => 18, // Montant Brut
        ];
    }

    /**
     * Formatage natif Excel
     */
    public function columnFormats(): array
    {
        return [
            'C14:C1000' => '#,##0.##', // Gère les décimales dynamiquement (0,21 ou 1500)
            'D14:D1000' => '#,##0.##', // Quantité
            'G14:G1000' => '#,##0.##', // Rendement
            'H14:H1000' => '#,##0_-',  // Montant Brut (entier comptable)
        ];
    }
}