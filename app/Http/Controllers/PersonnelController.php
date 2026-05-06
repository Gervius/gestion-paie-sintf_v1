<?php

namespace App\Http\Controllers;

use App\Models\Personnel;
use App\Models\Site;
use App\Models\Section;
use App\Models\Localite;
use App\Services\MatriculeGenerator;
use App\Actions\Personnel\GenerateIdentificationCardAction;
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
                    // Permettre "nom espace début prénom"
                    if (str_contains($search, ' ')) {
                        [$nom, $prenomDebut] = explode(' ', $search, 2);
                        $query->where(function ($q) use ($nom, $prenomDebut) {
                            $q->where('nom', 'ilike', "%{$nom}%")
                            ->where('prenom', 'ilike', "{$prenomDebut}%");
                        });
                    } else {
                        $query->where(function ($q) use ($search) {
                            $q->where('nom', 'ilike', "%{$search}%")
                            ->orWhere('prenom', 'ilike', "%{$search}%")
                            ->orWhere('matricule', 'ilike', "%{$search}%");
                        });
                    }
                })
                ->orderBy('created_at', 'desc')
                ->paginate(10)
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
            'localite_domicile_id' => 'required|exists:localites,id',
            'date_naissance'       => 'required|date',
            'lieu_naissance'       => 'required|string|max:255',
            'num_cnib'             => 'required|string|unique:personnels,num_cnib|max:255',
            'sans_cnib'            => 'boolean', 
            'telephone'            => 'required_if:a_telephone_propre,true|nullable|string|max:20', 
            'a_telephone_propre'   => 'boolean', 
            'telephone_sc'         => 'required_if:a_telephone_propre,false|nullable|string|max:20', 
            'lien_telephone_sc'    => 'required_if:a_telephone_propre,false|nullable|string|max:255', 
            'site_travail_id'      => 'required|exists:sites,id',
            'section_defaut_id'    => 'nullable|exists:sections,id',
            'preference_paiement'  => 'required|in:ESPECES,WAVE',
            'est_marie'            => 'boolean',
        ]);

        $site = Site::findOrFail($validated['site_travail_id']);
        $validated['matricule'] = $generator->generate($site->code_site);
        $validated['actif'] = true;

        // Maintenant, Personnel::create recevra bien tous les champs validés
        Personnel::create($validated);

        return redirect()->route('personnelIndex')
            ->with('success', "Employé créé avec succès. Matricule : {$validated['matricule']}");
    }

    public function edit(Personnel $personnel)
    {
        
        $this->authorize('update', $personnel);

        return Inertia::render('Personnel/Edit', [
            'personnel'  => $personnel->load(['localiteDomicile', 'siteTravail', 'sectionDefaut']),
            'localites'  => Localite::orderBy('nom_localite')->get(),
            'sites'      => Site::orderBy('nom_site')->get(),
            'sections'   => Section::with('produit')->orderBy('nom_section')->get(),
        ]);
    }

    public function update(\App\Http\Requests\Personnel\UpdatePersonnelRequest $request, Personnel $personnel)
    {
        
        $personnel->update($request->validated());

        return redirect()->route('personnelIndex')
            ->with('success', "Les informations de l'employé ont été mises à jour.");
    }

    public function destroy(Personnel $personnel)
    {
        $this->authorize('delete', $personnel);
        
        $personnel->delete();
        return redirect()->route('personnelIndex')->with('success', 'Employé retiré du système.');
    }

    public function telechargerBadge(Personnel $personnel, GenerateIdentificationCardAction $action)
    {
        $this->authorize('view', $personnel);
        return $action->execute($personnel);
    }

    
}