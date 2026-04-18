import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsSectionsCreate, referentielsSectionsEdit, referentielsSectionsDestroy } from '@/routes';

interface Section {
    id: number;
    code_section: string;
    nom_section: string;
    produit: { nom_produit: string };
}

export default function Index() {
    const { sections } = usePage<{ sections: { data: Section[] } }>().props;
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette section ?')) return;
        setDeleting(id);
        
        
        router.delete(referentielsSectionsDestroy.url({ section: id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null),
        });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Sections" />

            <div className="flex items-center justify-between">
                <Heading title="Sections d'Exploitation" description="Gérez les sections de travail et leurs produits associés" />
                <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href={referentielsSectionsCreate.url()}>
                        <Plus size={18} className="mr-2" /> Nouvelle section
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Code</th>
                            <th className="px-6 py-4 text-left">Nom de la section</th>
                            <th className="px-6 py-4 text-left">Produit principal</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sections.data.map((section) => (
                            <tr key={section.id} className="hover:bg-accent/5 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-secondary">{section.code_section}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{section.nom_section}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold">
                                        {section.produit.nom_produit}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={referentielsSectionsEdit.url({ section: section.id })}
                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(section.id)}
                                            disabled={deleting === section.id}
                                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}