<?php

namespace App\Http\Controllers;

use App\Models\Localite;
use App\Models\Personnel;
use App\Models\Site;
use App\Models\Produit;
use App\Models\Section;
use App\Services\CsvImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReferentielImportController extends Controller
{
    /**
     * Affiche la page d'import.
     */
    public function index()
    {
        $this->authorize('import', Personnel::class); // Utilise la policy Personnel (permission `importer_personnel`)

        return Inertia::render('Referentiels/Import', [
            'types' => [
                ['value' => 'localites', 'label' => 'Localités'],
                ['value' => 'sites', 'label' => 'Sites'],
                ['value' => 'produits', 'label' => 'Produits'],
                ['value' => 'sections', 'label' => 'Sections'],
            ],
        ]);
    }

    /**
     * Endpoint API pour la prévisualisation (Dry-Run).
     */
    public function preview(Request $request, CsvImportService $service)
    {
        $this->authorize('import', Personnel::class);

        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
            'type' => 'required|in:localites,sites,produits,sections',
        ]);

        $modelClass = $this->getModelClass($request->type);
        $rules = $this->getRules($request->type);
        $uniqueFields = $this->getUniqueFields($request->type);

        $result = $service->preview($request->file('file'), $modelClass, $rules, $uniqueFields);

        return response()->json($result);
    }

    /**
     * Endpoint API pour l'import définitif.
     */
    public function store(Request $request, CsvImportService $service)
    {
        $this->authorize('import', Personnel::class);

        $request->validate([
            'type'       => 'required|in:localites,sites,produits,sections',
            'validRows'  => 'required|array',
        ]);

        $modelClass = $this->getModelClass($request->type);
        $service->import($request->validRows, $modelClass);

        return response()->json(['message' => 'Import réussi.']);
    }

    private function getModelClass(string $type): string
    {
        return match ($type) {
            'localites' => Localite::class,
            'sites'     => Site::class,
            'produits'  => Produit::class,
            'sections'  => Section::class,
        };
    }

    private function getRules(string $type): array
    {
        return match ($type) {
            'localites' => [
                'code_localite' => 'required|string|max:255',
                'nom_localite'  => 'required|string|max:255',
            ],
            'sites' => [
                'code_site' => 'required|string|max:255',
                'nom_site'  => 'required|string|max:255',
            ],
            'produits' => [
                'code_produit' => 'required|string|max:255',
                'nom_produit'  => 'required|string|max:255',
            ],
            'sections' => [
                'code_section'   => 'required|string|max:255',
                'nom_section'    => 'required|string|max:255',
                'taux_journalier'=> 'required|numeric|min:0',
                'taux_rendement' => 'required|numeric|min:0',
                'produit_id'     => 'required|exists:produits,id',
                'unite_mesure_id'=> 'nullable|exists:unites_mesures,id',
            ],
        };
    }

    private function getUniqueFields(string $type): array
    {
        return match ($type) {
            'localites' => ['code_localite'],
            'sites'     => ['code_site'],
            'produits'  => ['code_produit'],
            'sections'  => ['code_section'],
        };
    }
}