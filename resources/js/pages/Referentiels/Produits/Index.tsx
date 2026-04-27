import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Package, Search, ArrowDownAZ } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import Pagination from '@/components/Pagination';
import { referentielsProduitsCreate, referentielsProduitsEdit, referentielsProduitsDestroy } from '@/routes';

export default function Index() {
    const { produits, filters } = usePage<any>().props;
    const [deleting, setDeleting] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const isInitialRender = useRef(true);

    useEffect(() => {
        // 2. On bloque le premier déclenchement
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const delay = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(window.location.pathname, { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer ce produit ?')) return;
        setDeleting(id);
        router.delete(referentielsProduitsDestroy.url({ produit: id }), { preserveScroll: true, onFinish: () => setDeleting(null) });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Produits" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Produits" description="Référentiel des produits de transformation" />
                <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md" asChild>
                    <Link href={referentielsProduitsCreate.url()}><Plus size={18} className="mr-2" /> Nouveau produit</Link>
                </Button>
            </div>

            <div className="flex bg-white p-2 rounded-xl border border-border shadow-sm max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr><th className="px-6 py-4 flex items-center gap-2">Code <ArrowDownAZ size={14} className="text-secondary" /></th><th className="px-6 py-4">Nom du Produit</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {produits.data.length === 0 ? (
                            <tr><td colSpan={3} className="py-12 text-center text-muted-foreground"><Package size={32} className="mx-auto opacity-20 mb-2" /><span className="font-bold">Aucun produit trouvé.</span></td></tr>
                        ) : (
                            produits.data.map((prod: any) => (
                                <tr key={prod.id} className="hover:bg-accent/5">
                                    <td className="px-6 py-4 font-mono font-bold text-secondary">{prod.code_produit}</td>
                                    <td className="px-6 py-4 font-medium flex items-center gap-2"><Package size={16} className="text-muted-foreground/50" /> {prod.nom_produit}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={referentielsProduitsEdit.url({ produit: prod.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={18} /></Link>
                                            <button onClick={() => handleDelete(prod.id)} disabled={deleting === prod.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={produits.links} />
        </div>
    );
}