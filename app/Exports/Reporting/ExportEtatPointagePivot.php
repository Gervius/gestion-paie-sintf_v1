<?php

namespace App\Exports\Reporting;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate; 

class ExportEtatPointagePivot implements FromArray, WithStyles, WithColumnWidths, WithColumnFormatting
{
    protected $data;
    protected $isTous;
    protected $typeFiltre;

    public function __construct(array $data)
    {
        $this->data = $data;
        $this->typeFiltre = $data['infos']['type_pointage'];
        $this->isTous = $this->typeFiltre === 'Tous les types';
    }

    public function array(): array
    {
        $rows = [];
        $rows[] = ['SINTF - Société Industrielle de Transformation de Fruits'];
        $rows[] = ['BP 1200 Bobo-Dioulasso - Burkina Faso'];
        $rows[] = [''];
        $rows[] = ['ETAT DE POINTAGE PAR SECTION'];
        $rows[] = [''];
        $rows[] = ['Période :', 'Du ' . $this->data['periode']['debut'] . ' au ' . $this->data['periode']['fin']];
        $rows[] = ['Type Pointage :', $this->typeFiltre];
        $rows[] = ['Produit :', $this->data['infos']['produit']];
        $rows[] = ['Section :', $this->data['infos']['section']];
        $rows[] = [''];

        // 🚨 CONSTRUCTION DYNAMIQUE DES EN-TÊTES (Style React : 2 Lignes)
        $headers1 = ['MATRICULE & NOM'];
        $headers2 = ['']; // Deuxième ligne vide pour la fusion de la colonne A

        if ($this->isTous) {
            $headers1[] = 'TOT. REND';
            $headers2[] = '';
            $headers1[] = 'TOT. JOUR';
            $headers2[] = '';
        } else {
            $headers1[] = 'QTÉ TOT.';
        }
        
        $headers1[] = 'TOTAL BRUT';
        if ($this->isTous) {
            $headers2[] = ''; // Sous-cellule vide pour la fusion
        }

        foreach ($this->data['colonnes'] as $col) {
            $headers1[] = $col['label']; // La date (ex: 12/05)
            
            if ($this->isTous) {
                $headers1[] = ''; // Cellule vide à côté de la date pour la fusion horizontale
                $headers2[] = 'REND'; // Sous-colonne 1
                $headers2[] = 'JOUR'; // Sous-colonne 2
            }
        }
        
        $rows[] = $headers1; // Ligne 11
        if ($this->isTous) {
            $rows[] = $headers2; // Ligne 12 (Seulement si "Tous les types")
        }

        // 🚨 CONSTRUCTION DYNAMIQUE DES LIGNES DE DONNÉES
        foreach ($this->data['lignes'] as $ligne) {
            $rowData = [$ligne['matricule'] . ' - ' . $ligne['nom_complet']];

            if ($this->isTous) {
                $rowData[] = $ligne['total_quantite_rend'] > 0 ? (float)$ligne['total_quantite_rend'] : null;
                $rowData[] = $ligne['total_quantite_jour'] > 0 ? (float)$ligne['total_quantite_jour'] : null;
            } else {
                $valQte = $this->typeFiltre === 'RENDEMENT' ? $ligne['total_quantite_rend'] : $ligne['total_quantite_jour'];
                $rowData[] = $valQte > 0 ? (float)$valQte : null;
            }
            $rowData[] = $ligne['total_montant'] > 0 ? (int)$ligne['total_montant'] : null;

            foreach ($this->data['colonnes'] as $col) {
                if ($this->isTous) {
                    $vRend = $ligne['pointages_qte'][$col['cle']]['RENDEMENT'];
                    $vJour = $ligne['pointages_qte'][$col['cle']]['JOURNALIER'];
                    $rowData[] = $vRend > 0 ? (float)$vRend : null;
                    $rowData[] = $vJour > 0 ? (float)$vJour : null;
                } else {
                    $v = $ligne['pointages_qte'][$col['cle']][$this->typeFiltre];
                    $rowData[] = $v > 0 ? (float)$v : null;
                }
            }
            $rows[] = $rowData;
        }

        // 🚨 CONSTRUCTION DYNAMIQUE DE LA LIGNE FINALE
        $totalRow = ['TOTAL GLOBAL'];
        if ($this->isTous) {
            $tRend = $this->data['totaux']['global_quantite_rend'];
            $tJour = $this->data['totaux']['global_quantite_jour'];
            $totalRow[] = $tRend > 0 ? (float)$tRend : null;
            $totalRow[] = $tJour > 0 ? (float)$tJour : null;
        } else {
            $tGlob = $this->typeFiltre === 'RENDEMENT' ? $this->data['totaux']['global_quantite_rend'] : $this->data['totaux']['global_quantite_jour'];
            $totalRow[] = $tGlob > 0 ? (float)$tGlob : null;
        }
        $totalRow[] = $this->data['totaux']['global_montant'] > 0 ? (int)$this->data['totaux']['global_montant'] : null;

        foreach ($this->data['colonnes'] as $col) {
            if ($this->isTous) {
                $vRend = $this->data['totaux']['jours'][$col['cle']]['RENDEMENT'];
                $vJour = $this->data['totaux']['jours'][$col['cle']]['JOURNALIER'];
                $totalRow[] = $vRend > 0 ? (float)$vRend : null;
                $totalRow[] = $vJour > 0 ? (float)$vJour : null;
            } else {
                $v = $this->data['totaux']['jours'][$col['cle']][$this->typeFiltre];
                $totalRow[] = $v > 0 ? (float)$v : null;
            }
        }
        $rows[] = $totalRow;

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->array());
        
