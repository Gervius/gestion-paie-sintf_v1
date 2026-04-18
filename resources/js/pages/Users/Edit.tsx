import { usePage, useForm } from '@inertiajs/react';
import { usersUpdate } from '@/routes';

export default function Edit() {
    const { user, sites, roles } = usePage<{
        user: { id: number; name: string; email: string; username: string; site_id: number | null; roles: { name: string }[]; sites: { id: number }[] };
        sites: { id: number; nom_site: string }[];
        roles: { id: number; name: string }[];
    }>().props;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        username: user.username,
        password: '',
        password_confirmation: '',
        site_id: user.site_id?.toString() ?? '',
        site_ids: user.sites.map(s => s.id.toString()),
        roles: user.roles.map(r => r.name),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(usersUpdate.url({ user: user.id }));
    };

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Modifier l'utilisateur</h1>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input type="text" value={data.username} onChange={(e) => setData('username', e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                    {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe (laisser vide pour ne pas changer)</label>
                    <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Confirmation mot de passe</label>
                    <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Sites autorisés</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md">
                        {sites.map(site => (
                            <label key={site.id} className="flex items-center gap-2">
                                <input type="checkbox" value={site.id} checked={data.site_ids.includes(site.id.toString())} onChange={(e) => {
                                    const val = e.target.value;
                                    setData('site_ids', e.target.checked ? [...data.site_ids, val] : data.site_ids.filter(id => id !== val));
                                }} />
                                {site.nom_site}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Rôles</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded-md">
                        {roles.map(role => (
                            <label key={role.id} className="flex items-center gap-2">
                                <input type="checkbox" value={role.name} checked={data.roles.includes(role.name)} onChange={(e) => {
                                    const val = e.target.value;
                                    setData('roles', e.target.checked ? [...data.roles, val] : data.roles.filter(r => r !== val));
                                }} />
                                {role.name}
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => window.history.back()} className="px-4 py-2 border rounded-md">Annuler</button>
                    <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md">{processing ? 'Mise à jour...' : 'Mettre à jour'}</button>
                </div>
            </form>
        </div>
    );
}