<?php

namespace App\Http\Controllers;

use App\Models\Pointage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ToggleGarantiePointageController extends Controller
{
    public function __invoke(Request $request, Pointage $pointage)
    {
        
        if (!Gate::allows('pointages.garantie.activer') && !auth()->user()->can('*')) {
            abort(403, "Seul un haut responsable peut activer cette urgence.");
        }

        
        if ($pointage->statut === 'CLOTURE') {
            return back()->withErrors(['error' => 'Ce pointage est déjà clôturé, impossible de modifier la garantie.']);
        }

        
        $nouvelEtat = !$pointage->garantie_journaliere_active;
        $pointage->update(['garantie_journaliere_active' => $nouvelEtat]);
        

        $message = $nouvelEtat 
            ? "URGENCE ACTIVÉE : Les agents de ce pointage seront compensés à la journée." 
            : "Garantie désactivée : Retour au calcul au rendement strict.";

        return back()->with('success', $message);
    }
}