<?php

namespace App\Http\Controllers;

use App\Models\Avance;
use App\Models\EtatPaiement;
use App\Models\TicketPaiement;
use App\Models\Personnel;
use App\Models\Section;
use App\Services\Finance\AvanceService;
use App\Services\Finance\EtatPaiementGenerationService;
use App\Services\Finance\PaiementEspecesService;
use App\Services\Finance\WaveExportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class FinanceController extends Controller
{
    // ==========================================
    // MODULE AVANCES
    // ==========================================
    public function avancesIndex(Request $request)
    {
        $this->authorize('viewAny', Avance::class);
        $search = $request->input('search');

        return Inertia::render('Finance/Avances/Index', [
            'avances' => Avance::with('personnel')
                ->when($search, function ($query, $search) {
                    $query->whereHas('personnel', function($q) use ($search) {
                        $q->where('nom', 'like', "%{$search}%")
                          ->orWhere('matricule', 'like', "%{$search}%");
                    });
                })
                ->orderBy('created_at', 'desc')
                ->paginate(20)
                ->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function avanceStore(Request $request, AvanceService $service)
    {
        $this->authorize('create', Avance::class);

        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnels,id',
            'montant'      => 'required|numeric|min:0',
            'motif'        => 'required|string|max:255',
            'date_avance'  => 'nullable|date',
        ]);

        $personnel = Personnel::findOrFail($validated['personnel_id']);
        $service->creerAvance($personnel, $validated['montant'], $validated['motif'], $validated['date_avance'] ?? null);

        // Inertia.js redirigera vers la même page si on utilise back(), avec les nouvelles props
        return back()->with('success', 'Avance créée avec succès.');
    }

    // ==========================================
    // MODULE ÉTATS DE PAIEMENT
    // ==========================================
    public function etatsIndex(Request $request)
    {
        $this->authorize('viewAny', EtatPaiement::class);
        
        return Inertia::render('Finance/Etats/Index', [
            'etats' => EtatPaiement::with('section')
                ->orderBy('date_etat', 'desc')
                ->paginate(20),
            'sections' => Section::orderBy('nom_section')->get(['id', 'nom_section']) // On envoie les sections pour le formulaire de création rapide
        ]);
    }

    public function etatStore(Request $request, EtatPaiementGenerationService $service)
    {
        $this->authorize('create', EtatPaiement::class);

        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date_etat'  => 'required|date',
        ]);

        try {
            $etat = $service->generer($validated['section_id'], Carbon::parse($validated['date_etat']));
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        // Redirection Inertia vers la page de détails de l'état généré
        return redirect()->route('financeEtatsShow', $etat->id)
            ->with('success', 'État de paiement généré.');
    }

    public function etatShow(EtatPaiement $etat)
    {
        $this->authorize('view', $etat);

        // On charge les tickets avec les infos du personnel pour la vue détaillée
        $etat->load(['section', 'tickets.personnel']);

        return Inertia::render('Finance/Etats/Show', [
            'etat' => $etat,
        ]);
    }

    public function etatValider(Request $request, EtatPaiement $etat)
    {
        $this->authorize('valider', $etat);

        if ($etat->statut !== 'PROVISOIRE') {
            return back()->withErrors(['error' => 'Cet état ne peut pas être validé.']);
        }

        $etat->update([
            'statut'          => 'VALIDE',
            'valide_par_id'   => auth()->id(),
            'date_validation' => now(),
        ]);

        return back()->with('success', 'État validé.');
    }

    // ==========================================
    // PAIEMENTS & EXPORTS
    // ==========================================
    public function paiementEspeces(TicketPaiement $ticket, PaiementEspecesService $service)
    {
        $this->authorize('payerEspeces', $ticket);

        try {
            $service->payer($ticket);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Paiement effectué.');
    }

    public function genererLotWave(Request $request, EtatPaiement $etat, WaveExportService $service)
    {
        $this->authorize('genererLotWave', TicketPaiement::class);

        try {
            $lot = $service->genererLot($etat->id, auth()->id());
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return back()->with('success', 'Lot Wave généré : ' . $lot->reference_lot);
    }
}