import { useForm, usePage, Link, Head } from '@inertiajs/react';
import { pointageStore } from '@/routes';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';

export default function Create() {
    const { sites, sections, types, today } = usePage<any>().props;

    const { data, setData, post, processing, errors } = useForm({
        site_id: '',
        section_id: '',
        date: today,
        type_pointage: 'RENDEMENT',
    });

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        post(pointageStore.url());
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6 bg-background">
            <Head title="Nouveau Pointage" />
            
            <div className="mb-6">
                <Link href="/pointages" className="flex items-center text-sm font-bold text-primary hover:text-primary/80 mb-2">
                    <ChevronLeft size={16} /> Retour aux feuilles
                </Link>
                <Heading title="Nouvelle feuille de pointage" description="Initialiser une feuille de présence pour une section" />
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-border rounded-xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Site d'exploitation *</label>
                        <select
                            value={data.site_id}
                            onChange={(e) => setData('site_id', e.target.value)}
                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none ${errors.site_id ? 'border-destructive' : 'border-border'}`}
                        >
                            <option value="">Sélectionner un site</option>
                            {sites.map((s: any) => <option key={s.id} value={s.id}>{s.nom_site}</option>)}
                        </select>
                        {errors.site_id && <p className="text-xs text-destructive font-medium">{errors.site_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-primary">Section / Filière *</label>
                        <select
                            value={data.section_id}
                            onChange={(e) => setData('section_id', e.target.value)}
                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-secondary outline-none ${errors.section_id ? 'border-destructive' : 'border-border'}`}
                        >
                            <option value="">Sélectionner une section</option>
                            {sections.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.nom_section} ({s.produit?.nom_produit})
                                </option>
                            ))}
                        </select>
                        {errors.section_id && <p className="text-xs text-destructive font-medium">{errors.section_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Date du pointage *</label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('date', e.target.value)}
                            className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Méthode de calcul *</label>
                        <select
                            value={data.type_pointage}
                            onChange={(e) => setData('type_pointage', e.target.value)}
                            className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                        >
                            {types.map((t: any) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end gap-3">
                    <Button variant="outline" asChild><Link href="/pointages">Annuler</Link></Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white min-w-[180px]">
                        {processing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                        Générer la feuille
                    </Button>
                </div>
            </form>
        </div>
    );
}