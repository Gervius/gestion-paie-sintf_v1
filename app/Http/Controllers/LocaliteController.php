<?php

namespace App\Http\Controllers;

use App\Models\Localite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LocaliteController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Localite::class);
        $search = $request->input('search');

        $localites = Localite::query()
            ->when($search, function ($query, $search) {
                $query->where('nom_localite', 'ilike', "%{$search}%")
                      ->orWhere('code_localite', 'ilike', "%{$search}%");
            })
            ->orderBy('code_localite', 'asc')
            ->paginate(8)
            ->withQueryString();

        return Inertia::render('Referentiels/Localites/Index', [
            'localites' => $localites,
            'filters'   => ['search' => $search]
        ]);
    }

    public function create()
    {
        $this->authorize('create', Localite::class);
        return Inertia::render('Referentiels/Localites/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Localite::class);

        $validated = $request->validate([
            'code_localite' => 'required|string|unique:localites|max:255',
            'nom_localite'  => 'required|string|max:255',
        ]);

        Localite::create($validated);

        return redirect()->route('referentielsLocalitesIndex')
            ->with('success', 'Localité (village) ajoutée avec succès.');
    }

    public function edit(Localite $localite)
    {
        $this->authorize('update', $localite);
        return Inertia::render('Referentiels/Localites/Edit', [
            'localite' => $localite
        ]);
    }

    public function update(Request $request, Localite $localite)
    {
        $this->authorize('update', $localite);

        $validated = $request->validate([
            'code_localite' => 'required|string|unique:localites,code_localite,' . $localite->id . '|max:255',
            'nom_localite'  => 'required|string|max:255',
        ]);

        $localite->update($validated);

        return redirect()->route('referentielsLocalitesIndex')
            ->with('success', 'Localité mise à jour.');
    }

    public function destroy(Localite $localite)
    {
        $this->authorize('delete', $localite);
        $localite->delete();

        return redirect()->route('referentielsLocalitesIndex')
            ->with('success', 'Localité supprimée.');
    }
}