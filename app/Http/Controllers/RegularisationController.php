<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use App\Models\PointageLigne;
use App\Actions\Regularisation\CreateRegularisationPositiveAction;
use App\Actions\Regularisation\CreateRegularisationNegativeAction;
use App\Http\Requests\Regularisation\StoreRegularisationPositiveRequest;
use App\Http\Requests\Regularisation\StoreRegularisationNegativeRequest;
use Illuminate\Http\Request;

class RegularisationController extends Controller
{
    /**
     * Oubli de pointage (Régularisation Positive)
     */
    public function storePositive(StoreRegularisationPositiveRequest $request, Pointage $pointage, CreateRegularisationPositiveAction $action)
    {
        try {
            $action->execute(
                $pointage,
                $request->validated('personnel_id'),
                $request->validated('quantite'),
                $request->validated('motif')
            );

            return back()->with('success', 'Régularisation positive ajoutée. Elle sera prise en compte lors du prochain état de paie.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Trop-perçu ou pénalité (Régularisation Négative)
     */
    public function storeNegative(StoreRegularisationNegativeRequest $request, PointageLigne $ligne, CreateRegularisationNegativeAction $action)
    {
        try {
            $action->execute(
                $ligne,
                $request->validated('motif'),
                $request->validated('montant_trop_percu')
            );

            return back()->with('success', 'Régularisation négative convertie en retenue (Avance). Elle sera déduite du prochain paiement de l\'agent.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}