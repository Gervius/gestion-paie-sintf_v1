<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Site;
use App\Http\Requests\User\UpdateUserRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

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

        // Gestion des sites : soit site unique, soit multi-sites
        if (isset($validated['site_ids']) && is_array($validated['site_ids'])) {
            $user->sites()->sync($validated['site_ids']);
            $user->update(['site_id' => null]);
        } elseif (isset($validated['site_id'])) {
            $user->sites()->detach();
            $user->update(['site_id' => $validated['site_id']]);
        }

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur mis à jour.');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur supprimé.');
    }
}