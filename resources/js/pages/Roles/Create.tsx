import { usePage, useForm, Link } from '@inertiajs/react';
import { rolesStore, rolesIndex } from '@/routes';
import SettingsLayout from '@/layouts/settings/layout';

export default function Create() {
    // On récupère permissionsGrouped au lieu de permissions
    const { permissionsGrouped } = usePage<any>().props;
    const { data, setData, post, processing, errors } = useForm({ name: '', permissions: [] as string[] });

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); post(rolesStore.url()); };

    const togglePermission = (permName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permName));
        }
    };

    return (
        <SettingsLayout>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Nouveau Rôle</h1>
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Nom du rôle *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required placeholder="Ex: Pointeur, Caissier..." />
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-primary mb-4">Accès & Permissions</label>
                        {/* On boucle sur les clés de l'objet (les groupes) */}
                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                            {Object.entries(permissionsGrouped || {}).map(([group, perms]: [string, any]) => (
                                <div key={group} className="bg-muted/10 p-4 rounded-xl border border-border">
                                    <h3 className="text-xs font-black text-secondary uppercase tracking-wider mb-3 pb-2 border-b border-border/50">
                                        Module : {group}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                        {perms.map((perm: any) => (
                                            <label key={perm.name} className="flex items-start gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition border border-transparent hover:border-border shadow-sm">
                                                <input 
                                                    type="checkbox" 
                                                    value={perm.name} 
                                                    checked={data.permissions.includes(perm.name)} 
                                                    onChange={(e) => togglePermission(e.target.value, e.target.checked)} 
                                                    className="mt-1 w-4 h-4 text-primary rounded" 
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
                        <button type="submit" disabled={processing} className="px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 disabled:opacity-50">
                            {processing ? 'Enregistrement...' : 'Enregistrer le rôle'}
                        </button>
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
}