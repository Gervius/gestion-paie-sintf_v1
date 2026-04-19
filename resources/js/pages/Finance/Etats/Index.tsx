import { usePage, Link, router, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileCheck, Upload, Plus, CheckCircle2, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';

import { financeEtatsStore, financeEtatsShow, financeWaveGenererGlobal } from '@/routes';

export default function Index() {
    const { etats, sections, flash } = usePage<any>().props;
    const [showForm, setShowForm] = useState(false);

    // Formulaire pour l'état périodique
    const { data, setData, post, processing, errors, reset } = useForm({
        section_id: '',
        date_debut: '',
        date_fin: new Date().toISOString().split('T')[0],
    });

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(financeEtatsStore.url(), {
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    const handleWaveGlobal = () => {
        if (!confirm('Générer un fichier Wave pour TOUS les tickets validés non soldés ?')) return;
        // ✅ Syntaxe Wayfinder
        router.post(financeWaveGenererGlobal.url());
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="États de Paiement" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="États de paiement" description="Générer et consulter les cumuls financiers par section" />
                <div className="flex gap-3">
                    <Button 
                        onClick={handleWaveGlobal} 
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold"
                    >
                        <Upload className="mr-2 h-4 w-4" /> Export Wave Global
                    </Button>
                    <Button 
                        onClick={() => setShowForm(!showForm)} 
                        className="bg-primary hover:bg-primary/90 text-white font-bold"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nouvel État Périodique
                    </Button>
                </div>
            </div>

            {/* FORMULAIRE PÉRIODIQUE */}
            {showForm && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-sm animate-in fade-in zoom-in duration-200">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={16}/> Agréger les pointages d'une période
                    </h3>
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Section concernée *</label>
                            <select
                                value={data.section_id}
                                onChange={(e) => setData('section_id', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            >
                                <option value="">Sélectionner...</option>
                                {sections.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.nom_section}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Du (Date début) *</label>
                            <input
                                type="date"
                                value={data.date_debut}
                                onChange={(e) => setData('date_debut', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Au (Date fin) *</label>
                            <input
                                type="date"
                                value={data.date_fin}
                                onChange={(e) => setData('date_fin', e.target.value)}
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white h-[46px] w-full font-bold">
                            {processing ? 'Calcul...' : 'Agréger & Générer'}
                        </Button>
                    </form>
                    {errors.section_id && <p className="mt-2 text-xs text-destructive font-medium">{errors.section_id}</p>}
                    {errors.date_debut && <p className="mt-1 text-xs text-destructive font-medium">{errors.date_debut}</p>}
                </div>
            )}

            {/* LISTE DES ÉTATS */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Référence</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Date / Section</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Total Brut</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Total Net</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase text-[10px]">Statut</th>
                            <th className="px-4 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {etats.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Aucun état de paiement trouvé.</td></tr>
                        ) : (
                            etats.data.map((etat: any) => (
                                <tr key={etat.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-4 font-mono font-bold text-gray-900">{etat.reference_etat}</td>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-secondary">{etat.section?.nom_section}</div>
                                        <div className="text-[10px] text-muted-foreground">{new Date(etat.date_etat).toLocaleDateString('fr-FR')}</div>
                                    </td>
                                    <td className="px-4 py-4 text-right font-medium text-gray-600">{etat.montant_total_brut.toLocaleString()} F</td>
                                    <td className="px-4 py-4 text-right font-black text-primary text-base">{etat.montant_total_net.toLocaleString()} F</td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge className={`border-0 ${etat.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {etat.statut}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        {/* ✅ Syntaxe Wayfinder */}
                                        <Link href={financeEtatsShow.url({ etat: etat.id })} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all">
                                            <Eye size={14} /> Ouvrir
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination si nécessaire */}
            {etats.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {etats.links.map((link: any, i: number) => (
                        <Link
                            key={i} href={link.url || '#'} preserveState
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${link.active ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-border hover:bg-muted'} ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}