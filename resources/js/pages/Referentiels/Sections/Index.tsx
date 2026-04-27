import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, ArrowDownAZ } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import Pagination from '@/components/Pagination';
import { referentielsSectionsCreate, referentielsSectionsEdit, referentielsSectionsDestroy } from '@/routes';

export default function Index() {
    const { sections, filters } = usePage<any>().props;
    const [deleting, setDeleting] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // N'oublie pas d'importer useRef depuis 'react'
    const isInitialRender = useRef(true);

    useEffect(() => {
        // Bloque l'exécution au premier chargement de la page
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const delay = setTimeout(() => {
            router.get(
                window.location.pathname, 
                { search: searchTerm }, 
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(delay);
    }, [searchTerm]);

    // N'oublie pas d'importer useCallback depuis 'react'
    const handleDelete = useCallback((id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
        setDeleting(id);
        
        // Utilise la route appropriée selon le fichier (rolesDestroy, referentielsSitesDestroy, etc.)
        router.delete(referentielsSectionsDestroy.url({ section: id }), { 
            preserveScroll: true, 
            onFinish: () => setDeleting(null) 
        });
    }, []); // <-- Le tableau vide est crucial ici

    

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Sections" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Sections d'Exploitation" description="Gérez les sections de travail et leurs produits associés" />
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md" asChild>
                    <Link href={referentielsSectionsCreate.url()}><Plus size={18} className="mr-2" /> Nouvelle section</Link>
                </Button>
            </div>

            <div className="flex bg-white p-2 rounded-xl border border-border shadow-sm max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" placeholder="Rechercher par code ou nom..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr><th className="px-6 py-4 flex items-center gap-2">Code <ArrowDownAZ size={14} className="text-secondary" /></th><th className="px-6 py-4">Nom de la section</th><th className="px-6 py-4">Produit principal</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sections.data.length === 0 ? (
                            <tr><td colSpan={4} className="py-12 text-center text-muted-foreground font-bold">Aucune section trouvée.</td></tr>
                        ) : (
                            sections.data.map((section: any) => (
                                <tr key={section.id} className="hover:bg-accent/5">
                                    <td className="px-6 py-4 font-mono font-bold text-secondary">{section.code_section}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{section.nom_section}</td>
                                    <td className="px-6 py-4"><span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold">{section.produit?.nom_produit}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={referentielsSectionsEdit.url({ section: section.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={18} /></Link>
                                            <button onClick={() => handleDelete(section.id)} disabled={deleting === section.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={sections.links} />
        </div>
    );
}