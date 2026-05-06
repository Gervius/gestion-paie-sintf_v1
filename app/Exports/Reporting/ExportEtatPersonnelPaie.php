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
        $rows[] = ['SINTF - Société Industrielle de Transformation de Fruits'];
        $rows[] = ['BP 1200 Bobo-Dioulasso - Burkina Faso'];
        $rows[] = ['Tél : 76 69 82 23 / 78 46 96 86'];
        $rows[] = [''];
        $rows[] = [''];
        $rows[] = ['ETAT DE PAIEMENT PAR PERSONNEL OCCASIONNEL'];
        $rows[] = [''];

        // Info Agent
        $rows[] = ['Période :', 'Du ' . $this->data['periode']['debut'] . ' au ' . $this->data['periode']['fin']];
        $rows[] = ['Agent :', $this->data['personnel']['nom_complet'], '', 'Sexe :', $this->data['personnel']['sexe']];
        $rows[] = ['Matricule :', $this->data['personnel']['matricule'], '', 'Né(e) le :', $this->data['personnel']['date_naissance']];
        $rows[] = ['Téléphone :', $this->data['personnel']['telephone']];
        $rows[] = [''];

        // 🚨 EN-TÊTES CORRIGÉS (9 Colonnes, sans Nbre Pointage)
        $rows[] = [
            'PRODUIT', 'SECTION', 'TYPE POINTAGE', 'NBRE JOURS',
            'TAUX', 'QTÉ TOTALE', 'UNITÉ', 'RDT MOYEN', 'MONTANT'
        ];

        // 🚨 DONNÉES CORRIGÉES
        foreach ($this->data['lignes'] as $ligne) {
            
            // Si la valeur est un entier parfait (ex: 15.00), on la force en Integer (15)
            // Sinon, on la laisse en Float (ex: 15.50)
            $taux = $ligne['taux'] == floor($ligne['taux']) ? (int)$ligne['taux'] : (float)$ligne['taux'];
            $qte  = $ligne['quantite_totale'] == floor($ligne['quantite_totale']) ? (int)$ligne['quantite_totale'] : (float)$ligne['quantite_totale'];
            $rdt  = $ligne['rendement_moyen'] == floor($ligne['rendement_moyen']) ? (int)$ligne['rendement_moyen'] : (float)$ligne['rendement_moyen'];

            $rows[] = [
                $ligne['produit'],
                $ligne['section'],
                $ligne['type_pointage'],
                (int)$ligne['nb_jours'],
                $taux,
                $qte,
                $ligne['unite'],
                $rdt,
                (int)$ligne['montant_a_payer'] // Le montant brut est toujours un entier
            ];
        }

        // 🚨 TOTAUX ALIGNÉS SUR LA COLONNE "I"
        $rows[] = [''];
        $rows[] = ['', '', '', '', '', '', '', 'MONTANT TOTAL :', $this->data['finances']['montant_total']];
        $rows[] = ['', '', '', '', '', '', '', 'AVANCE DÉDUITE :', $this->data['finances']['avance_deduite']];
        $rows[] = ['', '', '', '', '', '', '', 'NET À PAYER :', $this->data['finances']['net_a_payer']];

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = count($this->array());
        $dataEndRow = $lastRow - 4; // Dernière ligne de données avant l'espace et les totaux

        $styles = [
            'A1' => ['font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF2D4A3E']]],
            'A2:A3' => ['font' => ['size' => 10, 'color' => ['argb' => 'FF4B5563']]],

            // Titre Principal étendu jusqu'à I
            'A6:I6' => [
                'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],

            'A8:A11' => ['font' => ['bold' => true, 'color' => ['argb' => 'FF4B5563']]],
            'B8:B11' => ['font' => ['bold' => true]],

            // En-têtes du tableau étendus jusqu'à I
            'A13:I13' => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF2D4A3E']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
            
            // Centrer les données numériques
            'C14:H'.$dataEndRow => ['alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]],
            
            // 🚨 NOUVEAUX STYLES POUR LE BLOC DE TOTAUX
            'H'.($lastRow-2).':I'.$lastRow => ['font' => ['bold' => true]],
            'H'.($lastRow-1).':I'.($lastRow-1) => ['font' => ['color' => ['argb' => 'FFDC2626']]], // Rouge (Avance)
            'H'.$lastRow.':I'.$lastRow => ['font' => ['size' => 12, 'color' => ['argb' => 'FF047857']]], // Vert (Net)
        ];

        $sheet->mergeCells('A1:E1');
        $sheet->mergeCells('A2:E2');
        $sheet->mergeCells('A3:E3');
        $sheet->mergeCells('A6:I6');
        
        // Bordures appliquées strictement sur les données, jusqu'à la colonne I
        if ($dataEndRow >= 14) {
            $sheet->getStyle('A13:I'.$dataEndRow)->applyFromArray([
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            ]);
        }

        return $styles;
    }

    public function columnWidths(): array
    {
        // Dimensions ajustées pour les 9 colonnes (A à I)
        return [
            'A' => 20, 'B' => 25, 'C' => 18, 'D' => 12, 'E' => 12, 
            'F' => 15, 'G' => 10, 'H' => 15, 'I' => 18
        ];
    }

    public function columnFormats(): array
    {
        $lastRow = count($this->array());
        
        return [
            // Retire le formatage pour E, F et H. Excel utilisera le format Standard, 
            // ce qui affichera 15.5 si c'est un float et 15 si c'est un int.
            'I14:I1000' => '#,##0_-',  // Montant Brut (Lignes)
            'I'.($lastRow-2).':I'.$lastRow => '#,##0_-',  // Montant (Totaux finaux)
        ];
    }
}