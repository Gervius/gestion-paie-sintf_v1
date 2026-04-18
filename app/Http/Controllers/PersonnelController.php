<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\Site;
use App\Models\Section;
use App\Models\Localite;
use App\Services\MatriculeGenerator;
use App\Services\PersonnelImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;


class PersonnelController extends Controller
{
    /**
     * Index avec recherche et pagination optimisée (10 éléments)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Personnel::class);

        $search = $request->input('search');

        return Inertia::render('Personnel/Index', [
            'personnels' => Personnel::with(['siteTravail', 'sectionDefaut', 'localiteDomicile'])
                ->when($search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('nom', 'like', "%{$search}%")
                          ->orWhere('prenom', 'like', "%{$search}%")
                          ->orWhere('matricule', 'like', "%{$search}%");
                    });
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10) // ✅ Limite à 10 pour éviter le scroll excessif
                ->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $this->authorize('create', Personnel::class);

        return Inertia::render('Personnel/Create', [
            'localites' => Localite::orderBy('nom_localite')->get(),
            'sites'     => Site::orderBy('nom_site')->get(),
            'sections'  => Section::with('produit')->orderBy('nom_section')->get(),
        ]);
    }

    public function store(Request $request, MatriculeGenerator $generator)
    {
        $this->authorize('create', Personnel::class);

        $validated = $request->validate([
            'nom'                  => 'required|string|max:255',
            'prenom'               => 'required|string|max:255',
            'surnom'               => 'nullable|string|max:255',
            'sexe'                 => 'required|in:M,F',
            'date_naissance'       => 'required|date',
            'lieu_naissance'       => 'required|string|max:255',
            'num_cnib'             => 'required|string|unique:personnels,num_cnib|max:255',
            'telephone'            => 'required|string|max:20',
            'localite_domicile_id' => 'required|exists:localites,id',
            'site_travail_id'      => 'required|exists:sites,id',
            'section_defaut_id'    => 'required|exists:sections,id',
            'preference_paiement'  => 'required|in:ESPECES,WAVE',
            'est_marie'            => 'boolean',
        ]);

        $site = Site::findOrFail($validated['site_travail_id']);
        $validated['matricule'] = $generator->generate($site->code_site);
        $validated['actif'] = true;

        Personnel::create($validated);

        return redirect()->route('personnelIndex')
            ->with('success', "Employé créé avec succès. Matricule : {$validated['matricule']}");
    }

    public function edit(Personnel $personnel)
    {
        // ✅ Correction du 403 : On vérifie la permission Spatie directement !
        if (!auth()->user()->can('modifier_personnel') && !auth()->user()->can('*')) {
            abort(403, "Vous n'avez pas l'autorisation de modifier un employé.");
        }

        return Inertia::render('Personnel/Edit', [
            'personnel'  => $personnel->load(['localiteDomicile', 'siteTravail', 'sectionDefaut']),
            'localites'  => Localite::orderBy('nom_localite')->get(),
            'sites'      => Site::orderBy('nom_site')->get(),
            'sections'   => Section::with('produit')->orderBy('nom_section')->get(),
        ]);
    }

    public function update(\App\Http\Requests\Personnel\UpdatePersonnelRequest $request, Personnel $personnel)
    {
        // ✅ Le 403 est géré nativement par UpdatePersonnelRequest
        $personnel->update($request->validated());

        return redirect()->route('personnelIndex')
            ->with('success', "Les informations de l'employé ont été mises à jour.");
    }

    public function destroy(Personnel $personnel)
    {
        if (!auth()->user()->can('modifier_personnel') && !auth()->user()->can('*')) {
            abort(403);
        }
        $personnel->delete();
        return redirect()->route('personnelIndex')->with('success', 'Employé retiré du système.');
    }

    
}