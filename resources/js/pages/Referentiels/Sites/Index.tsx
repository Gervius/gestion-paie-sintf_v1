import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsSitesCreate, referentielsSitesEdit, referentielsSitesDestroy } from '@/routes';

interface Site {
    id: number;
    code_site: string;
    nom_site: string;
}

export default function Index() {
    const { sites } = usePage<{ sites: { data: Site[] } }>().props;
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce site de travail ?')) return;
        setDeleting(id);
        router.delete(referentielsSitesDestroy.url({ site: id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Sites" />

            <div className="flex items-center justify-between">
                <Heading title="Sites d'Exploitation" description="Référentiel des sites de travail SINTF" />
                <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href={referentielsSitesCreate.url()}>
                        <Plus size={18} className="mr-2" /> Nouveau site
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Code du Site</th>
                            <th className="px-6 py-4 text-left">Nom du Site</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sites.data.length === 0 ? (
                            <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Aucun site enregistré</td></tr>
                        ) : (
                            sites.data.map((site) => (
                                <tr key={site.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-secondary">{site.code_site}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                        <Building2 size={16} className="text-muted-foreground" /> {site.nom_site}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={referentielsSitesEdit.url({ site: site.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <Pencil size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(site.id)} disabled={deleting === site.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50">
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