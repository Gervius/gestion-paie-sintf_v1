<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\TicketPaiement;
use App\Models\LotPaiementWave;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsolidationController extends Controller
{
    public function index(Request $request)
    {
        // Sécurité : Permission sensible
        if (!$request->user()->can('voir_consolidation_paie') && !$request->user()->can('*')) {
            abort(403);
        }

        // On récupère les tickets validés non soldés de toute l'usine
        $tickets = TicketPaiement::with(['personnel', 'etatPaiement.section', 'lotWave'])
            ->where('statut', '!=', 'SOLDE')
            ->whereHas('etatPaiement', function ($q) {
                $q->where('statut', 'VALIDE');
            })
            ->get();

        // On cherche s'il existe un lot Wave Global "PREPARE" ou "EN_COURS"
        $currentGlobalLot = LotPaiementWave::where('reference_lot', 'like', 'WAVE-GLOBAL-%')
            ->where('statut', '!=', 'VALIDE')
            ->orderBy('created_at', 'desc')
            ->first();

        // Logique de consolidation par Personnel
        $consolidation = $tickets->groupBy('personnel_id')->map(function ($group) {
            $firstTicket = $group->first();
            return [
                'personnel_id' => $firstTicket->personnel_id,
                'matricule'    => $firstTicket->personnel->matricule,
                'nom_complet'  => $firstTicket->personnel->nom . ' ' . $firstTicket->personnel->prenom,
                'mode_paiement'=> $firstTicket->mode_paiement,
                'total_net'    => $group->sum('montant_net'),
                'sections'     => $group->pluck('etatPaiement.section.nom_section')->unique()->values()->all(),
                'lot_wave_id'  => $firstTicket->lot_wave_id,
                'statut_paiement' => $firstTicket->statut,
            ];
        })->values();

        return Inertia::render('Finance/Consolidation/Index', [
            'data' => $consolidation,
            'currentGlobalLot' => $currentGlobalLot,
            'can' => [
                'payer_especes' => $request->user()->can('payer_especes') || $request->user()->can('*'),
                'gerer_wave'    => $request->user()->can('generer_lot_wave') || $request->user()->can('*'),
            ]
        ]);
    }

    /**
     * Génération du Bordereau Global de Caisse (Toutes sections fusionnées)
     */
    public function telechargerBordereauEspeces(Request $request)
    {
        if (!$request->user()->can('payer_especes') && !$request->user()->can('*')) {
            abort(403);
        }

        // 1. Récupération des tickets
        $tickets = TicketPaiement::with(['personnel'])
            ->where('mode_paiement', 'ESPECES')
            ->where('statut', 'NON_SOLDE')
            ->whereHas('etatPaiement', function ($q) {
                $q->where('statut', 'VALIDE');
            })
            ->get();

        if ($tickets->isEmpty()) {
            return back()->withErrors(['error' => 'Aucun paiement espèces en attente dans l\'usine.']);
        }

        // 2. Fusion par agent (pour qu'il ne signe qu'une seule fois !)
        $lignesBordereau = $tickets->groupBy('personnel_id')->map(function ($group) {
            $first = $group->first();
            return (object)[
                'matricule'   => $first->personnel->matricule,
                'nom_complet' => $first->personnel->nom . ' ' . $first->personnel->prenom,
                'cnib'        => $first->personnel->num_cnib ?? '-',
                'net_a_payer' => $group->sum('montant_net')
            ];
        })->values();

        // 3. Génération du PDF
        $pdf = Pdf::loadView('pdf.bordereau-caisse-global', [
            'lignes'   => $lignesBordereau,
            'totalNet' => $lignesBordereau->sum('net_a_payer'),
            'date'     => now()->format('d/m/Y')
        ])->setPaper('a4', 'portrait');

        return $pdf->download("BORDEREAU_USINE_GLOBAL_" . now()->format('Ymd_Hi') . ".pdf");
    }
}