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
use PhpOffice\PhpSpreadsheet\Cell\Coordinate; // 🚨 INDISPENSABLE POUR LES COLONNES DYNAMIQUES

class ExportEtatPointagePivot implements FromArray, WithStyles, WithColumnWidths, WithColumnFormatting
{
    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function array(): array
    {
        $rows = [];

        // --- EN-TÊTE ENTREPRISE ---
        $rows[] = ['SINTF - Société Industrielle de Transformation de Fruits'];
        $rows[] = ['BP 1200 Bobo-Dioulasso - Burkina Faso'];
        $rows[] = ['Tél : 76 69 82 23 / 78 46 96 86'];
        $rows[] = [''];

        // --- TITRE ET FILTRES ---
        $rows[] = [''];
        $rows[] = ['MATRICE DE POINTAGE PAR SECTION (PIVOT)'];
        $rows[] = [''];
        $rows[] = ['Période :', 'Du ' . $this->data['periode']['debut'] . ' au ' . $this->data['periode']['fin']];
        $rows[] = ['Produit :', $this->data['infos']['produit']];
        $rows[] = ['Section :', $this->data['infos']['section']];
        $rows[] = [''];

        // --- EN-TÊTES DU TABLEAU ---
        $headers = ['MATRICULE & NOM', 'TOTAL QTÉ', 'TOTAL BRUT'];
        foreach ($this->data['colonnes'] as $col) {
            $headers[] = $col['label'];
        }
        $rows[] = $headers;

        // --- DONNÉES DU TABLEAU ---
        foreach ($this->data['lignes'] as $ligne) {
            
            // 🚨 L'ASTUCE INTELLIGENTE POUR LE TOTAL QTÉ
            $totalQte = $ligne['total_quantite'] > 0 ? $ligne['total_quantite'] : null;
            if ($totalQte !== null) {
                // Si le chiffre est rond (ex: 15 == 15), on force l'Entier, sinon on garde le Float
                $totalQte = $totalQte == floor($totalQte) ? (int)$totalQte : (float)$totalQte;
            }

            $rowData = [
                $ligne['matricule'] . ' - ' . $ligne['nom_complet'],
                $totalQte,
                $ligne['total_montant'] > 0 ? (int)$ligne['total_montant'] : null,
            ];

            // 🚨 LA MÊME ASTUCE POUR LES JOURS DYNAMIQUES
            foreach ($this->data['colonnes'] as $col) {
                $val = $ligne['pointages_qte'][$col['cle']];
                if ($val > 0) {
                    $rowData[] = $val == floor($val) ? (int)$val : (float)$val;
                } else {
                    $rowData[] = null;
                }
            }
            $rows[] = $rowData;
        }

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->array());
        
        // 🚨 Calcul dynamique de la dernière colonne (ex: "G", "AA", etc.)
        $nbColonnes = 3 + count($this->data['colonnes']); 
        $lastColLetter = Coordinate::stringFromColumnIndex($nbColonnes);

        $styles = [
            'A1' => ['font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF2D4A3E']]],
            'A2:A3' => ['font' => ['size' => 10, 'color' => ['argb' => 'FF4B5563']]],

            // Titre Principal
            'A6:'.$lastColLetter.'6' => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],

            // En-têtes du tableau (Ligne 12)
            'A12:'.$lastColLetter.'12' => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 9],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            
            // Alignements des données (à partir de la colonne B)
            'B13:'.$lastColLetter.$lastRow => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            
            // Mise en évidence de la colonne des Noms et des Totaux Bruts
            'A13:A'.$lastRow => ['font' => ['bold' => true, 'size' => 10]],
            'C13:C'.$lastRow => ['font' => ['bold' => true, 'color' => ['argb' => 'FF065F46']]], // Vert foncé
        ];

        // Fusions des titres
        $sheet->mergeCells('A1:E1');
        $sheet->mergeCells('A6:'.$lastColLetter.'6');
        
        // Quadrillage sur tout le tableau
        $sheet->getStyle('A12:'.$lastColLetter.$lastRow)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        return $styles;
    }

    public function columnWidths(): array
    {
        // On fixe les 3 premières colonnes
        $widths = [
            'A' => 35, // Nom
            'B' => 12, // Qté Total
            'C' => 15, // Montant Total
        ];

        // On boucle sur les colonnes dynamiques pour leur donner une petite largeur (8)
        $colIndex = 4; // La 4ème colonne correspond à 'D'
        foreach ($this->data['colonnes'] as $col) {
            $letter = Coordinate::stringFromColumnIndex($colIndex);
            $widths[$letter] = 8;
            $colIndex++;
        }

        return $widths;
    }

    public function columnFormats(): array
    {
        return [
            // On ne formate QUE le Montant Brut (qui est toujours un entier financier).
            // Pour les quantités, on laisse Excel utiliser son format "Standard" sans virgule inutile !
            'C13:C1000' => '#,##0_-',  
        ];
    }
}