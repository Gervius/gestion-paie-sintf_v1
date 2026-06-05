<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\Reporting\GenerateEtatPersonnelAction;
use App\Models\Site;
use App\Models\Produit;
use App\Models\Section;
use App\Models\Personnel;
use App\Exports\Reporting\ExportEtatGeneralPaie;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\Reporting\ExportEtatPersonnelPaie;
use App\Actions\Reporting\GenerateEtatPointageSectionAction;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\Reporting\ExportEtatPointagePivot;
use App\Actions\Reporting\GenerateEtatGeneralPaieAction;
use Illuminate\Routing\Controllers\HasMiddleware; 
use Illuminate\Routing\Controllers\Middleware;

class ReportingController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [

            new Middleware('can:view-reporting'), 
        ];
    }
    /**
     * Affiche la page principale du reporting (Le Dashboard React)
     */
    public function index()
    {
        return Inertia::render('Reporting/Index', [
            'sites'    => Site::orderBy('nom_site')->get(['id', 'nom_site']),
            'produits' => Produit::orderBy('nom_produit')->get(['id', 'nom_produit']),
            'sections' => Section::orderBy('nom_section')->get(['id', 'nom_section']),
            'personnels' => Personnel::orderBy('nom')->get(['id', 'nom', 'prenom', 'matricule']),
        ]);
    }

    /**
     * API Endpoint : Génère les données pour l'État Général de la Paie
     */
    public function getEtatGeneral(Request $request, GenerateEtatGeneralPaieAction $action)
    {
        $filters = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'site_id'    => 'nullable|integer',
            'produit_id' => 'nullable|integer',
        ]);

        $data = $action->execute(
            $filters['date_debut'], 
            $filters['date_fin'], 
            $filters['site_id'] ?? null, 
            $filters['produit_id'] ?? null
        );

        return response()->json($data);
    }

    public function exportEtatGeneralPdf(Request $request, GenerateEtatGeneralPaieAction $action)
    {
        // Même validation que pour l'API
        $filters = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'site_id'    => 'nullable|integer',
            'produit_id' => 'nullable|integer',
        ]);

        $data = $action->execute(
            $filters['date_debut'], 
            $filters['date_fin'], 
            $filters['site_id'] ?? null, 
            $filters['produit_id'] ?? null
        );

        $siteId = $filters['site_id'] ?? null;
        $produitId = $filters['produit_id'] ?? null;

        $site = $siteId ? Site::find($siteId) : null;
        $produit = $produitId ? Produit::find($produitId) : null;

        $pdf = Pdf::loadView('pdf.etat-general', [
            'data' => $data,
            'site_nom' => $site ? $site->nom_site : null,
            'produit_nom' => $produit ? $produit->nom_produit : null,
        ]);

        return $pdf->download('Etat_General_Paie_' . now()->format('Ymd_Hi') . '.pdf');
    }

    public function exportEtatGeneralExcel(Request $request, GenerateEtatGeneralPaieAction $action)
    {
        $filters = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'site_id'    => 'nullable|integer',
            'produit_id' => 'nullable|integer',
        ]);

        $data = $action->execute(
            $filters['date_debut'], 
            $filters['date_fin'], 
            $filters['site_id'] ?? null, 
            $filters['produit_id'] ?? null
        );

        $siteId = $filters['site_id'] ?? null;
        $produitId = $filters['produit_id'] ?? null;

        $site = $siteId ? Site::find($siteId) : null;
        $produit = $produitId ? Produit::find($produitId) : null;

        return Excel::download(
            new ExportEtatGeneralPaie(
                $data, 
                $site ? $site->nom_site : null, 
                $produit ? $produit->nom_produit : null
            ), 
            'Etat_General_Paie_' . now()->format('Y_m_d_Hi') . '.xlsx'
        );
    }

    public function getEtatPersonnel(Request $request, GenerateEtatPersonnelAction $action)
    {
        $filters = $request->validate([
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after_or_equal:date_debut',
            'personnel_id' => 'required|integer|exists:personnels,id',
            'site_id'      => 'nullable|integer', // 🚨 NOUVEAU
            'produit_id'   => 'nullable|integer',
            'section_id'   => 'nullable|integer',
        ]);
        $data = $action->execute($filters['personnel_id'], $filters['date_debut'], $filters['date_fin'], $filters['site_id'] ?? null, $filters['produit_id'] ?? null, $filters['section_id'] ?? null);
        return response()->json($data);
    }

    public function exportEtatPersonnelPdf(Request $request, GenerateEtatPersonnelAction $action)
    {
        $filters = $request->validate([
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after_or_equal:date_debut',
            'personnel_id' => 'required|integer|exists:personnels,id',
            'site_id'      => 'nullable|integer', // 🚨 NOUVEAU
            'produit_id'   => 'nullable|integer',
            'section_id'   => 'nullable|integer',
        ]);
        $data = $action->execute($filters['personnel_id'], $filters['date_debut'], $filters['date_fin'], $filters['site_id'] ?? null, $filters['produit_id'] ?? null, $filters['section_id'] ?? null);
        $pdf = Pdf::loadView('pdf.etat-personnel', ['data' => $data]);
        return $pdf->download('Fiche_Agent_' . $data['personnel']['matricule'] . '_' . now()->format('Ymd') . '.pdf');
    }

    public function exportEtatPersonnelExcel(Request $request, GenerateEtatPersonnelAction $action)
    {
        $filters = $request->validate([
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after_or_equal:date_debut',
            'personnel_id' => 'required|integer|exists:personnels,id',
            'site_id'      => 'nullable|integer', // 🚨 NOUVEAU
            'produit_id'   => 'nullable|integer',
            'section_id'   => 'nullable|integer',
        ]);
        $data = $action->execute($filters['personnel_id'], $filters['date_debut'], $filters['date_fin'], $filters['site_id'] ?? null, $filters['produit_id'] ?? null, $filters['section_id'] ?? null);
        return Excel::download(new ExportEtatPersonnelPaie($data), 'Fiche_Agent_' . $data['personnel']['matricule'] . '_' . now()->format('Ymd_Hi') . '.xlsx');
    }


    //matrice pivot
    public function getEtatPointageSection(Request $request, GenerateEtatPointageSectionAction $action)
    {
        $filters = $request->validate([
            'date_debut'    => 'required|date',
            'date_fin'      => 'required|date|after_or_equal:date_debut',
            'site_id'       => 'nullable|integer', // 🚨 NOUVEAU
            'produit_id'    => 'nullable|integer',
            'section_id'    => 'nullable|integer',
            'type_pointage' => 'nullable|string|in:RENDEMENT,JOURNALIER',
        ]);

        $debut = \Carbon\Carbon::parse($filters['date_debut']);
        $fin = \Carbon\Carbon::parse($filters['date_fin']);
        if ($debut->diffInDays($fin) > 31) {
            throw \Illuminate\Validation\ValidationException::withMessages(['date_fin' => 'La période ne doit pas dépasser 31 jours.']);
        }

        $data = $action->execute($filters['date_debut'], $filters['date_fin'], $filters['site_id'] ?? null, $filters['produit_id'] ?? null, $filters['section_id'] ?? null, $filters['type_pointage'] ?? null);
        return response()->json($data);
    }


    public function exportEtatPointageSectionExcel(Request $request, GenerateEtatPointageSectionAction $action)
    {
        $filters = $request->validate([
            'date_debut'    => 'required|date',
            'date_fin'      => 'required|date|after_or_equal:date_debut',
            'site_id'       => 'nullable|integer', // 🚨 NOUVEAU
            'produit_id'    => 'nullable|integer',
            'section_id'    => 'nullable|integer',
            'type_pointage' => 'nullable|string|in:RENDEMENT,JOURNALIER',
        ]);

        $debut = \Carbon\Carbon::parse($filters['date_debut']);
        $fin = \Carbon\Carbon::parse($filters['date_fin']);
        if ($debut->diffInDays($fin) > 31) { abort(400, "Période trop longue (Max 31 jours)."); }

        $data = $action->execute($filters['date_debut'], $filters['date_fin'], $filters['site_id'] ?? null, $filters['produit_id'] ?? null, $filters['section_id'] ?? null, $filters['type_pointage'] ?? null);
        return Excel::download(new ExportEtatPointagePivot($data), 'Matrice_Pivot_' . $debut->format('d_m') . '_au_' . $fin->format('d_m_Y') . '.xlsx');
    }


    public function exportEtatPointageSectionPdf(Request $request, GenerateEtatPointageSectionAction $action)
    {
        $filters = $request->validate([
            'date_debut'    => 'required|date',
            'date_fin'      => 'required|date|after_or_equal:date_debut',
            'site_id'       => 'nullable|integer', // 🚨 NOUVEAU
            'produit_id'    => 'nullable|integer',
            'section_id'    => 'nullable|integer',
            'type_pointage' => 'nullable|string|in:RENDEMENT,JOURNALIER', 
        ]);

        $debut = \Carbon\Carbon::parse($filters['date_debut']);
        $fin = \Carbon\Carbon::parse($filters['date_fin']);
        if ($debut->diffInDays($fin) > 6) { abort(400, "L'export PDF est limité à 7 jours."); }
        if (empty($filters['type_pointage'])) { abort(400, "Veuillez sélectionner un type de pointage pour le PDF."); }

        $data = $action->execute($filters['date_debut'], $filters['date_fin'], $filters['site_id'] ?? null, $filters['produit_id'] ?? null, $filters['section_id'] ?? null, $filters['type_pointage']);
        
        $pdf = Pdf::loadView('pdf.etat-pointage-pivot', ['data' => $data])->setPaper('a4', 'landscape');
        return $pdf->download('Matrice_Pivot_' . $debut->format('d_m') . '_au_' . $fin->format('d_m_Y') . '.pdf');
    }
}