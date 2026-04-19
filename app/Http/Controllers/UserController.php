<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Site;
use App\Http\Requests\User\UpdateUserRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', User::class);

        $users = User::with(['siteUnique', 'sites', 'roles'])
            ->orderBy('name')
            ->paginate(20);

        $allRoles = Role::all(['id', 'name']);
        $allSites = Site::all(['id', 'nom_site']);

        return Inertia::render('Users/Index', [
            'users'    => $users,
            'allRoles' => $allRoles,
            'allSites' => $allSites,
        ]);
    }

    /**
     * Affiche le formulaire de création
     */
    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::orderBy('name')->get(['id', 'name']),
            'sites' => Site::orderBy('nom_site')->get(['id', 'nom_site']) 
        ]);
    }

    /**
     * Enregistre le nouvel utilisateur et lui assigne un rôle et des sites
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'username'   => 'required|string|alpha_dash|max:50|unique:users', 
            'email'      => 'required|string|email|max:255|unique:users',
            'password'   => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'roles'      => 'required|array',
            'roles.*'    => 'exists:roles,name',
            'site_ids'   => 'nullable|array', 
            'site_ids.*' => 'exists:sites,id'
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'username' => $validated['username'],
            'email'    => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
        ]);

        
        $user->assignRole($validated['roles']);

        
        if (!empty($validated['site_ids'])) {
            $user->sites()->sync($validated['site_ids']);
        }

        return redirect()->route('usersIndex')->with('success', "L'utilisateur {$user->name} a été créé avec succès.");
    }

    public function edit(User $user)
    {
        $this->authorize('update', $user);

        $user->load('sites', 'roles');

        return Inertia::render('Users/Edit', [
            'user'  => $user,
            'sites' => Site::orderBy('nom_site')->get(),
            'roles' => Role::where('name', '!=', 'Super Admin')->get(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->authorize('update', $user);

        $validated = $request->validated();

        $user->update([
            'name'  => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (!empty($validated['password'])) {
            $user->update(['password' => bcrypt($validated['password'])]);
        }

        if (isset($validated['roles'])) {
            $user->syncRoles($validated['roles']);
        }

        if (isset($validated['site_ids']) && is_array($validated['site_ids'])) {
            $user->sites()->sync($validated['site_ids']);
            $user->update(['site_id' => null]);
        } elseif (isset($validated['site_id'])) {
            $user->sites()->detach();
            $user->update(['site_id' => $validated['site_id']]);
        }

        return redirect()->route('usersIndex')
            ->with('success', 'Utilisateur mis à jour.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('usersIndex')
            ->with('success', 'Utilisateur supprimé.');
    }

    /**
     * Affiche l'écran de configuration du premier login
     */
    public function firstLoginView()
    {
        return Inertia::render('auth/FirstLoginSetup', [
            'user' => auth()->user()
        ]);
    }

    /**
     * Enregistre le nouveau username et mot de passe
     */
    public function firstLoginUpdate(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            
            'username' => 'required|string|alpha_dash|min:3|max:50|unique:users,username,' . $user->id,
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);

        $user->update([
            'username' => $validated['username'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'must_change_password' => false, 
        ]);

        return redirect()->route('dashboard')->with('success', 'Votre profil est maintenant sécurisé. Bienvenue !');
    }
}