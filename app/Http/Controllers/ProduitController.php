<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProduitController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Produit::class);
        $search = $request->input('search');

        $produits = Produit::query()
            ->when($search, function ($query, $search) {
                $query->where('nom_produit', 'ilike', "%{$search}%")
                      ->orWhere('code_produit', 'ilike', "%{$search}%");
            })
            ->orderBy('code_produit', 'asc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Referentiels/Produits/Index', [
            'produits' => $produits,
            'filters'  => ['search' => $search]
        ]);
    }

    public function create()
    {
        $this->authorize('create', Produit::class);
        return Inertia::render('Referentiels/Produits/Create');
    }

    public function store(Request $request)
    {
        $this->authorize('create', Produit::class);

        $validated = $request->validate([
            'code_produit' => 'required|string|unique:produits|max:255',
            'nom_produit'  => 'required|string|max:255',
        ]);

        Produit::create($validated);

        return redirect()->route('referentielsProduitsIndex')
            ->with('success', 'Produit créé avec succès.');
    }

    public function edit(Produit $produit)
    {
        $this->authorize('update', $produit);
        return Inertia::render('Referentiels/Produits/Edit', [
            'produit' => $produit
        ]);
    }

    public function update(Request $request, Produit $produit)
    {
        $this->authorize('update', $produit);

        $validated = $request->validate([
            'code_produit' => 'required|string|unique:produits,code_produit,' . $produit->id . '|max:255',
            'nom_produit'  => 'required|string|max:255',
        ]);

        $produit->update($validated);

        return redirect()->route('referentielsProduitsIndex')
            ->with('success', 'Produit mis à jour.');
    }

    public function destroy(Produit $produit)
    {
        $this->authorize('delete', $produit);
        $produit->delete();

        return redirect()->route('referentielsProduitsIndex')
            ->with('success', 'Produit supprimé.');
    }
}