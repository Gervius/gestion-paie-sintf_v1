<?php

namespace App\Http\Controllers;

use App\Models\EtatPaiement;
use App\Models\TicketPaiement;
use App\Models\Section;
use App\Models\Avance;
use App\Models\Personnel;
use App\Services\Finance\EtatPaiementGenerationService;
use App\Services\Finance\PaiementEspecesService;
use App\Services\Finance\WaveExportService;
use App\Services\Finance\AvanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\LotPaiementWave;
use App\Exports\WaveBulkExport;
use Maatwebsite\Excel\Facades\Excel;
use App\Models\PointageLigne;
use Illuminate\Support\Facades\DB;


class FinanceController extends Controller
{
    /**
     * Liste des états de paiement (Index)
     */
    public function etatsIndex(Request $request)
    {
        // On récupère les états avec leur section pour l'affichage
        return Inertia::render('Finance/Etats/Index', [
            'etats' => EtatPaiement::with('section')
                ->orderBy('date_etat', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(10)
                ->withQueryString(),
            'sections' => Section::orderBy('nom_section')->get(),
        ]);
    }

    /**
     * Génération d'un nouvel état périodique (Cumul)
     */
    public function etatStore(Request $request, EtatPaiementGenerationService $service)
    {
        $validated = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date_debut' => 'required|date',
            'date_fin'   => 'required|date|after_or_equal:date_debut',
        ]);

        try {
            // Appel au service pour générer l'agrégation des pointages
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
     * Détail d'un état (Show) avec tickets et avances
     */
    public function etatShow(EtatPaiement $etat)
    {
        return Inertia::render('Finance/Etats/Show', [
            'etat' => $etat->load(['section', 'tickets.personnel', 'tickets.avance']),
        ]);
    }

    /**
     * Ajustement manuel de la retenue (Netting sur entente)
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
        $etat->update(['statut' => 'VALIDE']);
        return back()->with('success', 'État de paiement validé et prêt pour décaissement.');
    }

    /**
     * Paiement de masse des tickets espèces
     */
    public function etatPayerMassEspeces(EtatPaiement $etat, PaiementEspecesService $service)
    {
        try {
            $count = $service->payerEtatComplet($etat->id);
            return back()->with('success', "$count tickets espèces ont été soldés.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Export Wave Global pour toute l'usine
     */
    public function genererLotWaveGlobal(Request $request, WaveExportService $service)
    {
        try {
            $lot = $service->genererLotGlobal($request->user()->id);
            return back()->with('success', "Lot Wave Global {$lot->reference_lot} généré. Prêt pour le téléchargement.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
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
     * Génère le lot en base de données
     */
    public function genererLotWave(Request $request, EtatPaiement $etat, WaveExportService $service)
    {
        $this->authorize('update', $etat);
        
        try {
            $service->genererLotPourEtat($etat, $request->user()->id);
            return back()->with('success', "Le Lot Wave a été généré avec succès. Vous pouvez maintenant télécharger le fichier Excel.");
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Déclenche le téléchargement du fichier Excel
     */
    public function telechargerLotWave(LotPaiementWave $lot)
    {
        return Excel::download(new WaveBulkExport($lot), $lot->reference_lot . '.xlsx');
    }

    /**
     * Suppression d'un état de paiement et libération des pointages
     */
    public function etatDestroy(EtatPaiement $etat)
    {
        // On empêche la suppression si des tickets sont déjà payés ou dans un lot Wave
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
}