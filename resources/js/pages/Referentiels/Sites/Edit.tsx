import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsSitesUpdate, referentielsSitesIndex } from '@/routes';

export default function Edit() {
    const { site } = usePage<any>().props;
    const { data, setData, put, processing, errors } = useForm({ code_site: site.code_site, nom_site: site.nom_site });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(referentielsSitesUpdate.url({ site: site.id }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Head title="Modifier le Site" />
            <Heading title="Modifier le Site" description={`Mise à jour des informations de ${site.nom_site}`} />

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">Code du site *</label>
                    <input type="text" value={data.code_site} onChange={(e) => setData('code_site', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                    {errors.code_site && <p className="text-xs text-destructive">{errors.code_site}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">Nom du site *</label>
                    <input type="text" value={data.nom_site} onChange={(e) => setData('nom_site', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                    {errors.nom_site && <p className="text-xs text-destructive">{errors.nom_site}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" asChild>
                        <Link href={referentielsSitesIndex.url()}>Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white min-w-[150px]">
                        {processing ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                </div>
            </form>
        </div>
    );
}