        $nbColonnesFixes = $this->isTous ? 4 : 3;
        $nbColonnesDynamiques = count($this->data['colonnes']) * ($this->isTous ? 2 : 1);
        $totalCols = $nbColonnesFixes + $nbColonnesDynamiques;
        $lastColLetter = Coordinate::stringFromColumnIndex($totalCols);
        
        // Calcul des lignes d'en-tête (1 ligne ou 2 lignes)
        $headerEndRow = $this->isTous ? 12 : 11;
        $dataStartRow = $this->isTous ? 13 : 12;

        $styles = [
            'A1' => ['font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF2D4A3E']]],
            'A4:'.$lastColLetter.'4' => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            // Style de l'en-tête du tableau (Gris foncé, texte blanc)
            'A11:'.$lastColLetter.$headerEndRow => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 9],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E293B']], // Slate-800
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            ],
            // Centrer les données
            'B'.$dataStartRow.':'.$lastColLetter.$lastRow => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            'A'.$dataStartRow.':A'.$lastRow => ['font' => ['bold' => true, 'size' => 10]],
            
            // Ligne Totaux Grise
            'A'.$lastRow.':'.$lastColLetter.$lastRow => [
                'font' => ['bold' => true, 'size' => 11],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFE5E7EB']], 
            ],
        ];

        // Colonne Montant (En vert foncé comme sur React)
        $montantColLetter = Coordinate::stringFromColumnIndex($nbColonnesFixes);
        $styles[$montantColLetter.'11:'.$montantColLetter.$lastRow] = ['font' => ['bold' => true, 'color' => ['argb' => 'FF065F46']]];

        $sheet->mergeCells('A1:E1');
        $sheet->mergeCells('A4:'.$lastColLetter.'4');

        // 🚨 FUSION DE CELLULES ET COULEURS (La Magie Excel)
        if ($this->isTous) {
            // Fusion verticale des colonnes fixes (A, B, C, D) sur les lignes 11 et 12
            $sheet->mergeCells('A11:A12');
            $sheet->mergeCells('B11:B12');
            $sheet->mergeCells('C11:C12');
            $sheet->mergeCells('D11:D12');
            
            $colIndex = 5; // On commence aux colonnes dynamiques (E)
            foreach ($this->data['colonnes'] as $col) {
                $startL = Coordinate::stringFromColumnIndex($colIndex);
                $endL = Coordinate::stringFromColumnIndex($colIndex + 1);
                
                // Fusion horizontale de la date (Ligne 11)
                $sheet->mergeCells($startL.'11:'.$endL.'11');
                
                // 🎨 Injection des couleurs React dans les colonnes !
                // Rendement (Orange)
                $styles[$startL.$dataStartRow.':'.$startL.($lastRow - 1)] = [
                    'font' => ['color' => ['argb' => 'FFEA580C'], 'bold' => true],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFFFF7ED']]
                ];
                // Journalier (Bleu)
                $styles[$endL.$dataStartRow.':'.$endL.($lastRow - 1)] = [
                    'font' => ['color' => ['argb' => 'FF2563EB'], 'bold' => true],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFEFF6FF']]
                ];

                // Textes en couleur sur la ligne des totaux finaux
                $styles[$startL.$lastRow] = ['font' => ['color' => ['argb' => 'FFEA580C'], 'bold' => true]];
                $styles[$endL.$lastRow] = ['font' => ['color' => ['argb' => 'FF2563EB'], 'bold' => true]];

                $colIndex += 2; // On avance de 2 en 2
            }
        }

        // Application des bordures partout
        $sheet->getStyle('A11:'.$lastColLetter.$lastRow)->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        ]);

        return $styles;
    }

    public function columnWidths(): array
    {
        $widths = ['A' => 35];
        $nbColonnesFixes = $this->isTous ? 4 : 3;
        
        if ($this->isTous) {
            $widths['B'] = 11;
            $widths['C'] = 11;
            $widths['D'] = 15; // Montant Total
        } else {
            $widths['B'] = 12;
            $widths['C'] = 15; // Montant Total
        }

        $colIndex = $nbColonnesFixes + 1;
        $nbJours = count($this->data['colonnes']) * ($this->isTous ? 2 : 1);
        
        for ($i = 0; $i < $nbJours; $i++) {
            $letter = Coordinate::stringFromColumnIndex($colIndex);
            // Plus fin si on affiche REND et JOUR côte à côte, plus large si on n'en affiche qu'un
            $widths[$letter] = $this->isTous ? 8 : 10;
            $colIndex++;
        }
        return $widths;
    }

    public function columnFormats(): array
    {
        $dataStartRow = $this->isTous ? 13 : 12;
        $montantColLetter = Coordinate::stringFromColumnIndex($this->isTous ? 4 : 3);
        
        return [
            // Le montant Brut est parfaitement formaté sans décimales inutiles (Ex: 15 000)
            $montantColLetter.$dataStartRow.':'.$montantColLetter.'1000' => '#,##0_-',  
        ];
    }
}