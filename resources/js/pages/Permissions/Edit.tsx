import { usePage, useForm, Link } from '@inertiajs/react';
import { permissionsUpdate, permissionsIndex } from '@/routes';
import SettingsLayout from '@/layouts/settings/layout';

export default function Edit() {
    const { permission } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm({ name: permission.name });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); put(permissionsUpdate.url({ permission: permission.id })); };

    return (
        <SettingsLayout>
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <h1 className="text-2xl font-black text-primary">Modifier la permission</h1>
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Clé de la permission *</label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                        {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Link href={permissionsIndex.url()} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50">Annuler</Link>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90">{processing ? 'Mise à jour...' : 'Mettre à jour'}</button>
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
}