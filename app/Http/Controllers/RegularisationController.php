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
     * Gère l'oubli d'un agent (Régularisation Positive)
     * Propose le mode "Express" ou "En attente"
     */
    public function storePositive(StoreRegularisationPositiveRequest $request, Pointage $pointage, CreateRegularisationPositiveAction $action)
    {
        // La validation est gérée automatiquement par StoreRegularisationPositiveRequest
        
        try {
            $result = $action->execute(
                $pointage,
                $request->validated('personnel_id'),
                $request->validated('quantite'),
                $request->validated('motif'),
                $request->validated('paiement_immediat') ?? false
            );

            if ($result['etat']) {
                return back()->with('success', "⚡ Paiement Express généré ! L'État de Paie {$result['etat']->reference_etat} est disponible dans le module Finance.");
            }

            return back()->with('success', "Régularisation enregistrée. L'agent sera payé lors de la prochaine campagne globale.");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => "Erreur technique : " . $e->getMessage()]);
        }
    }

    /**
     * Gère le trop-perçu (Régularisation Négative)
     * Crée une avance pour récupération manuelle ultérieure
     */
    public function storeNegative(StoreRegularisationNegativeRequest $request, PointageLigne $ligne, CreateRegularisationNegativeAction $action)
    {
        try {
            $action->execute(
                $ligne,
                $request->validated('motif'),
                $request->validated('montant_trop_percu')
            );

            return back()->with('success', "Le trop-perçu a été transformé en Avance. Le caissier pourra procéder à la retenue d'un commun accord avec l'agent.");

        } catch (\Exception $e) {
            return back()->withErrors(['error' => "Erreur technique : " . $e->getMessage()]);
        }
    }
}