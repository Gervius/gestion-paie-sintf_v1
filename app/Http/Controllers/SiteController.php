<?php

namespace App\Http\Controllers;

use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function index(Request $request)
    {
        
        $search = $request->input('search');

        $sites = Site::query()
            ->when($search, function ($query, $search) {
                $query->where('nom_site', 'ilike', "%{$search}%")
                    ->orWhere('code_site', 'ilike', "%{$search}%");
            })
            ->orderBy('code_site', 'asc') 
            ->paginate(10)                
            ->withQueryString();          

        return inertia('Referentiels/Sites/Index', [
            'sites' => $sites,
            'filters' => ['search' => $search] 
        ]);
    }

    public function create()
    {
        $this->authorize('create', Site::class);
        return Inertia::render('Referentiels/Sites/Create'); 
    }

    public function store(Request $request)
    {
        $this->authorize('create', Site::class);

        $validated = $request->validate([
            'code_site' => 'required|string|unique:sites|max:255',
            'nom_site'  => 'required|string|max:255',
        ]);

        Site::create($validated);

        return redirect()->route('referentielsSitesIndex')
            ->with('success', 'Site créé.');
    }

    public function edit(Site $site)
    {
        $this->authorize('update', $site);
        return Inertia::render('Referentiels/Sites/Edit', ['site' => $site]); // ✅ Correction du chemin
    }

    public function update(Request $request, Site $site)
    {
        $this->authorize('update', $site);

        $validated = $request->validate([
            'code_site' => 'required|string|unique:sites,code_site,' . $site->id . '|max:255',
            'nom_site'  => 'required|string|max:255',
        ]);

        $site->update($validated);

        return redirect()->route('referentielsSitesIndex')
            ->with('success', 'Site mis à jour.');
    }

    public function destroy(Site $site)
    {
        $this->authorize('delete', $site);
        $site->delete();
        return redirect()->route('referentielsSitesIndex')
            ->with('success', 'Site supprimé.');
    }
}