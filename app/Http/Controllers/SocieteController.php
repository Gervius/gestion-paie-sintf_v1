<?php

namespace App\Http\Controllers;

use App\Models\Societe;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class SocieteController extends Controller
{
    public function edit()
    {
        $this->authorize('update', Societe::class);

        $societe = Societe::firstOrCreate([]);

        return Inertia::render('Societe/Edit', [
            'societe' => $societe,
        ]);
    }

    public function update(Request $request)
    {
        $this->authorize('update', Societe::class);

        $validated = $request->validate([
            'raison_sociale'   => 'required|string|max:255',
            'ifu'              => 'nullable|string|max:255',
            'rccm'             => 'nullable|string|max:255',
            'telephone'        => 'required|string|max:20',
            'email'            => 'nullable|email|max:255',
            'adresse'          => 'required|string',
            'gerant'           => 'required|string|max:255',
            'telephone_gerant' => 'nullable|string|max:20',
            'email_gerant'     => 'nullable|email|max:255',
            'logo'             => 'nullable|image|max:2048',
        ]);

        $societe = Societe::firstOrCreate([]);

        if ($request->hasFile('logo')) {
            if ($societe->logo_path) {
                Storage::disk('public')->delete($societe->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_path'] = $path;
        }

        $societe->update($validated);

        // ✅ Correction : Utilisation du bon nom de route défini dans web.php
        return redirect()->route('societeEdit')
            ->with('success', 'Informations de la société mises à jour avec succès.');
    }
}