import { usePage, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Key } from 'lucide-react';
import { useState } from 'react';
import { permissionsCreate, permissionsEdit, permissionsDestroy } from '@/routes';
import SettingsLayout from '@/layouts/settings/layout';

export default function Index() {
    const { permissions } = usePage<any>().props;
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cette permission du système ?')) return;
        setDeleting(id);
        router.delete(permissionsDestroy.url({ permission: id }), { preserveScroll: true, onFinish: () => setDeleting(null) });
    };

    return (
        <SettingsLayout>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-primary">Permissions</h1>
                        <p className="text-muted-foreground font-medium text-sm">Gestion granulaire des droits d'accès</p>
                    </div>
                    <Link href={permissionsCreate.url()} className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90">
                        <Plus size={18} /> Ajouter
                    </Link>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-bold text-primary uppercase">
                            <tr><th className="px-6 py-4 text-left">Clé de Permission</th><th className="px-6 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {permissions.data.map((perm: any) => (
                                <tr key={perm.id} className="hover:bg-accent/5">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-700 flex items-center gap-2"><Key size={16} className="text-secondary"/> {perm.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={permissionsEdit.url({ permission: perm.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={18} /></Link>
                                            <button onClick={() => handleDelete(perm.id)} disabled={deleting === perm.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </SettingsLayout>
    );
}