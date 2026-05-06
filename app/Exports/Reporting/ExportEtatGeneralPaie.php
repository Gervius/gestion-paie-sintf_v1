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

class ExportEtatGeneralPaie implements FromArray, WithStyles, WithColumnWidths, WithColumnFormatting
{
    protected $data;
    protected $siteNom;
    protected $produitNom;

    public function __construct(array $data, ?string $siteNom, ?string $produitNom)
    {
        $this->data = $data;
        $this->siteNom = $siteNom ?: 'Tous les sites';
        $this->produitNom = $produitNom ?: 'Tous les produits'; 
    }

    public function array(): array
    {
        $rows = [];

        
        $rows[] = ['SINTF - Société Industrielle de Transformation de Fruits'];
        $rows[] = ['BP 1200 Bobo-Dioulasso - Burkina Faso'];
        $rows[] = ['Tél : 76 69 82 23 / 78 46 96 86 - IFU: 00167885 N / RCCM: BF BBD2021B1591'];
        $rows[] = ['']; // Ligne 4 vide

        
        $rows[] = ['']; // Ligne 5 vide
        $rows[] = ['ÉTAT GÉNÉRAL DE LA PAIE']; // Ligne 6
        $rows[] = ['']; // Ligne 7 vide

        
        $rows[] = ['Période :', 'Du ' . $this->data['periode']['debut'] . ' au ' . $this->data['periode']['fin']];
        $rows[] = ['Site :', $this->siteNom];
        $rows[] = ['Produit :', $this->produitNom]; 
        $rows[] = ['']; // Ligne 11 vide

        
        $rows[] = [
            'N°',
            'SECTION DE PRODUCTION',
            'MONTANT A PAYER',
            'AVANCE PAYÉE',
            'TOTAL À PAYER'
        ];

        // --- DONNÉES DU TABLEAU (Lignes 13 et +) ---
        $index = 1;
        foreach ($this->data['lignes'] as $ligne) {
            $rows[] = [
                $index,
                $ligne['section'],
                $ligne['montant_a_payer'],
                $ligne['avance_payee'] > 0 ? $ligne['avance_payee'] : 0,
                $ligne['montant_total']
            ];
            $index++;
        }

        // --- LIGNES DES TOTAUX FINAUX ---
        $rows[] = ['', 'TOTAL PRODUCTION', $this->data['totaux']['brut'], '', ''];
        $rows[] = ['', 'TOTAL RETENUES (AVANCES)', '', $this->data['totaux']['avance'], ''];
        $rows[] = ['', 'MONTANT TOTAL À PAYER', '', '', $this->data['totaux']['net']];

        return $rows;
    }

    /**
     * Application du design visuel (Couleurs SINTF, Alignements, Bordures)
     */
    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->array());

        $styles = [
            // Style de la raison sociale
            'A1' => ['font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF2D4A3E']]],
            'A2:A3' => ['font' => ['size' => 10, 'color' => ['argb' => 'FF4B5563']]],

            // Style du Titre Principal (Fond Vert Foncé SINTF)
            'A6:E6' => [
                'font' => ['bold' => true, 'size' => 16, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],

            // Style des libellés de filtres
            'A8:A10' => ['font' => ['bold' => true, 'color' => ['argb' => 'FF4B5563']]],
            'B8:B10' => ['font' => ['bold' => true]],

            // Style des en-têtes du tableau de données
            'A12:E12' => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ],
            
            // Centrage de la colonne N°
            'A13:A'.$lastRow => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            
            // Mise en évidence des 3 lignes de totaux
            'B'.($lastRow-2).':E'.$lastRow => ['font' => ['bold' => true]],
        ];

        // Fusions des cellules pour que l'en-tête soit joli
        $sheet->mergeCells('A1:E1');
        $sheet->mergeCells('A2:E2');
        $sheet->mergeCells('A3:E3');
        $sheet->mergeCells('A6:E6');
        
        // Quadrillage (bordures) uniquement pour les données du tableau
        $sheet->getStyle('A13:E'.($lastRow-3))->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        return $styles;
    }

    /**
     * Largeur des colonnes pour un rendu aéré
     */
    public function columnWidths(): array
    {
        return [
            'A' => 8,   // N°
            'B' => 40,  // Section de production
            'C' => 20,  // Brut
            'D' => 20,  // Avance
            'E' => 22,  // Net
        ];
    }

    /**
     * Règle d'or comptable : Formatage natif Excel avec séparateurs de milliers
     */
    public function columnFormats(): array
    {
        return [
            'C13:C1000' => '#,##0_-', // Format 1 830 061
            'D13:D1000' => '#,##0_-',
            'E13:E1000' => '#,##0_-',
        ];
    }
}