import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsProduitsUpdate, referentielsProduitsIndex } from '@/routes';

export default function Edit() {
    const { produit } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm({ code_produit: produit.code_produit, nom_produit: produit.nom_produit });
    const handleSubmit = (e: React.SubmitEvent) => { e.preventDefault(); put(referentielsProduitsUpdate.url({ produit: produit.id })); };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Head title="Modifier le Produit" />
            <Heading title="Modifier le Produit" description={`Mise à jour de ${produit.nom_produit}`} />
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                <div className="space-y-2"><label className="text-sm font-bold text-primary">Code *</label><input type="text" value={data.code_produit} onChange={e => setData('code_produit', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />{errors.code_produit && <p className="text-xs text-destructive">{errors.code_produit}</p>}</div>
                <div className="space-y-2"><label className="text-sm font-bold text-primary">Nom *</label><input type="text" value={data.nom_produit} onChange={e => setData('nom_produit', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />{errors.nom_produit && <p className="text-xs text-destructive">{errors.nom_produit}</p>}</div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" asChild><Link href={referentielsProduitsIndex.url()}>Annuler</Link></Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white min-w-[150px]">{processing ? 'Mise à jour...' : 'Mettre à jour'}</Button>
                </div>
            </form>
        </div>
    );
}