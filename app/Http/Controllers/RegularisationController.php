<?php

namespace App\Http\Controllers;

use App\Actions\Regularisation\CreateRegularisationPositiveAction;
use App\Actions\Regularisation\CreateRegularisationNegativeAction;
use App\Http\Requests\Regularisation\StoreRegularisationPositiveRequest;
use App\Http\Requests\Regularisation\StoreRegularisationNegativeRequest;
use App\Models\Pointage;
use App\Models\PointageLigne;
use App\Models\Personnel;
use Inertia\Inertia;

class RegularisationController extends Controller
{
    /**
     * Affiche le formulaire de régularisation positive pour une feuille donnée.
     */
    public function createPositive(Pointage $pointage)
    {
        $this->authorize('create', PointageLigne::class); // ou une Policy RegularisationPolicy

        $pointage->load('site', 'section');

        return Inertia::render('Regularisations/Positive/Create', [
            'pointage'   => $pointage,
            'personnels' => Personnel::where('actif', true)
                ->orderBy('nom')
                ->get(['id', 'matricule', 'nom', 'prenom', 'surnom']),
        ]);
    }

    /**
     * Enregistre une régularisation positive.
     */
    public function storePositive(
        Pointage $pointage,
        StoreRegularisationPositiveRequest $request,
        CreateRegularisationPositiveAction $action
    ) {
        try {
            $action->execute(
                $pointage,
                $request->input('personnel_id'),
                $request->input('quantite'),
                $request->input('motif')
            );
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return redirect()->route('pointage.show', $pointage->id)
            ->with('success', 'Régularisation positive enregistrée.');
    }

    /**
     * Affiche le formulaire de régularisation négative pour une ligne donnée.
     */
    public function createNegative(PointageLigne $ligne)
    {
        $this->authorize('create', Avance::class);

        $ligne->load('pointage', 'personnel');

        return Inertia::render('Regularisations/Negative/Create', [
            'ligne' => $ligne,
        ]);
    }

    /**
     * Enregistre une régularisation négative (création d'avance).
     */
    public function storeNegative(
        PointageLigne $ligne,
        StoreRegularisationNegativeRequest $request,
        CreateRegularisationNegativeAction $action
    ) {
        try {
            $action->execute(
                $ligne,
                $request->input('motif'),
                $request->input('montant_trop_percu')
            );
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }

        return redirect()->route('finance.avances.index')
            ->with('success', 'Régularisation négative effectuée : avance créée.');
    }
}