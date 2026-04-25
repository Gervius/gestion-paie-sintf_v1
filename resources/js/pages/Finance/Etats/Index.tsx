import { usePage, Link, router, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileCheck, Eye, LayoutList, Zap, CalendarRange, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { financeEtatsShow, financeEtatsCampagne } from '@/routes';

export default function Index() {
    const { etats, sections, date_debut_suggeree, filters } = usePage<any>().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing } = useForm({
        section_ids: [] as number[],
        date_debut: date_debut_suggeree,
        date_fin: new Date().toISOString().split('T')[0],
    });

    const toggleSection = (id: number) => {
        const current = [...data.section_ids];
        setData('section_ids', current.includes(id) ? current.filter(i => i !== id) : [...current, id]);
    };

    const toggleAll = () => setData('section_ids', data.section_ids.length === sections.length ? [] : sections.map((s:any) => s.id));

    return (
        <div className="p-6 space-y-6">
            <Head title="Campagnes de Paie" />
            <div className="flex justify-between items-center">
                <Heading title="États de Paiement" description="Consolidation multi-sections" />
                <Button onClick={() => setShowForm(!showForm)} className="bg-secondary font-black">
                    <Zap className="mr-2 h-4 w-4" /> Générer campagne
                </Button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl border-2 border-secondary/20 shadow-sm animate-in zoom-in-95">
                    <form onSubmit={(e) => { e.preventDefault(); post(financeEtatsCampagne.url(), { onSuccess: () => setShowForm(false) }); }} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="p-3 border-2 rounded-xl font-bold" />
                            <input type="date" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} className="p-3 border-2 rounded-xl font-bold" />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-black uppercase">Sélectionner les sections</span>
                                <button type="button" onClick={toggleAll} className="text-xs font-bold text-secondary underline">
                                    {data.section_ids.length === sections.length ? 'Tout décocher' : 'Tout cocher'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {sections.map((s:any) => (
                                    <div key={s.id} onClick={() => toggleSection(s.id)} className={`p-3 border-2 rounded-xl cursor-pointer flex items-center gap-2 transition-all ${data.section_ids.includes(s.id) ? 'border-secondary bg-secondary/5' : 'border-slate-100'}`}>
                                        {data.section_ids.includes(s.id) ? <CheckSquare className="text-secondary" size={18}/> : <Square className="text-slate-300" size={18}/>}
                                        <span className="text-[10px] font-black uppercase">{s.nom_section}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={processing || data.section_ids.length === 0} className="w-full bg-secondary h-12 font-black uppercase">
                            Lancer la consolidation
                        </Button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Référence</th>
                            <th className="px-6 py-4 text-center">Type</th>
                            <th className="px-6 py-4 text-right">Masse Salariale</th>
                            <th className="px-6 py-4 text-center">Statut</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y font-bold">
                        {etats.data.map((etat:any) => (
                            <tr key={etat.id} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4">
                                    <div className="text-secondary">{etat.reference_etat}</div>
                                    <div className="text-[10px] text-slate-400">{etat.section?.nom_section}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Badge variant="outline" className="text-[9px] uppercase">{etat.type_pointage}</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">{Number(etat.montant_total_net).toLocaleString()} F</td>
                                <td className="px-6 py-4 text-center">
                                    <Badge className={etat.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>{etat.statut}</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link href={financeEtatsShow.url({ etat: etat.id })} className="p-2 bg-slate-100 rounded-lg inline-flex hover:bg-primary hover:text-white transition-colors">
                                        <Eye size={18} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination links={etats.links} />
        </div>
    );
}