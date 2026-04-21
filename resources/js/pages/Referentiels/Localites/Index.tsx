import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, MapPin, Search, ArrowDownAZ } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import Pagination from '@/components/Pagination';
import { referentielsLocalitesCreate, referentielsLocalitesEdit, referentielsLocalitesDestroy } from '@/routes';

export default function Index() {
    const { localites, filters } = usePage<any>().props;
    const [deleting, setDeleting] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(window.location.pathname, { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer ce village ?')) return;
        setDeleting(id);
        router.delete(referentielsLocalitesDestroy.url({ localite: id }), { preserveScroll: true, onFinish: () => setDeleting(null) });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Localités" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Localités (Villages)" description="Référentiel des villages d'origine du personnel" />
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md" asChild>
                    <Link href={referentielsLocalitesCreate.url()}><Plus size={18} className="mr-2" /> Nouvelle localité</Link>
                </Button>
            </div>

            <div className="flex bg-white p-2 rounded-xl border border-border shadow-sm max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" placeholder="Rechercher un village..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr><th className="px-6 py-4 flex items-center gap-2">Code <ArrowDownAZ size={14} className="text-secondary" /></th><th className="px-6 py-4">Nom de la localité</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {localites.data.length === 0 ? (
                            <tr><td colSpan={3} className="py-12 text-center text-muted-foreground"><MapPin size={32} className="mx-auto opacity-20 mb-2" /><span className="font-bold">Aucune localité trouvée.</span></td></tr>
                        ) : (
                            localites.data.map((loc: any) => (
                                <tr key={loc.id} className="hover:bg-accent/5">
                                    <td className="px-6 py-4 font-mono font-bold text-secondary">{loc.code_localite}</td>
                                    <td className="px-6 py-4 font-medium flex items-center gap-2"><MapPin size={16} className="text-muted-foreground/50" /> {loc.nom_localite}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={referentielsLocalitesEdit.url({ localite: loc.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={18} /></Link>
                                            <button onClick={() => handleDelete(loc.id)} disabled={deleting === loc.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={localites.links} />
        </div>
    );
}