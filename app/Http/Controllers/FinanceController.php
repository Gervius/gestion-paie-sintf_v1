<?php

namespace App\Http\Controllers;

use App\Models\EtatPaiement;
use App\Models\TicketPaiement;
use App\Models\Section;
use App\Models\Avance;
use App\Models\Personnel;
use App\Models\LotPaiementWave;
use App\Models\PointageLigne;
use App\Models\Pointage;
use App\Services\Finance\EtatPaiementGenerationService;
use App\Services\Finance\PaiementEspecesService;
use App\Services\Finance\WaveExportService;
use App\Services\Finance\AvanceService;
use App\Actions\Finance\GenerateBordereauCaissePdfAction;
use App\Exports\WaveBulkExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class FinanceController extends Controller
{
    /**
     * Liste des états de paiement (Index) + Préparation de la Campagne
     */
    public function etatsIndex(Request $request)
    {
        // 1. Récupération des filtres depuis l'URL (PROVISOIRE par défaut pour l'Inbox Zero)
        $statusFiltre = $request->input('status', 'PROVISOIRE'); 
        $sectionFiltre = $request->input('section_id');

        // 2. Construction de la requête avec les filtres
        $query = EtatPaiement::with('section');

        if ($statusFiltre !== 'TOUS') {
            $query->where('statut', $statusFiltre);
        }
        if ($sectionFiltre) {
            $query->where('section_id', $sectionFiltre);
        }

        // 3. PERFORMANCE : On cherche la date du plus ancien pointage CLOTURE en attente
        $plusAncienneDate = Pointage::where('statut', 'CLOTURE')
            ->whereHas('lignes', function ($q) {
                $q->where('statut_ligne', 'EN_ATTENTE')->whereNull('ticket_paiement_id');
            })
            ->min('date_pointage');

        return Inertia::render('Finance/Etats/Index', [
            'etats' => $query->orderBy('date_etat', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString(),
            'sections' => Section::orderBy('nom_section')->get(),
            'date_debut_suggeree' => $plusAncienneDate ?? now()->toDateString(), 
            // On renvoie les filtres au front pour garder l'état des boutons
            'filters' => [
                'status' => $statusFiltre,
                'section_id' => $sectionFiltre,
            ]
        ]);
    }

    /**
     *  GÉNÉRATION DE MASSE HAUTE PERFORMANCE (La Campagne)
     */
    public function etatStoreCampagne(Request $request, EtatPaiementGenerationService $service)
    {
        if (!$request->user()->can('generer_etat_paiement') && !$request->user()->can('*')) abort(403);
        $validated = $request->validate([
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
            'section_id' => 'nullable|exists:sections,id' // Optionnel !
        ]);

        try {
            $dateDebut = Carbon::parse($validated['date_debut']);
            $dateFin = Carbon::parse($validated['date_fin']);

            // 1. CIBLAGE SQL : Quelles sections ont vraiment des pointages en attente ?
            $querySections = Pointage::where('statut', 'CLOTURE')
                ->whereBetween('date_pointage', [$dateDebut->toDateString(), $dateFin->toDateString()])
                ->whereHas('lignes', function ($q) {
                    $q->where('statut_ligne', 'EN_ATTENTE')->whereNull('ticket_paiement_id');
                });

            // Si l'utilisateur a choisi une seule section, on filtre, sinon on prend tout
            if (!empty($validated['section_id'])) {
                $querySections->where('section_id', $validated['section_id']);
            }

            // On récupère uniquement les IDs des sections concernées (ultra léger en mémoire)
            $sectionIds = $querySections->distinct()->pluck('section_id');

            if ($sectionIds->isEmpty()) {
                return back()->withErrors(['error' => 'Aucun pointage clôturé et non traité n\'a été trouvé pour cette période.']);
            }

            $countGeneres = 0;
            
            // 2. EXÉCUTION : On ne boucle QUE sur les sections utiles
            foreach ($sectionIds as $id) {
                $service->genererIntervalle((int) $id, $dateDebut, $dateFin);
                $countGeneres++;
            }

            return back()->with('success', "Succès : {$countGeneres} État(s) de paiement généré(s) avec succès !");
            
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la génération : ' . $e->getMessage()]);
        }
    }

    /**
     * Génération d'un nouvel état périodique (Cumul)
     */
    public function etatStore(Request $request, EtatPaiementGenerationService $service)
    {

        if (!$request->user()->can('generer_etat_paiement') && !$request->user()->can('*')) abort(403);
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        try {
            $etat = $service->genererIntervalle(
                (int) $validated['section_id'],
                Carbon::parse($validated['date_debut']),
                Carbon::parse($validated['date_fin'])
            );

            return redirect()->route('financeEtatsShow', $etat->id)
                ->with('success', 'État périodique généré. Procédez maintenant à l\'ajustement des retenues.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Détail d'un état (Show) avec tickets, avances et permissions (Front)
     */
    public function etatShow(Request $request, EtatPaiement $etat)
    {
        return Inertia::render('Finance/Etats/Show', [
            'etat' => $etat->load(['section', 'tickets.personnel', 'tickets.avance']),
            
            // 💡 Envoi des permissions au Frontend pour masquer/afficher les boutons
            'can' => [
                'valider_etat'  => $request->user()->can('valider_etat_paiement') || $request->user()->can('*'),
                'payer_especes' => $request->user()->can('payer_especes') || $request->user()->can('*'),
                'gerer_wave'    => $request->user()->can('generer_lot_wave') || $request->user()->can('*'),
            ]
        ]);
    }

    /**
     * Ajustement manuel de la retenue (Netting)
     */
    public function updateRetenue(Request $request, TicketPaiement $ticket)
    {
        if (!$ticket->avance_id) {
            return back()->withErrors(['error' => 'Action impossible : cet employé n\'a aucune avance en cours.']);
        }

        $validated = $request->validate([
            'montant_retenue' => 'required|numeric|min:0'
        ]);

        $maxDuctible = min($ticket->montant_brut_cumule, $ticket->avance->solde_restant);
        $retenue = min($validated['montant_retenue'], $maxDuctible);

        $ticket->update([
            'montant_deduit_manuel' => $retenue,
            'montant_net' => $ticket->montant_brut_cumule - $retenue
        ]);

        $etat = $ticket->etatPaiement;
        $etat->update(['montant_total_net' => $etat->tickets()->sum('montant_net')]);

        return back()->with('success', "Retenue de {$retenue} F appliquée pour {$ticket->personnel->nom}.");
    }

    /**
     * Validation de l'état (Autorise le paiement)
     */
    public function etatValider(EtatPaiement $etat)
    {
        // Vérification stricte via la Policy
        $this->authorize('valider', $etat); 

        $etat->update(['statut' => 'VALIDE']);
        return back()->with('success', 'État de paiement validé et prêt pour décaissement.');
    }

    /**
     * Paiement de masse des tickets espèces
     */
    public function etatPayerMassEspeces(Request $request, EtatPaiement $etat, PaiementEspecesService $service)
    {
        // Vérification de la permission
        if (!$request->user()->can('payer_especes') && !$request->user()->can('*')) {
            abort(403, 'Vous n\'avez pas l\'autorisation de décaisser des espèces.');
        }

        try {
            $count = $service->payerEtatComplet($etat->id);
            return back()->with('success', "$count tickets espèces ont été soldés.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Téléchargement du Bordereau de Caisse PDF
     */
    public function telechargerBordereauCaisse(EtatPaiement $etat, GenerateBordereauCaissePdfAction $action)
    {
        $this->authorize('viewAny', TicketPaiement::class);

        try {
            return $action->execute($etat);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Export Wave Global pour toute l'usine
     */
    public function genererLotWaveGlobal(Request $request, WaveExportService $service)
    {
        if (!$request->user()->can('generer_lot_wave') && !$request->user()->can('*')) {
            abort(403, 'Accès refusé.');
        }

        try {
            $lot = $service->genererLotGlobal($request->user()->id);
            return back()->with('success', "Lot Wave Global {$lot->reference_lot} généré. Prêt pour le téléchargement.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Génère le lot Wave pour un État
     */
    public function genererLotWave(Request $request, EtatPaiement $etat, WaveExportService $service)
    {
        if (!$request->user()->can('generer_lot_wave') && !$request->user()->can('*')) {
            abort(403, 'Accès refusé.');
        }
        
        try {
            $service->genererLotPourEtat($etat, $request->user()->id);
            return back()->with('success', "Le Lot Wave a été généré avec succès. Vous pouvez maintenant télécharger le fichier Excel.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Déclenche le téléchargement du fichier Excel Wave
     */
    public function telechargerLotWave(LotPaiementWave $lot)
    {
        // On permet le téléchargement, la sécurité d'accès au lot peut être affinée si besoin
        return Excel::download(new WaveBulkExport($lot), $lot->reference_lot . '.xlsx');
    }

    /**
     * Validation finale du paiement Wave (Déduction des avances)
     */
    public function validerLotWave(Request $request, LotPaiementWave $lot, WaveExportService $service)
    {
        // Sécurité Wave
        if (!$request->user()->can('generer_lot_wave') && !$request->user()->can('*')) {
            abort(403, 'Accès refusé.');
        }

        try {
            $service->validerLot($lot);
            return back()->with('success', 'Le lot Wave a été validé ! Les tickets sont soldés et les avances ont été mises à jour.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Suppression d'un état de paiement et libération des pointages
     */
    public function etatDestroy(Request $request, EtatPaiement $etat)
    {
        // Seul un rôle ayant des droits de haut niveau devrait pouvoir supprimer
        if (!$request->user()->can('valider_etat_paiement') && !$request->user()->can('*')) {
            abort(403, 'Vous n\'avez pas le droit de supprimer un état de paie.');
        }

        $ticketsVerrouilles = $etat->tickets()->where('statut', '!=', 'NON_SOLDE')->count();
        
        if ($ticketsVerrouilles > 0) {
            return back()->withErrors(['error' => 'Impossible de supprimer cet état. Certains paiements sont déjà en cours ou soldés.']);
        }

        try {
            DB::transaction(function () use ($etat) {
                PointageLigne::whereIn('ticket_paiement_id', $etat->tickets()->pluck('id'))
                    ->update([
                        'ticket_paiement_id' => null,
                        'statut_ligne' => 'EN_ATTENTE'
                    ]);
                $etat->tickets()->delete();
                $etat->delete();
            });

            return redirect()->route('financeEtatsIndex')->with('success', 'État de paiement supprimé. Les pointages sont de nouveau disponibles.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Erreur lors de la suppression : ' . $e->getMessage()]);
        }
    }

    /**
     * Gestion des avances (Index)
     */
    public function avancesIndex()
    {
        return Inertia::render('Finance/Avances/Index', [
            'avances' => Avance::with('personnel')
                ->orderBy('created_at', 'desc')
                ->paginate(10),
            'personnels' => Personnel::where('actif', true)
                ->orderBy('nom')
                ->get(['id', 'matricule', 'nom', 'prenom']),
        ]);
    }

    /**
     * Création d'une avance (Store)
     */
    public function avanceStore(Request $request, AvanceService $service)
    {
        if (!$request->user()->can('gerer_avances') && !$request->user()->can('*')) abort(403);
        $validated = $request->validate([
            'personnel_id' => 'required|exists:personnels,id',
            'montant'      => 'required|numeric|min:500',
            'motif'        => 'required|string|max:255',
            'date'         => 'nullable|date',
        ]);

        try {
            $personnel = Personnel::findOrFail($validated['personnel_id']);
            $service->creerAvance(
                $personnel,
                (float) $validated['montant'],
                $validated['motif'],
                $validated['date'] ?? now()->toDateString()
            );

            return back()->with('success', "Avance accordée à {$personnel->nom} {$personnel->prenom}.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Solder TOUS les tickets espèces validés de l'usine d'un coup
     */
    public function payerToutEspecesUsine(Request $request, PaiementEspecesService $service)
    {
        if (!$request->user()->can('payer_especes') && !$request->user()->can('*')) {
            abort(403);
        }

        try {
            // On récupère tous les IDs des tickets espèces validés et non soldés
            $ticketsIds = TicketPaiement::where('mode_paiement', 'ESPECES')
                ->where('statut', 'NON_SOLDE')
                ->whereHas('etatPaiement', fn($q) => $q->where('statut', 'VALIDE'))
                ->pluck('id');

            if ($ticketsIds->isEmpty()) {
                throw new \Exception("Aucun paiement espèces en attente.");
            }

            $count = 0;
            DB::transaction(function () use ($ticketsIds, $service, &$count) {
                foreach ($ticketsIds as $id) {
                    $ticket = TicketPaiement::find($id);
                    $service->payer($ticket);
                    $count++;
                }
            });

            return back()->with('success', "Succès : $count agents ont été payés en espèces dans toute l'usine.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}