import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsProduitsCreate, referentielsProduitsEdit, referentielsProduitsDestroy } from '@/routes';

export default function Index() {
    const { produits } = usePage<any>().props;
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        if (!confirm('Supprimer ce produit ?')) return;
        setDeleting(id);
        router.delete(referentielsProduitsDestroy.url({ produit: id }), { preserveScroll: true, onFinish: () => setDeleting(null) });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Produits" />
            <div className="flex items-center justify-between">
                <Heading title="Produits" description="Référentiel des produits de transformation" />
                <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href={referentielsProduitsCreate.url()}><Plus size={18} className="mr-2" /> Nouveau produit</Link>
                </Button>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr><th className="px-6 py-4 text-left">Code</th><th className="px-6 py-4 text-left">Nom du Produit</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {produits.data.map((prod: any) => (
                            <tr key={prod.id} className="hover:bg-accent/5 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-secondary">{prod.code_produit}</td>
                                <td className="px-6 py-4 font-medium flex items-center gap-2"><Package size={16} className="text-muted-foreground" /> {prod.nom_produit}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={referentielsProduitsEdit.url({ produit: prod.id })} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><Pencil size={18} /></Link>
                                        <button onClick={() => handleDelete(prod.id)} disabled={deleting === prod.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={18} /></button>
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