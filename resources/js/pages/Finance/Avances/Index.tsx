import { usePage, useForm, Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Banknote, Search, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { financeAvancesStore } from '@/routes';

export default function Index() {
    const { avances, personnels, filters, flash } = usePage<any>().props;
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(window.location.pathname, { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    const { data, setData, post, processing, errors, reset } = useForm({
        personnel_id: '', montant: '', motif: '', date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(financeAvancesStore.url(), { onSuccess: () => { setShowForm(false); reset(); } });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Avances" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Avances sur Salaire" description="Historique des prêts et suivi des soldes restants" />
                <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Accorder une avance
                </Button>
            </div>

            {/* FORMULAIRE D'AVANCE */}
            {showForm && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase flex items-center gap-2"><Banknote size={16}/> Saisir une nouvelle avance</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-700">Agent bénéficiaire *</label>
                            <select value={data.personnel_id} onChange={(e) => setData('personnel_id', e.target.value)} className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required>
                                <option value="">Sélectionner...</option>
                                {personnels.map((p: any) => <option key={p.id} value={p.id}>{p.matricule} — {p.nom} {p.prenom}</option>)}
                            </select>
                            {errors.personnel_id && <p className="text-xs text-destructive">{errors.personnel_id}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Montant (FCFA) *</label>
                            <input type="number" min="500" step="500" value={data.montant} onChange={(e) => setData('montant', e.target.value)} className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none font-bold" required />
                        </div>
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-gray-700">Motif *</label>
                            <input type="text" value={data.motif} onChange={(e) => setData('motif', e.target.value)} className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                        <Button type="submit" disabled={processing} className="bg-orange-500 hover:bg-orange-600 text-white h-[46px] w-full font-bold">
                            {processing ? 'En cours...' : 'Valider'}
                        </Button>
                    </form>
                </div>
            )}

            <div className="flex bg-white p-2 rounded-xl border border-border shadow-sm max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" placeholder="Rechercher agent ou motif..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px] flex items-center gap-2"><CalendarClock size={14} className="text-secondary"/> Date</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Bénéficiaire</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Motif</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Montant Initial</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Reste à Payer</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase text-[10px]">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {avances.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-bold">Aucune avance correspondante.</td></tr>
                        ) : (
                            avances.data.map((avance: any) => (
                                <tr key={avance.id} className="hover:bg-accent/5">
                                    <td className="px-4 py-4 font-medium text-gray-600">{new Date(avance.date_avance).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-900">{avance.personnel?.nom} {avance.personnel?.prenom}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{avance.personnel?.matricule}</div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700">{avance.motif}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-500">{avance.montant_initial.toLocaleString()} F</td>
                                    <td className="px-4 py-4 text-right font-black text-secondary text-base">{avance.solde_restant > 0 ? `${avance.solde_restant.toLocaleString()} F` : '0 F'}</td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge className={`border-0 ${avance.statut === 'SOLDEE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {avance.statut === 'SOLDEE' ? 'REMBOURSÉE' : 'EN COURS'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={avances.links} />
        </div>
    );
}