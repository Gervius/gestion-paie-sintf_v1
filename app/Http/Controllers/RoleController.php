<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\UpdateRoleRequest;

class RoleController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Role::class);

        $roles = Role::with('permissions')->paginate(20);

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Role::class);

        $permissions = Permission::orderBy('name')->get()->groupBy(function ($item) {
            return explode('_', $item->name)[0] ?? 'autres';
        });

        return Inertia::render('Roles/Create', [
            'permissionsGrouped' => $permissions,
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        $this->authorize('create', Role::class);

        $role = Role::create(['name' => $request->name]);
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('rolesIndex')
            ->with('success', 'Rôle créé.');
    }

    public function edit(Role $role)
    {
        $this->authorize('update', $role);

        $role->load('permissions');

        $permissions = Permission::orderBy('name')->get()->groupBy(function ($item) {
            return explode('_', $item->name)[0] ?? 'autres';
        });

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'permissionsGrouped' => $permissions,
            'selectedPermissions' => $role->permissions->pluck('name'),
        ]);
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        $this->authorize('update', $role);

        // Le nom du rôle Super Admin ne doit pas être modifiable
        if ($role->name !== 'Super Admin') {
            $role->name = $request->name;
            $role->save();
        }

        $role->syncPermissions($request->permissions ?? []);

        return redirect()->route('rolesIndex')
            ->with('success', 'Rôle mis à jour.');
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete', $role);

        if ($role->name === 'Super Admin') {
            return back()->withErrors(['error' => 'Le rôle Super Admin ne peut pas être supprimé.']);
        }

        $role->delete();

        return redirect()->route('rolesIndex')
            ->with('success', 'Rôle supprimé.');
    }
}