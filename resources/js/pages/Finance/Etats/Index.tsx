import { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Plus, Eye, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { financeEtatsStore, financeEtatsShow } from '@/routes';

export default function Index({ etats, sections }: any) {
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        section_id: '',
        date_etat: new Date().toISOString().split('T')[0],
    });

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        post(financeEtatsStore.url(), {
            onSuccess: () => setShowForm(false),
        });
    };

    const formatMontant = (v: number) => v.toLocaleString('fr-FR') + ' F';

    return (
        <div className="p-6 space-y-6">
            <Head title="États de Paiement" />

            <div className="flex items-center justify-between">
                <Heading title="États de Paiement" description="Génération et suivi des cycles de paie par section" />
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className="bg-primary hover:bg-primary/90 text-white"
                >
                    <Plus size={18} className="mr-2" />
                    Nouvel état
                </Button>
            </div>

            {showForm && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-200">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider">Paramètres de génération</h3>
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Section concernée</label>
                            <select
                                value={data.section_id}
                                onChange={(e) => setData('section_id', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            >
                                <option value="">Sélectionner une section...</option>
                                {sections.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.nom_section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Date de l'état</label>
                            <input
                                type="date"
                                value={data.date_etat}
                                onChange={(e) => setData('date_etat', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="bg-secondary hover:bg-secondary/90 text-white h-[46px]"
                        >
                            {processing ? <Loader2 className="animate-spin mr-2" /> : <FileText className="mr-2" size={18} />}
                            Générer l'état
                        </Button>
                    </form>
                    {errors.section_id && <p className="mt-2 text-xs text-destructive font-medium">{errors.section_id}</p>}
                </div>
            )}

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Référence</th>
                            <th className="px-6 py-4 text-left">Section</th>
                            <th className="px-6 py-4 text-center">Date</th>
                            <th className="px-6 py-4 text-right">Total Net</th>
                            <th className="px-6 py-4 text-center">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {etats.data.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Aucun état de paiement trouvé</td></tr>
                        ) : (
                            etats.data.map((etat: any) => (
                                <tr key={etat.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-secondary">{etat.reference_etat}</td>
                                    <td className="px-6 py-4 font-medium">{etat.section.nom_section}</td>
                                    <td className="px-6 py-4 text-center text-gray-600">
                                        {new Date(etat.date_etat).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-primary">
                                        {formatMontant(etat.montant_total_net)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge className={etat.statut === 'VALIDE' ? 'bg-primary/20 text-primary' : 'bg-orange-100 text-orange-700'}>
                                            {etat.statut}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={financeEtatsShow.url({ etat: etat.id })}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all"
                                        >
                                            <Eye size={14} />
                                            Détails
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}