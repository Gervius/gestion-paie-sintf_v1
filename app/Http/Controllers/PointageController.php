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

        return Inertia::render('Pointage/Index', [
            'pointages' => Pointage::with(['site', 'section'])
                ->when($search, function ($query, $search) {
                    $query->whereHas('site', function ($q) use ($search) {
                        $q->where('nom_site', 'like', "%{$search}%");
                    })->orWhereHas('section', function ($q) use ($search) {
                        $q->where('nom_section', 'like', "%{$search}%");
                    });
                })
                ->orderBy('date_pointage', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(10) // ✅ Limite à 10 pour l'ergonomie
                ->withQueryString(),
            'filters' => $request->only(['search']),
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
        
        $pointage->load([
            'site',
            'section.produit', 
            'section.uniteMesure',
            'lignes.personnel'
        ]);

        return Inertia::render('Pointage/Show', [
            'pointage' => $pointage,
            'canEdit' => $this->authorize('update', $pointage)->allowed(),
            'canSubmit' => $this->authorize('submitQuantities', $pointage)->allowed(),
            'taux' => $pointage->taux_applique,
        ]);
    }

    public function addAgent(Pointage $pointage, AddAgentRequest $request, ManagePointageListAction $action)
    {
        $action->addAgent($pointage, $request->input('personnel_id'));
        return back()->with('success', 'Agent ajouté avec succès.');
    }

    public function removeAgent(Pointage $pointage, $ligneId, ManagePointageListAction $action)
    {
        $action->removeAgent($pointage, $ligneId);
        return back()->with('success', 'Agent retiré de la liste.');
    }

    public function resetToDefault(Pointage $pointage, ManagePointageListAction $action)
    {
        $action->resetToDefault($pointage);
        return back()->with('success', 'Liste réinitialisée aux agents par défaut.');
    }

    public function clearAll(Pointage $pointage, ManagePointageListAction $action)
    {
        try {
            $action->clearAll($pointage);
            return back()->with('success', 'Liste vidée.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function generatePdf(Pointage $pointage, GeneratePointagePdfAction $action)
    {
        try {
            return $action->execute($pointage);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Génère l'export Excel pour la comptabilité
     */
    public function exportExcel(Pointage $pointage, \App\Actions\Pointage\ExportPointageExcelAction $action)
    {
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

    public function searchPersonnel(Request $request)
    {
        $query = $request->get('q');
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        return response()->json(
            Personnel::where('actif', true)
                ->where(function ($q) use ($query) {
                    $q->where('nom', 'like', "%{$query}%")
                      ->orWhere('prenom', 'like', "%{$query}%")
                      ->orWhere('surnom', 'like', "%{$query}%")
                      ->orWhere('matricule', 'like', "%{$query}%");
                })
                ->limit(15)
                ->get(['id', 'matricule', 'nom', 'prenom'])
        );
    }

    public function destroy(Pointage $pointage)
    {
        
        $this->authorize('delete', $pointage);

        
        if ($pointage->statut !== 'PREPARATION') {
            return back()->withErrors(['error' => 'Impossible de supprimer une feuille de pointage qui n\'est plus en préparation.']);
        }

        $pointage->delete();

        return back()->with('success', 'La feuille de pointage a été supprimée avec succès.');
    }
}