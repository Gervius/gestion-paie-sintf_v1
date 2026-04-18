<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Produit;
use App\Models\UniteMesure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Section::class);

        return Inertia::render('Referentiels/Sections/Index', [ // ✅ Correction du chemin
            'sections' => Section::with(['produit', 'uniteMesure'])
                ->orderBy('nom_section')
                ->paginate(20),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Section::class);

        return Inertia::render('Referentiels/Sections/Create', [ // ✅ Correction du chemin
            'produits'      => Produit::orderBy('nom_produit')->get(),
            'unitesMesure'  => UniteMesure::orderBy('libelle')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Section::class);

        $validated = $request->validate([
            'code_section'     => 'required|string|unique:sections|max:255',
            'nom_section'      => 'required|string|max:255',
            'taux_journalier' => 'required|numeric|min:0',
            'taux_rendement'  => 'required|numeric|min:0',
            'produit_id'       => 'required|exists:produits,id',
            'unite_mesure_id'  => 'nullable|exists:unites_mesures,id',
        ]);

        Section::create($validated);

        return redirect()->route('sections.index')
            ->with('success', 'Section créée.');
    }

    public function edit(Section $section)
    {
        $this->authorize('update', $section);

        return Inertia::render('Referentiels/Sections/Edit', [ // ✅ Correction du chemin
            'section'       => $section,
            'produits'      => Produit::orderBy('nom_produit')->get(),
            'unitesMesure'  => UniteMesure::orderBy('libelle')->get(),
        ]);
    }

    public function update(Request $request, Section $section)
    {
        $this->authorize('update', $section);

        $validated = $request->validate([
            'code_section'     => 'required|string|unique:sections,code_section,' . $section->id . '|max:255',
            'nom_section'      => 'required|string|max:255',
            'taux_journalier' => 'required|numeric|min:0',
            'taux_rendement'  => 'required|numeric|min:0',
            'produit_id'       => 'required|exists:produits,id',
            'unite_mesure_id'  => 'nullable|exists:unites_mesures,id',
        ]);

        $section->update($validated);

        return redirect()->route('sections.index')
            ->with('success', 'Section mise à jour.');
    }

    public function destroy(Section $section)
    {
        $this->authorize('delete', $section);
        $section->delete();
        return redirect()->route('sections.index')
            ->with('success', 'Section supprimée.');
    }
}