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

class ReportingController extends Controller
{
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
            // 🚨 NOUVEAU : Validation des nouveaux filtres optionnels
            'produit_id'   => 'nullable|integer',
            'section_id'   => 'nullable|integer',
        ]);

        $data = $action->execute(
            $filters['personnel_id'],
            $filters['date_debut'], 
            $filters['date_fin'],
            $filters['produit_id'] ?? null,  
            $filters['section_id'] ?? null
        );

        return response()->json($data);
    }

    public function exportEtatPersonnelPdf(Request $request, GenerateEtatPersonnelAction $action)
    {
        $filters = $request->validate([
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after_or_equal:date_debut',
            'personnel_id' => 'required|integer|exists:personnels,id',
            'produit_id'   => 'nullable|integer',
            'section_id'   => 'nullable|integer',
        ]);

        $data = $action->execute(
            $filters['personnel_id'],
            $filters['date_debut'], 
            $filters['date_fin'],
            $filters['produit_id'] ?? null,
            $filters['section_id'] ?? null
        );

        $pdf = Pdf::loadView('pdf.etat-personnel', [
            'data' => $data,
        ]);


        $fileName = 'Fiche_Agent_' . $data['personnel']['matricule'] . '_' . now()->format('Ymd') . '.pdf';

        return $pdf->download($fileName);
    }

    public function exportEtatPersonnelExcel(Request $request, GenerateEtatPersonnelAction $action)
    {
        $filters = $request->validate([
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after_or_equal:date_debut',
            'personnel_id' => 'required|integer|exists:personnels,id',
            'produit_id'   => 'nullable|integer',
            'section_id'   => 'nullable|integer',
        ]);

        $data = $action->execute(
            $filters['personnel_id'],
            $filters['date_debut'], 
            $filters['date_fin'],
            $filters['produit_id'] ?? null,
            $filters['section_id'] ?? null
        );

        $fileName = 'Fiche_Agent_' . $data['personnel']['matricule'] . '_' . now()->format('Ymd_Hi') . '.xlsx';

        return Excel::download(new ExportEtatPersonnelPaie($data), $fileName);
    }

    public function getEtatPointageSection(Request $request, GenerateEtatPointageSectionAction $action)
    {
        $filters = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'produit_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
        ]);

        // 🚨 PROTECTION : Limite de 31 jours imposée
        $debut = \Carbon\Carbon::parse($filters['date_debut']);
        $fin = \Carbon\Carbon::parse($filters['date_fin']);
        
        if ($debut->diffInDays($fin) > 31) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'date_fin' => 'La période sélectionnée ne doit pas dépasser 31 jours pour ce tableau croisé.'
            ]);
        }

        $data = $action->execute(
            $filters['date_debut'],
            $filters['date_fin'],
            $filters['produit_id'] ?? null,
            $filters['section_id'] ?? null
        );

        return response()->json($data);
    }


    public function exportEtatPointageSectionExcel(Request $request, GenerateEtatPointageSectionAction $action)
    {
        $filters = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'produit_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
        ]);

        // Même sécurité que l'API
        $debut = \Carbon\Carbon::parse($filters['date_debut']);
        $fin = \Carbon\Carbon::parse($filters['date_fin']);
        if ($debut->diffInDays($fin) > 31) {
            abort(400, "Période trop longue (Max 31 jours).");
        }

        $data = $action->execute(
            $filters['date_debut'],
            $filters['date_fin'],
            $filters['produit_id'] ?? null,
            $filters['section_id'] ?? null
        );

        $fileName = 'Matrice_Pivot_' . $debut->format('d_m') . '_au_' . $fin->format('d_m_Y') . '.xlsx';

        return Excel::download(new ExportEtatPointagePivot($data), $fileName);
    }


    public function exportEtatPointageSectionPdf(Request $request, GenerateEtatPointageSectionAction $action)
    {
        $filters = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'produit_id' => 'nullable|integer',
            'section_id' => 'nullable|integer',
        ]);

        $debut = \Carbon\Carbon::parse($filters['date_debut']);
        $fin = \Carbon\Carbon::parse($filters['date_fin']);
        
        // 🚨 PROTECTION SPÉCIFIQUE PDF : Max 7 jours (Une semaine)
        if ($debut->diffInDays($fin) > 6) { // 6 jours de différence = 7 jours inclus
            abort(400, "L'export PDF est limité à 7 jours maximum pour garantir la lisibilité du tableau. Veuillez réduire la période ou utiliser l'export Excel.");
        }

        $data = $action->execute(
            $filters['date_debut'],
            $filters['date_fin'],
            $filters['produit_id'] ?? null,
            $filters['section_id'] ?? null
        );

        // On charge la vue en forçant le mode Paysage (Landscape)
        $pdf = Pdf::loadView('pdf.etat-pointage-pivot', [
            'data' => $data,
        ])->setPaper('a4', 'landscape');

        $fileName = 'Matrice_Pivot_' . $debut->format('d_m') . '_au_' . $fin->format('d_m_Y') . '.pdf';

        return $pdf->download($fileName);
    }
}