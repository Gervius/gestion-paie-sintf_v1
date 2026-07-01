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
    /**
     * Index des États de Paiement
     */
    public function etatsIndex(Request $request)
    {
        $this->authorize('viewAny', EtatPaiement::class);

        $status = $request->input('status', 'PROVISOIRE');
        $search = $request->input('search');
        $siteId = $request->input('site_id'); // INTENTION : Nouveau filtre par site

        // INTENTION : Eager loading du 'site' pour l'affichage UI
        $query = EtatPaiement::with(['section', 'site']) 
            ->withCount(['tickets as tickets_non_soldes_count' => function ($q) {
                $q->where('statut', 'NON_SOLDE');
            }])
            ->when($status === 'PROVISOIRE', fn($q) => $q->where('statut', 'PROVISOIRE'))
            ->when($status === 'A_PAYER', function($q) {
                $q->where('statut', 'VALIDE')
                  ->whereHas('tickets', fn($sq) => $sq->where('statut', 'NON_SOLDE'));
            })
            ->when($status === 'SOLDE', function($q) {
                $q->where('statut', 'VALIDE')
                  ->whereDoesntHave('tickets', fn($sq) => $sq->where('statut', 'NON_SOLDE'));
            })
            ->when($siteId, fn($q) => $q->where('site_id', $siteId))
            ->when($search, function ($q) use ($search) {
                // CORRECTION CRITIQUE : Encapsulation du OR pour ne pas casser les filtres de Site et Statut
                $q->where(function ($queryGroup) use ($search) {
                    $queryGroup->where('reference_etat', 'ilike', "%{$search}%")
                               ->orWhereHas('section', fn($sq) => $sq->where('nom_section', 'ilike', "%{$search}%"));
                });
            })
            ->orderBy('created_at', 'desc');

            
        return Inertia::render('Finance/Etats/Index', [
            'etats' => $query->paginate(15)->withQueryString(),
            'sections' => Section::orderBy('nom_section')->get(['id', 'nom_section']),
            'sites' => \App\Models\Site::orderBy('nom_site')->get(['id', 'nom_site']), // Transmission des sites à React
            'date_debut_suggeree' => now()->startOfMonth()->toDateString(),
            'filters' => $request->only(['status', 'search', 'site_id'])
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
    /**
     * Détail d'un État avec chargement des relations pour la ventilation UI
     */
    public function etatShow(EtatPaiement $etat)
    {
        $this->authorize('view', $etat);

        // INTENTION : Eager loading des lignes de pointage et de leur pointage parent 
        // pour permettre au composant React de séparer instantanément les montants journaliers et rendements en mémoire.
        $etat->load([
            'section', 
            'site', // Permet d'afficher le nom du site dans le header du Show
            'tickets.personnel' => function($q) {
                $q->withSum(['avances as total_avances_actives' => function($sq) {
                    $sq->where('statut', 'ACTIVE');
                }], 'solde_restant');
            },
            'tickets.pointageLignes.pointage' // <-- AJOUT CRITIQUE POUR LA VENTILATION DE L'UI
        ]);
        
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
    public function updateTicketRetenue(Request $request, TicketPaiement $ticket)
    {
        // Seul le caissier ou celui qui gère les avances peut modifier une retenue
        $this->authorize('modifierRetenue', $ticket);

        return DB::transaction(function () use ($request, $ticket) {
            // INTENTION : Verrouillage exclusif en lecture pour garantir l'intégrité de la donnée.
            // On s'assure d'avoir la version la plus fraîche du ticket en base.
            $lockedTicket = TicketPaiement::lockForUpdate()->findOrFail($ticket->id);

            // 1. CALCUL DE LA DETTE RÉELLE SÉCURISÉ
            $detteTotale = \App\Models\Avance::where('personnel_id', $lockedTicket->personnel_id)
                ->where('statut', 'ACTIVE')
                ->lockForUpdate() // <-- Pose le verrou sur les lignes récupérées
                ->get()           // <-- Exécute le SELECT FOR UPDATE
                ->sum('solde_restant'); // <-- Fait la somme sur la Collection en mémoire

            // 2. SÉCURITÉ ABSOLUE : Plafond = dette restante OU salaire brut
            $plafondMaximum = min($detteTotale, $lockedTicket->montant_brut_cumule);

            // 3. VALIDATION STRICTE
            $validated = $request->validate([
                'montant_retenue' => [
                    'required',
                    'numeric',
                    'min:0',
                    'max:' . $plafondMaximum 
                ]
            ], [
                'montant_retenue.max' => "Impossible. La retenue maximale autorisée est de " . number_format($plafondMaximum, 0, ',', ' ') . " FCFA (Dette restante ou Salaire Brut)."
            ]);

            if ($lockedTicket->statut === 'SOLDE') {
                return back()->withErrors(['error' => 'Impossible de modifier un ticket déjà soldé.']);
            }
            
            if ($lockedTicket->etatPaiement->statut === 'VALIDE' && !auth()->user()->can('*')) {
                return back()->withErrors(['error' => "L'état est verrouillé, modification interdite."]);
            }

            // 4. MISE À JOUR
            $lockedTicket->update([
                'montant_deduit_manuel' => $validated['montant_retenue'],
                'montant_net' => $lockedTicket->montant_brut_cumule - $validated['montant_retenue']
            ]);

            return back()->with('success', "Retenue appliquée avec succès.");
        });
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