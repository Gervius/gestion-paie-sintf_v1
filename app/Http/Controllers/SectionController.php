<?php

namespace App\Http\Controllers;

use App\Models\Section;
use App\Models\Produit;
use App\Models\UniteMesure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        
        $search = $request->input('search');

        $sections = Section::query()
            ->when($search, function ($query, $search) {
                $query->where('nom_section', 'ilike', "%{$search}%")
                    ->orWhere('code_section', 'ilike', "%{$search}%");
            })
            ->orderBy('code_section', 'asc') 
            ->paginate(10)                
            ->withQueryString();          

        return inertia('Referentiels/Sections/Index', [
            'sections' => $sections,
            'filters' => ['search' => $search] 
        ]);
    }

    public function create()
    {
        $this->authorize('create', Section::class);

        return Inertia::render('Referentiels/Sections/Create', [ 
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

        return redirect()->route('referentielsSectionsIndex')
            ->with('success', 'Section créée.');
    }

    public function edit(Section $section)
    {
        $this->authorize('update', $section);

        return Inertia::render('Referentiels/Sections/Edit', [ 
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

        return redirect()->route('referentielsSectionsIndex')
            ->with('success', 'Section mise à jour.');
    }

    public function destroy(Section $section)
    {
        $this->authorize('delete', $section);
        $section->delete();
        return redirect()->route('referentielsSectionsIndex')
            ->with('success', 'Section supprimée.');
    }
}