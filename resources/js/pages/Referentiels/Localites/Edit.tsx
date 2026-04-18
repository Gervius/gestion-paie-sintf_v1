import { Head, usePage, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { referentielsLocalitesUpdate, referentielsLocalitesIndex } from '@/routes';

export default function Edit() {
    const { localite } = usePage<any>().props;

    const { data, setData, put, processing, errors } = useForm({
        code_localite: localite.code_localite,
        nom_localite: localite.nom_localite,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(referentielsLocalitesUpdate.url({ localite: localite.id }));
    };

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Head title="Modifier Localité" />
            <Heading title="Modifier la Localité" description={`Mise à jour des informations de ${localite.nom_localite}`} />

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-border shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">Code *</label>
                    <input type="text" value={data.code_localite} onChange={(e) => setData('code_localite', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                    {errors.code_localite && <p className="text-xs text-destructive">{errors.code_localite}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">Nom du Village / Localité *</label>
                    <input type="text" value={data.nom_localite} onChange={(e) => setData('nom_localite', e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none" required />
                    {errors.nom_localite && <p className="text-xs text-destructive">{errors.nom_localite}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" asChild>
                        <Link href={referentielsLocalitesIndex.url()}>Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white min-w-[150px]">
                        {processing ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                </div>
            </form>
        </div>
    );
}