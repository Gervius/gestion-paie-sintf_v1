import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsLocalitesCreate, referentielsLocalitesEdit, referentielsLocalitesDestroy } from '@/routes';

interface Localite {
    id: number;
    code_localite: string;
    nom_localite: string;
}

export default function Index() {
    const { localites } = usePage<{ localites: { data: Localite[] } }>().props;
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer cette localité (village) ? Attention aux employés rattachés.')) return;
        setDeleting(id);
        
        router.delete(referentielsLocalitesDestroy.url({ localite: id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Localités" />

            <div className="flex items-center justify-between">
                <Heading 
                    title="Localités (Villages)" 
                    description="Référentiel des villages d'origine du personnel" 
                />
                <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href={referentielsLocalitesCreate.url()}>
                        <Plus size={18} className="mr-2" /> Nouvelle localité
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Code</th>
                            <th className="px-6 py-4 text-left">Nom de la localité / village</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {localites.data.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Aucune localité trouvée</td></tr>
                        ) : (
                            localites.data.map((loc) => (
                                <tr key={loc.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-secondary">{loc.code_localite}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <MapPin size={16} className="text-muted-foreground" /> {loc.nom_localite}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                href={referentielsLocalitesEdit.url({ localite: loc.id })}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            >
                                                <Pencil size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(loc.id)}
                                                disabled={deleting === loc.id}
                                                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}