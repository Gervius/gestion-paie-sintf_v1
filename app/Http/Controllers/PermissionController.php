<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use App\Http\Requests\Permission\StorePermissionRequest;
use App\Http\Requests\Permission\UpdatePermissionRequest;

class PermissionController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Permission::class);

        $permissions = Permission::orderBy('name')->paginate(20);

        return Inertia::render('Permissions/Index', [
            'permissions' => $permissions,
        ]);
    }

    public function create()
    {
        $this->authorize('create', Permission::class);

        return Inertia::render('Permissions/Create');
    }

    public function store(StorePermissionRequest $request)
    {
        $this->authorize('create', Permission::class);

        Permission::create(['name' => $request->name]);

        return redirect()->route('permissionsIndex')
            ->with('success', 'Permission créée.');
    }

    public function edit(Permission $permission)
    {
        $this->authorize('update', $permission);

        return Inertia::render('Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission)
    {
        $this->authorize('update', $permission);

        $permission->update(['name' => $request->name]);

        return redirect()->route('permissions.index')
            ->with('success', 'Permission mise à jour.');
    }

    public function destroy(Permission $permission)
    {
        $this->authorize('delete', $permission);

        $permission->delete();

        return redirect()->route('permissions.index')
            ->with('success', 'Permission supprimée.');
    }
}