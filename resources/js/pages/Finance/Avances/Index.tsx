import { usePage, useForm, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Wallet, Plus, CheckCircle2, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
// ✅ Importation STRICTE via Wayfinder
import { financeAvancesStore } from '@/routes';

export default function Index() {
    const { avances, personnels, flash } = usePage<any>().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        personnel_id: '',
        montant: '',
        motif: '',
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // ✅ Syntaxe Wayfinder
        post(financeAvancesStore.url(), {
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Gestion des Avances" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Avances sur Salaire" description="Historique des prêts et suivi des soldes restants" />
                <Button 
                    onClick={() => setShowForm(!showForm)} 
                    className="bg-primary hover:bg-primary/90 text-white font-bold"
                >
                    <Plus className="mr-2 h-4 w-4" /> Accorder une avance
                </Button>
            </div>

            {/* FORMULAIRE NOUVELLE AVANCE */}
            {showForm && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-200">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Banknote size={16}/> Saisir une nouvelle avance
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-bold text-gray-700">Agent bénéficiaire *</label>
                            <select
                                value={data.personnel_id}
                                onChange={(e) => setData('personnel_id', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            >
                                <option value="">Sélectionner un agent...</option>
                                {personnels.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.matricule} — {p.nom} {p.prenom}</option>
                                ))}
                            </select>
                            {errors.personnel_id && <p className="text-xs text-destructive">{errors.personnel_id}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Montant (FCFA) *</label>
                            <input
                                type="number" min="500" step="500"
                                value={data.montant}
                                onChange={(e) => setData('montant', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none font-bold"
                                placeholder="Ex: 5000"
                                required
                            />
                            {errors.montant && <p className="text-xs text-destructive">{errors.montant}</p>}
                        </div>
                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-gray-700">Motif *</label>
                            <input
                                type="text"
                                value={data.motif}
                                onChange={(e) => setData('motif', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Transport, Médical..."
                                required
                            />
                            {errors.motif && <p className="text-xs text-destructive">{errors.motif}</p>}
                        </div>
                        <Button type="submit" disabled={processing} className="bg-orange-500 hover:bg-orange-600 text-white h-[46px] w-full font-bold">
                            {processing ? 'Enregistrement...' : 'Valider'}
                        </Button>
                    </form>
                </div>
            )}

            {/* LISTE DES AVANCES */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Date</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Bénéficiaire</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Motif</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Montant Initial</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Reste à Payer</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase text-[10px]">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {avances.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Aucune avance enregistrée.</td></tr>
                        ) : (
                            avances.data.map((avance: any) => (
                                <tr key={avance.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-4 font-medium text-gray-600">
                                        {new Date(avance.date_avance).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-900">{avance.personnel?.nom} {avance.personnel?.prenom}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{avance.personnel?.matricule}</div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700">{avance.motif}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-500">{avance.montant_initial.toLocaleString()} F</td>
                                    <td className="px-4 py-4 text-right font-black text-secondary text-base">
                                        {avance.solde_restant > 0 ? `${avance.solde_restant.toLocaleString()} F` : '0 F'}
                                    </td>
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
        </div>
    );
}