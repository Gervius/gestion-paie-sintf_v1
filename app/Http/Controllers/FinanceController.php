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
        $this->authorize('viewAny', EtatPaiement::class);

        $status = $request->input('status', 'PROVISOIRE');
        $search = $request->input('search');

        $query = EtatPaiement::with('section')
            
            ->withCount(['tickets as tickets_non_soldes_count' => function ($q) {
                $q->where('statut', 'NON_SOLDE');
            }])
            // Filtres intelligents basés sur les enfants (tickets)
            ->when($status === 'PROVISOIRE', fn($q) => $q->where('statut', 'PROVISOIRE'))
            ->when($status === 'A_PAYER', function($q) {
                $q->where('statut', 'VALIDE')
                  ->whereHas('tickets', fn($sq) => $sq->where('statut', 'NON_SOLDE'));
            })
            ->when($status === 'SOLDE', function($q) {
                $q->where('statut', 'VALIDE')
                  ->whereDoesntHave('tickets', fn($sq) => $sq->where('statut', 'NON_SOLDE'));
            })
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
        $this->authorize('create', EtatPaiement::class);


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
        $this->authorize('view', $etat);

        $etat->load(['section', 'tickets.personnel' => function($q) {
            $q->withSum(['avances as total_avances_actives' => function($sq) {
                $sq->where('statut', 'ACTIVE');
            }], 'solde_restant');
        }]);
        
        return Inertia::render('Finance/Etats/Show', [
            'etat' => $etat,
            
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
        $this->authorize('delete', $etat);

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
    /**
     * Mise à jour de la retenue sur ticket
     */
    public function updateTicketRetenue(Request $request, TicketPaiement $ticket)
    {
        // Seul le caissier ou celui qui gère les avances peut modifier une retenue
        $this->authorize('modifierRetenue', $ticket);

        // 1. CALCUL DE LA DETTE RÉELLE AU NIVEAU DU SERVEUR
        $detteTotale = \App\Models\Avance::where('personnel_id', $ticket->personnel_id)
            ->where('statut', 'ACTIVE')
            ->sum('solde_restant');

        // 2. SÉCURITÉ ABSOLUE : On ne peut pas retenir plus que la dette, 
        // ET on ne peut pas retenir plus que le salaire brut (pour éviter un salaire net négatif !)
        $plafondMaximum = min($detteTotale, $ticket->montant_brut_cumule);

        // 3. VALIDATION STRICTE
        $validated = $request->validate([
            'montant_retenue' => [
                'required',
                'numeric',
                'min:0',
                'max:' . $plafondMaximum // Le fameux bouclier
            ]
        ], [
            // Message d'erreur personnalisé si le caissier force la saisie
            'montant_retenue.max' => "Impossible. La retenue maximale autorisée est de " . number_format($plafondMaximum, 0, ',', ' ') . " FCFA (Dette restante ou Salaire Brut)."
        ]);

        if ($ticket->statut === 'SOLDE') {
            return back()->withErrors(['error' => 'Impossible de modifier un ticket déjà soldé.']);
        }
        
        if ($ticket->etatPaiement->statut === 'VALIDE' && !auth()->user()->can('*')) {
            return back()->withErrors(['error' => "L'état est verrouillé, modification interdite."]);
        }

        // 4. MISE À JOUR
        $ticket->update([
            'montant_deduit_manuel' => $validated['montant_retenue'],
            'montant_net' => $ticket->montant_brut_cumule - $validated['montant_retenue']
        ]);

        return back()->with('success', "Retenue appliquée avec succès.");
    }

    /**
     * ESPÈCES : Payer tout un état
     */
    public function etatPayerMassEspeces(EtatPaiement $etat, PaiementEspecesService $service)
    {
        $this->authorize('payer', TicketPaiement::class);

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
    /**
     * Index des Avances
     */
    public function avancesIndex(Request $request)
    {
        $this->authorize('viewAny', Avance::class);

        $search = $request->input('search');
        $status = $request->input('status', 'ACTIVE'); // Par défaut : les encours

        $query = Avance::with('personnel')
            ->when($status !== 'TOUS', fn($q) => $q->where('statut', $status))
            ->when($search, function($q) use ($search) {
                $q->whereHas('personnel', function($sq) use ($search) {
                    $sq->where('nom', 'ilike', "%{$search}%")
                       ->orWhere('prenom', 'ilike', "%{$search}%")
                       ->orWhere('matricule', 'ilike', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc');

        return Inertia::render('Finance/Avances/Index', [
            'avances' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status
            ],
            // Optionnel : si tu passes les personnels directement à ta modale depuis l'index
            'personnels' => Personnel::where('actif', true)->orderBy('nom')->get(['id', 'matricule', 'nom', 'prenom']),
        ]);
    }

    /**
     * Création d'une Avance
     */
    public function avanceStore(Request $request, AvanceService $service)
    {
        if (!auth()->user()->can('avances.creer') && !auth()->user()->can('*')) {
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
     * Supprimer une avance (uniquement si elle n’a jamais été remboursée)
     */
    public function avanceDestroy(Avance $avance)
    {
        $this->authorize('delete', $avance);

        try {
            $avance->delete();
            return back()->with('success', "Avance supprimée avec succès.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => "Impossible de supprimer cette avance : " . $e->getMessage()]);
        }
    }

    /**
     * PDF : Bordereau de caisse
     */
    public function telechargerBordereauCaisse(EtatPaiement $etat, GenerateBordereauCaissePdfAction $action)
    {
        $this->authorize('view', $etat);
        return $action->execute($etat);
    }

    /**
     * WAVE : Génération du lot
     */
    public function genererLotWave(EtatPaiement $etat, WaveExportService $service)
    {
        $this->authorize('genererLotWave', TicketPaiement::class);

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
        $this->authorize('genererLotWave', TicketPaiement::class);

        return Excel::download(new WaveBulkExport($lot), 'WAVE_' . $lot->reference_lot . '.xlsx');
    }

    /**
     * WAVE : Confirmation finale
     */
    public function validerLotWave($lotId, WaveExportService $service)
    {
        $this->authorize('validerLotWave', TicketPaiement::class);

        try {
            $service->confirmerTransfertLot($lotId);
            return back()->with('success', "Transfert Wave validé et tickets soldés.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}