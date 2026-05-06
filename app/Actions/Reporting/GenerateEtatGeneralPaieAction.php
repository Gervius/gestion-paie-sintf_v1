<?php

namespace App\Actions\Reporting;

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GenerateEtatGeneralPaieAction
{
    public function execute(string $dateDebut, string $dateFin, ?int $siteId = null, ?int $produitId = null): array
    {   
        $debutStrict = Carbon::parse($dateDebut)->startOfDay(); 
        $finStricte = Carbon::parse($dateFin)->endOfDay();

        $query = DB::table('pointage_lignes')
            ->join('pointages', 'pointage_lignes.pointage_id', '=', 'pointages.id')
            ->join('sections', 'pointages.section_id', '=', 'sections.id')
            ->leftJoin('ticket_paiements', 'pointage_lignes.ticket_paiement_id', '=', 'ticket_paiements.id')
            ->leftJoin('produits', 'sections.produit_id', '=', 'produits.id')
            ->whereBetween('pointages.date_pointage', [$debutStrict, $finStricte])
            ->whereNull('pointages.deleted_at') 
            ->where('pointage_lignes.statut_ligne', '!=', 'ABSENT'); 

        if ($siteId) {
            $query->where('pointages.site_id', $siteId);
        }
        if ($produitId) {
            $query->where('sections.produit_id', $produitId);
        }

        $resultatsBruts = $query->select(
            'sections.nom_section',
            
            DB::raw('SUM(pointage_lignes.montant_brut) as montant_a_payer'),
            
            DB::raw('SUM(
                CASE 
                    WHEN ticket_paiements.id IS NOT NULL AND ticket_paiements.montant_brut_cumule > 0 
                    THEN (pointage_lignes.montant_brut / ticket_paiements.montant_brut_cumule) * ticket_paiements.montant_deduit_manuel
                    ELSE 0 
                END
            ) as avance_payee')
        )
        ->groupBy('sections.id', 'sections.nom_section')
        ->orderBy('sections.nom_section')
        ->get();

        $lignesFormatees = $resultatsBruts->map(function ($row) {
            $brut = (float) $row->montant_a_payer;
            $avance = (float) $row->avance_payee;
            
            return [
                'section'         => $row->nom_section,
                'montant_a_payer' => round($brut),
                'avance_payee'    => round($avance),
                'montant_total'   => round($brut - $avance), 
            ];
        });

        $totalBrut = $lignesFormatees->sum('montant_a_payer');
        $totalAvance = $lignesFormatees->sum('avance_payee');
        $totalNet = $lignesFormatees->sum('montant_total');

        return [
            'lignes' => $lignesFormatees,
            'totaux' => [
                'brut'   => $totalBrut,
                'avance' => $totalAvance,
                'net'    => $totalNet,
            ],
            'periode' => [
                'debut' => Carbon::parse($dateDebut)->translatedFormat('d F Y'),
                'fin'   => Carbon::parse($dateFin)->translatedFormat('d F Y'),
            ]
        ];
    }
}