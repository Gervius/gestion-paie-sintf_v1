import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsSectionsUpdate, referentielsSectionsIndex } from '@/routes';

export default function Edit() {
    const { section, produits, unitesMesure } = usePage<any>().props;

    const { data, setData, put, processing, errors } = useForm({
        code_section: section.code_section,
        nom_section: section.nom_section,
        taux_journalier: section.taux_journalier.toString(),
        taux_rendement: section.taux_rendement.toString(),
        produit_id: section.produit_id.toString(),
        unite_mesure_id: section.unite_mesure_id?.toString() ?? '',
    });

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        put(referentielsSectionsUpdate.url({ section: section.id }));
    };

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <Head title="Modifier la Section" />
            <Heading title="Modifier la Section" description={`Mise à jour des paramètres pour ${section.nom_section}`} />

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Code Section *</label>
                        <input type="text" value={data.code_section} onChange={(e) => setData('code_section', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                        {errors.code_section && <p className="text-xs text-destructive">{errors.code_section}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Nom de la section *</label>
                        <input type="text" value={data.nom_section} onChange={(e) => setData('nom_section', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                        {errors.nom_section && <p className="text-xs text-destructive">{errors.nom_section}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-xl">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Taux journalier (FCFA) *</label>
                        <input type="number" step="0.01" value={data.taux_journalier} onChange={(e) => setData('taux_journalier', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                        {errors.taux_journalier && <p className="text-xs text-destructive">{errors.taux_journalier}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Taux rendement (FCFA) *</label>
                        <input type="number" step="0.01" value={data.taux_rendement} onChange={(e) => setData('taux_rendement', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                        {errors.taux_rendement && <p className="text-xs text-destructive">{errors.taux_rendement}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Produit cible *</label>
                        <select value={data.produit_id} onChange={(e) => setData('produit_id', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" required>
                            <option value="">Sélectionner un produit...</option>
                            {produits.map((p: any) => <option key={p.id} value={p.id}>{p.nom_produit}</option>)}
                        </select>
                        {errors.produit_id && <p className="text-xs text-destructive">{errors.produit_id}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Unité de mesure</label>
                        <select value={data.unite_mesure_id} onChange={(e) => setData('unite_mesure_id', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                            <option value="">Aucune</option>
                            {unitesMesure.map((u: any) => <option key={u.id} value={u.id}>{u.libelle}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" asChild>
                        <Link href={referentielsSectionsIndex.url()}>Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white min-w-[150px]">
                        {processing ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                </div>
            </form>
        </div>
    );
}