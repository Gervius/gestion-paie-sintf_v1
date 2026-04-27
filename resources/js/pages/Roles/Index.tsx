import { usePage, Link, router } from '@inertiajs/react';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { rolesCreate, rolesEdit, rolesDestroy } from '@/routes';
import SettingsLayout from '@/layouts/settings/layout';

interface Role { id: number; name: string; permissions: { name: string }[]; }

export default function Index() {
    const { roles } = usePage<{ roles: { data: Role[] } }>().props;
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer ce rôle ? Les utilisateurs liés perdront ces accès.')) return;
        setDeleting(id);
        router.delete(rolesDestroy.url({ role: id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null)
        });
    };

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rôles & Accès</h1>
                        <p className="text-sm text-muted-foreground">Définissez les niveaux de permission</p>
                    </div>
                    <Link href={rolesCreate.url()} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">
                        <Plus size={18} /> Nouveau rôle
                    </Link>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-bold text-primary uppercase">
                            <tr>
                                <th className="px-6 py-4 text-left">Nom du Rôle</th>
                                <th className="px-6 py-4 text-left">Permissions Associées</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {roles.data.map((role) => (
                                <tr key={role.id} className="hover:bg-accent/5">
                                    <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2"><ShieldCheck size={18} className="text-secondary"/> {role.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.map(p => <span key={p.name} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] uppercase font-medium">{p.name.replace('_', ' ')}</span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={rolesEdit.url({ role: role.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={18} /></Link>
                                            {role.name !== 'Super Admin' && (
                                                <button onClick={() => handleDelete(role.id)} disabled={deleting === role.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg disabled:opacity-50"><Trash2 size={18} /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}