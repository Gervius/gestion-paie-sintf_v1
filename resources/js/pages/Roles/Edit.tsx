import { usePage, useForm, Link } from '@inertiajs/react';
import { rolesUpdate, rolesIndex } from '@/routes';
import SettingsLayout from '@/layouts/settings/layout';

export default function Edit() {
    const { role, permissionsGrouped, selectedPermissions } = usePage<any>().props;
    
    // On initialise avec les permissions existantes
    const { data, setData, put, processing, errors } = useForm({ 
        name: role.name, 
        permissions: selectedPermissions || [] 
    });

    const handleSubmit = (e: React.SubmitEvent) => { e.preventDefault(); put(rolesUpdate.url({ role: role.id })); };

    const togglePermission = (permName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permName));
        }
    };

    const isSuperAdmin = role.name === 'Super Admin';

    return (
        <>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Modifier le Rôle : {role.name}</h1>
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Nom du rôle *</label>
                        <input 
                            type="text" 
                            value={data.name} 
                            onChange={(e) => setData('name', e.target.value)} 
                            className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none disabled:bg-gray-100 disabled:text-gray-500" 
                            required 
                            disabled={isSuperAdmin} 
                        />
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-primary mb-4">Accès & Permissions</label>
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                            {Object.entries(permissionsGrouped || {}).map(([group, perms]: [string, any]) => (
                                <div key={group} className="bg-muted/10 p-4 rounded-xl border border-border">
                                    <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-3 pb-2 border-b border-border/50">
                                        Module : {group}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {perms.map((perm: any) => (
                                            <label key={perm.name} className={`flex items-start gap-3 p-2 rounded-lg transition border border-transparent shadow-sm ${isSuperAdmin ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-white hover:border-border cursor-pointer'}`}>
                                                <input 
                                                    type="checkbox" 
                                                    value={perm.name} 
                                                    checked={data.permissions.includes(perm.name)} 
                                                    onChange={(e) => togglePermission(e.target.value, e.target.checked)} 
                                                    className="mt-1 w-4 h-4 text-primary rounded"
                                                    disabled={isSuperAdmin} 
                                                />
                                                <span className="text-sm font-medium text-gray-700 leading-tight">
                                                    {perm.name.replace(/_/g, ' ')}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <Link href={rolesIndex.url()} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 font-medium">Annuler</Link>
                        {!isSuperAdmin && (
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                {processing ? 'Mise à jour...' : 'Mettre à jour le rôle'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}