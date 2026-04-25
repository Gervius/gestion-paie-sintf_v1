<?php

namespace App\Http\Controllers;

use App\Models\EtatPaiement;
use App\Models\TicketPaiement;
use App\Models\Section;
use App\Models\Avance;
use App\Models\Personnel;
use App\Models\LotPaiementWave;
use App\Services\Finance\EtatPaiementGenerationService;
use App\Services\Finance\PaiementEspecesService;
use App\Services\Finance\WaveExportService;
use App\Services\Finance\AvanceService;
use App\Actions\Finance\GenerateBordereauCaissePdfAction;
use App\Exports\WaveBulkExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class FinanceController extends Controller
{
    /**
     * Index des États de Paiement
     */
    public function etatsIndex(Request $request)
    {
        // Permission : generer_etat_paiement ou voir_consolidation_paie
        if (!$request->user()->can('generer_etat_paiement') && !$request->user()->can('*')) {
            abort(403, "Vous n'avez pas la permission de consulter les états.");
        }

        $status = $request->input('status', 'PROVISOIRE');
        $search = $request->input('search');

        $query = EtatPaiement::with('section')
            ->when($status !== 'TOUS', fn($q) => $q->where('statut', $status))
            ->when($search, function ($q) use ($search) {
                $q->where('reference_etat', 'ilike', "%{$search}%")
                  ->orWhereHas('section', fn($sq) => $sq->where('nom_section', 'ilike', "%{$search}%"));
            })
            ->orderBy('created_at', 'desc');

        return Inertia::render('Finance/Etats/Index', [
            'etats' => $query->paginate(15)->withQueryString(),
            'sections' => Section::orderBy('nom_section')->get(['id', 'nom_section']),
            'date_debut_suggeree' => now()->startOfMonth()->toDateString(),
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    /**
     * Génération de la Campagne de Masse (Multi-Sections)
     */
    public function etatStoreCampagne(Request $request, EtatPaiementGenerationService $service)
    {
        if (!$request->user()->can('generer_etat_paiement') && !$request->user()->can('*')) {
            abort(403);
        }

        $validated = $request->validate([
            'section_ids'   => 'required|array|min:1',
            'section_ids.*' => 'exists:sections,id',
            'date_debut'    => 'required|date',
            'date_fin'      => 'required|date|after_or_equal:date_debut',
        ]);

        try {
            $count = $service->genererIntervalleMulti(
                $validated['section_ids'],
                Carbon::parse($validated['date_debut'])->startOfDay(),
                Carbon::parse($validated['date_fin'])->endOfDay()
            );

            if ($count === 0) {
                return back()->withErrors(['error' => "Aucun pointage clôturé trouvé."]);
            }

            return back()->with('success', "Succès : $count états consolidés générés.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Détail d'un État
     */
    public function etatShow(EtatPaiement $etat)
    {
        // L'EtatPaiement est déjà protégé par le SiteScope s'il est activé
        // On vérifie si l'utilisateur peut voir les tickets (Caissier, RH, Admin)
        if (!auth()->user()->can('voir_ticket_valide') && !auth()->user()->can('generer_etat_paiement') && !auth()->user()->can('*')) {
            abort(403);
        }

        $etat->load(['section', 'tickets.personnel' => function($q) {
            $q->withSum(['avances as total_avances_actives' => function($sq) {
                $sq->where('statut', 'ACTIVE');
            }], 'solde_restant');
        }]);
        
        return Inertia::render('Finance/Etats/Show', [
            'etat' => $etat,
            'can' => [
                'valider' => auth()->user()->can('valider_etat_paiement') || auth()->user()->can('*'),
            ]
        ]);
    }

    /**
     * Validation d'un État
     */
    public function etatValider(EtatPaiement $etat)
    {
        $this->authorize('valider', $etat);

        $etat->update([
            'statut' => 'VALIDE',
            'valide_par_id' => auth()->id(),
            'date_validation' => now(),
        ]);

        return back()->with('success', "L'état a été verrouillé pour le paiement.");
    }

    /**
     * Suppression d'un État
     */
    public function etatDestroy(EtatPaiement $etat)
    {
        // Seul celui qui peut générer peut annuler (Admin/RH/Chef de Section)
        if (!$etat->statut === 'PROVISOIRE' || (!auth()->user()->can('generer_etat_paiement') && !auth()->user()->can('*'))) {
            abort(403, "Action impossible sur un état validé ou sans permission.");
        }

        DB::transaction(function () use ($etat) {
            DB::table('pointage_lignes')
                ->whereIn('ticket_paiement_id', $etat->tickets()->pluck('id'))
                ->update(['ticket_paiement_id' => null, 'statut_ligne' => 'EN_ATTENTE']);
            $etat->delete();
        });

        return redirect()->route('financeEtatsIndex')->with('success', "L'état a été annulé.");
    }

    /**
     * Mise à jour de la retenue sur ticket
     */
    public function updateTicketRetenue(Request $request, TicketPaiement $ticket)
    {
        // Seul le caissier ou celui qui gère les avances peut modifier une retenue
        if (!auth()->user()->can('gerer_avances') && !auth()->user()->can('payer_especes') && !auth()->user()->can('*')) {
            abort(403);
        }

        $validated = $request->validate(['montant_retenue' => 'required|numeric|min:0']);

        if ($ticket->statut === 'SOLDE' || $ticket->etatPaiement->statut === 'VALIDE') {
            // Optionnel : permettre la modif si l'état est VALIDE mais pas encore PAYÉ ? 
            // Ici on bloque si l'état est verrouillé (VALIDE).
            if ($ticket->etatPaiement->statut === 'VALIDE' && !auth()->user()->can('*')) {
                return back()->withErrors(['error' => "L'état est verrouillé."]);
            }
        }

        $ticket->update([
            'montant_deduit_manuel' => $validated['montant_retenue'],
            'montant_net' => $ticket->montant_brut_cumule - $validated['montant_retenue']
        ]);

        return back()->with('success', "Retenue mise à jour.");
    }

    /**
     * ESPÈCES : Payer tout un état
     */
    public function etatPayerMassEspeces(EtatPaiement $etat, PaiementEspecesService $service)
    {
        if (!auth()->user()->can('payer_especes') && !auth()->user()->can('*')) {
            abort(403);
        }

        try {
            $count = $service->payerEtatComplet($etat->id);
            return back()->with('success', "$count paiements espèces soldés.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Index des Avances
     */
    public function avancesIndex(Request $request)
    {
        if (!auth()->user()->can('gerer_avances') && !auth()->user()->can('*')) {
            abort(403);
        }

        $search = $request->input('search');
        return Inertia::render('Finance/Avances/Index', [
            'avances' => Avance::with('personnel')
                ->when($search, fn($q) => $q->whereHas('personnel', fn($sq) => $sq->where('nom', 'ilike', "%{$search}%")))
                ->orderBy('created_at', 'desc')
                ->paginate(15),
            'personnels' => Personnel::where('actif', true)->orderBy('nom')->get(['id', 'matricule', 'nom', 'prenom']),
        ]);
    }

    /**
     * Création d'une Avance
     */
    public function avanceStore(Request $request, AvanceService $service)
    {
        if (!auth()->user()->can('gerer_avances') && !auth()->user()->can('*')) {
            abort(403);
        }

        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnels,id',
            'montant' => 'required|numeric|min:1',
            'motif' => 'required|string|max:255',
            'date' => 'nullable|date',
        ]);

        try {
            $personnel = Personnel::findOrFail($validated['personnel_id']);
            $service->creerAvance($personnel, $validated['montant'], $validated['motif'], $validated['date']);
            return back()->with('success', "Avance accordée.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * PDF : Bordereau de caisse
     */
    public function telechargerBordereauCaisse(EtatPaiement $etat, GenerateBordereauCaissePdfAction $action)
    {
        if (!auth()->user()->can('payer_especes') && !auth()->user()->can('*')) {
            abort(403);
        }
        return $action->execute($etat);
    }

    /**
     * WAVE : Génération du lot
     */
    public function genererLotWave(EtatPaiement $etat, WaveExportService $service)
    {
        if (!auth()->user()->can('generer_lot_wave') && !auth()->user()->can('*')) {
            abort(403);
        }

        try {
            $lot = $service->genererLotPourEtat($etat, auth()->id());
            return back()->with('success', "Lot Wave {$lot->reference_lot} généré.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * WAVE : Téléchargement Excel
     */
    public function telechargerLotWave(LotPaiementWave $lot)
    {
        if (!auth()->user()->can('generer_lot_wave') && !auth()->user()->can('*')) {
            abort(403);
        }

        return Excel::download(new WaveBulkExport($lot), 'WAVE_' . $lot->reference_lot . '.xlsx');
    }

    /**
     * WAVE : Confirmation finale
     */
    public function validerLotWave($lotId, WaveExportService $service)
    {
        if (!auth()->user()->can('generer_lot_wave') && !auth()->user()->can('*')) {
            abort(403);
        }

        try {
            $service->confirmerTransfertLot($lotId);
            return back()->with('success', "Transfert Wave validé et tickets soldés.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}