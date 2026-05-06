<?php

namespace App\Http\Controllers;

use App\Actions\Pointage\CreatePointageAndPopulateAction;
use App\Actions\Pointage\ManagePointageListAction;
use App\Actions\Pointage\GeneratePointagePdfAction;
use App\Actions\Pointage\SubmitPointageQuantitiesAction;
use App\Http\Requests\Pointage\StorePointageRequest;
use App\Http\Requests\Pointage\AddAgentRequest;
use App\Http\Requests\Pointage\SubmitQuantitiesRequest;
use App\Models\Pointage;
use Illuminate\Support\Facades\DB;
use App\Models\Site;
use App\Models\Section;
use App\Models\Personnel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PointageController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Pointage::class);

        
        $search = $request->input('search');
        $status = $request->input('status', 'EN_COURS'); // "EN_COURS" par défaut (Inbox Zero)
        $siteId = $request->input('site_id');
        $sectionId = $request->input('section_id');
        $dateFiltre = $request->input('date');

        
        $query = Pointage::with(['site', 'section'])
                    ->withCount(['lignes as nb_lignes_soldees' => function ($query) {
                            $query->whereHas('ticketPaiement', function ($q) {
                                $q->where('statut', 'SOLDE');
                            });
                        }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('site', fn($sq) => $sq->where('nom_site', 'like', "%{$search}%"))
                  ->orWhereHas('section', fn($sq) => $sq->where('nom_section', 'like', "%{$search}%"));
            });
        }

        // Filtre Statut intelligent
        if ($status === 'EN_COURS') {
            $query->whereIn('statut', ['PREPARATION', 'EDITE_TERRAIN']);
        } elseif ($status === 'CLOTURE') {
            $query->where('statut', 'CLOTURE');
        } 

        // Filtres spécifiques
        if ($siteId) {
            $query->where('site_id', $siteId);
        }
        if ($sectionId) {
            $query->where('section_id', $sectionId);
        }
        if ($dateFiltre) {
            $query->whereDate('date_pointage', $dateFiltre);
        }

        return Inertia::render('Pointage/Index', [
            'pointages' => $query->orderBy('date_pointage', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(15) 
                ->withQueryString(),
            'sites'    => Site::orderBy('nom_site')->get(['id', 'nom_site']),
            'sections' => Section::orderBy('nom_section')->get(['id', 'nom_section']),
            'filters'  => [
                'search'     => $search,
                'status'     => $status,
                'site_id'    => $siteId ?? '',
                'section_id' => $sectionId ?? '',
                'date'       => $dateFiltre ?? '',
            ],
        ]);
    }

    public function create()
    {
        $this->authorize('create', Pointage::class);

        return Inertia::render('Pointage/Create', [
            'sites'    => Site::orderBy('nom_site')->get(),
            'sections' => Section::with('produit')->orderBy('nom_section')->get(),
            'types'    => [
                ['value' => 'RENDEMENT', 'label' => 'Pointage au rendement'],
                ['value' => 'JOURNALIER', 'label' => 'Pointage journalier'],
            ],
            'today'    => now()->toDateString(),
        ]);
    }

    public function store(StorePointageRequest $request, CreatePointageAndPopulateAction $action)
    {
        try {
            $pointage = $action->execute(
                $request->getSiteId(),
                $request->getSectionId(),
                $request->getDate(),
                $request->getTypePointage()
            );

            return redirect()->route('pointageShow', $pointage->id)
                ->with('success', 'Feuille de pointage initialisée avec succès.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show(Pointage $pointage)
    {
        // Vérification du droit de visualisation
        $this->authorize('view', $pointage);
        
        $pointage->load([
            'site',
            'section.produit', 
            'section.uniteMesure',
            'lignes.personnel'
        ]);

        $user = auth()->user();
        $canEdit = $user->can('pointages.modifier') && in_array($pointage->statut, ['PREPARATION', 'EDITE_TERRAIN']);
        $canSubmit = $user->can('pointages.soumettre') && $pointage->statut === 'EDITE_TERRAIN';
        
        return Inertia::render('Pointage/Show', [
            'pointage' => $pointage,
            'canEdit' => $canEdit,
            'canSubmit' => $canSubmit,
            'taux' => $pointage->taux_applique,
        ]);
    }

    

    public function addAgent(Pointage $pointage, AddAgentRequest $request, ManagePointageListAction $action)
    {
        $this->authorize('update', $pointage);
        $action->addAgent($pointage, $request->input('personnel_id'));
        return back()->with('success', 'Agent ajouté avec succès.');
    }



    public function removeAgent(Pointage $pointage, $ligneId, ManagePointageListAction $action)
    {
        $this->authorize('update', $pointage);
        $action->removeAgent($pointage, $ligneId);
        return back()->with('success', 'Agent retiré de la liste.');
    }



    public function resetToDefault(Pointage $pointage, ManagePointageListAction $action)
    {
        $this->authorize('update', $pointage);
        $action->resetToDefault($pointage);
        return back()->with('success', 'Liste réinitialisée aux agents par défaut.');
    }



    public function clearAll(Pointage $pointage, ManagePointageListAction $action)
    {
        $this->authorize('update', $pointage);
        try {
            $action->clearAll($pointage);
            return back()->with('success', 'Liste vidée.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }



    public function generatePdf(Pointage $pointage, GeneratePointagePdfAction $action)
    {
        $this->authorize('view', $pointage);
        try {
            return $action->execute($pointage);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function validerPreparation(Pointage $pointage)
    {
        $this->authorize('update', $pointage); // Vérifie qu'il a le droit de modifier
        
        $pointage->update(['statut' => 'EDITE_TERRAIN']);
        
        return back()->with('success', 'Saisie déverrouillée. Vous pouvez maintenant entrer les quantités.');
    }

    public function submitQuantities(Pointage $pointage, SubmitQuantitiesRequest $request, SubmitPointageQuantitiesAction $action)
    {
        $this->authorize('submitQuantities', $pointage);
        try {
            $action->execute($pointage, $request->input('quantities'));
            
            return redirect()->route('pointageIndex')->with('success', 'Feuille de pointage clôturée avec succès.'); 
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Annule la clôture d'un pointage pour correction immédiate.
     * Accessible uniquement si les lignes ne sont pas encore liées à un ticket de paie.
     */
    public function annulerCloture(Pointage $pointage)
    {
        $this->authorize('reopen', $pointage);

        // Sécurité : On vérifie si une ligne est déjà liée à la Finance
        $dejaEnPaie = $pointage->lignes()->whereNotNull('ticket_paiement_id')->exists();

        if ($dejaEnPaie) {
            return back()->withErrors([
                'error' => 'Impossible de réouvrir cette feuille : elle est déjà intégrée dans un État de Paie généré. ' . 
                           'Vous devez d\'abord supprimer l\'État de Paie correspondant dans le module Finance.'
            ]);
        }

        // On repasse en mode édition terrain
        $pointage->update(['statut' => 'EDITE_TERRAIN']);

        return back()->with('success', 'La clôture a été annulée. Vous pouvez à nouveau modifier les agents et les quantités.');
    }

    public function searchPersonnel(Request $request)
    {
        $this->authorize('viewAny', Personnel::class);
        $query = trim($request->get('q', ''));
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $personnels = Personnel::with('siteTravail:id,nom_site')
            ->where('actif', true)
            ->where(function ($q) use ($query) {
                // Si le texte contient un espace, on considère que l'utilisateur a tapé "nom prenom"
                if (str_contains($query, ' ')) {
                    [$nom, $prenomDebut] = explode(' ', $query, 2);
                    $q->where(function ($sub) use ($nom, $prenomDebut) {
                        $sub->where('nom', 'ilike', "%{$nom}%")
                            ->where('prenom', 'ilike', "{$prenomDebut}%"); // début de prénom
                    });
                } else {
                    // Recherche classique sur nom, prénom, surnom, matricule
                    $q->where('nom', 'ilike', "%{$query}%")
                    ->orWhere('prenom', 'ilike', "%{$query}%")
                    ->orWhere('surnom', 'ilike', "%{$query}%")
                    ->orWhere('matricule', 'ilike', "%{$query}%");
                }
            })
            ->limit(15)
            ->get(['id', 'matricule', 'nom', 'prenom', 'site_travail_id']);

        return response()->json($personnels);
    }

    

    public function destroy(Pointage $pointage)
    {
        $this->authorize('delete', $pointage);

        $isSuperAdmin = auth()->user()->can('*') || auth()->user()->hasRole('Super Admin');

        // 1. BLOCAGE STANDARD : Un utilisateur normal ne supprime qu'en préparation
        if (!$isSuperAdmin && $pointage->statut !== 'PREPARATION') {
            return back()->withErrors(['error' => 'Seul un Super Admin peut supprimer un pointage déjà édité ou clôturé.']);
        }

        // 2. VÉRIFICATION DE LA CAISSE (Même le Super Admin ne peut pas frauder)
        $hasSoldes = $pointage->lignes()->whereHas('ticketPaiement', function ($query) {
            $query->where('statut', 'SOLDE');
        })->exists();

        if ($hasSoldes) {
            return back()->withErrors(['error' => 'Suppression impossible : Ce pointage a généré des paiements qui ont DÉJÀ été remis aux employés en caisse.']);
        }

        // 3. LA SUPPRESSION CHIRURGICALE AVEC RECALCUL
        DB::transaction(function () use ($pointage) {
            // A. On identifie les tickets de paie qui vont être impactés par cette suppression
            $ticketIds = $pointage->lignes() // (Ici c'est bon si Pointage a bien une relation lignes())
                ->whereNotNull('ticket_paiement_id')
                ->pluck('ticket_paiement_id')
                ->unique();

            // B. On supprime les lignes du pointage (la suppression en cascade fera le reste)
            $pointage->lignes()->delete();

            // C. On recalcule les tickets de paie pour éviter que le comptable n'ait des faux totaux
            if ($ticketIds->isNotEmpty()) {
                $tickets = \App\Models\TicketPaiement::whereIn('id', $ticketIds)->get();
                
                foreach ($tickets as $ticket) {
                    $nouvelleQuantite = $ticket->pointageLignes()->sum('quantite');
                    
                    if ($nouvelleQuantite == 0) {
                        // S'il n'y a plus aucune ligne pour cet agent, on supprime son ticket
                        $ticket->delete();
                    } else {
                        // Sinon, on recalcule son salaire brut et net
                        $nouveauBrut = $ticket->pointageLignes()->sum('montant_brut');
                        
                        $ticket->update([
                            'quantite_totale' => $nouvelleQuantite,
                            'montant_brut_cumule' => $nouveauBrut,
                            'montant_net' => $nouveauBrut - $ticket->montant_deduit_manuel
                        ]);
                    }
                }
            }

            // D. Enfin, on détruit la coquille vide du pointage
            $pointage->delete();
        });

        return back()->with('success', 'Pointage détruit avec succès et fiches de paie recalculées.');
    }

    
}