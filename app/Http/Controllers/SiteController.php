<?php

namespace App\Http\Controllers;

use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Site::class);

        return Inertia::render('Referentiels/Sites/Index', [ // ✅ Correction du chemin
            'sites' => Site::orderBy('nom_site')->paginate(20),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Site::class);
        return Inertia::render('Referentiels/Sites/Create'); // ✅ Correction du chemin
    }

    public function store(Request $request)
    {
        $this->authorize('create', Site::class);

        $validated = $request->validate([
            'code_site' => 'required|string|unique:sites|max:255',
            'nom_site'  => 'required|string|max:255',
        ]);

        Site::create($validated);

        return redirect()->route('sites.index')
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

        return redirect()->route('sites.index')
            ->with('success', 'Site mis à jour.');
    }

    public function destroy(Site $site)
    {
        $this->authorize('delete', $site);
        $site->delete();
        return redirect()->route('sites.index')
            ->with('success', 'Site supprimé.');
    }
}