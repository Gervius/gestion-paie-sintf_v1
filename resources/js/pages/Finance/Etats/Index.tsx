import { usePage, Link, router, Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FileCheck, CheckCircle2, Eye, LayoutList, Zap, Filter, Clock, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';

import { financeEtatsShow, financeEtatsCampagne } from '@/routes';

export default function Index() {
    const { etats, sections, date_debut_suggeree, filters, flash } = usePage<any>().props;
    const [showForm, setShowForm] = useState(false);

    // Formulaire de Campagne
    const { data, setData, post, processing, errors, reset } = useForm({
        section_id: '', 
        date_debut: date_debut_suggeree, 
        date_fin: new Date().toISOString().split('T')[0],
    });

    const handleGenerate = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(financeEtatsCampagne.url(), {
            onSuccess: () => {
                setShowForm(false);
                reset();
            },
        });
    };

    // Fonction de filtrage dynamique (Inertia sans rechargement lourd)
    const handleFilterChange = (key: string, value: string) => {
        router.get('/finance/etats', { ...filters, [key]: value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="États de Paiement" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
                    <span className="font-bold text-sm">{flash.error}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Contrôle des États de Paie" description="Validation section par section avant décaissement" />
                <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-white font-bold h-11">
                    <Zap className="mr-2 h-5 w-5" /> Lancer une Campagne
                </Button>
            </div>

            {/* LE FORMULAIRE HAUTE PERFORMANCE (Gardé intact) */}
            {showForm && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-md animate-in fade-in zoom-in duration-200">
                    <h3 className="text-sm font-black text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
                        <LayoutList size={18}/> Paramètres de génération
                    </h3>
                    
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-gray-700">Cible (Section)</label>
                            <select
                                value={data.section_id}
                                onChange={(e) => setData('section_id', e.target.value)}
                                className="w-full p-3 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm font-bold text-primary bg-primary/5 cursor-pointer"
                            >
                                <option value="">🌟 GÉNÉRER POUR TOUTES LES SECTIONS ACTIVES</option>
                                <optgroup label="Ou générer pour une section spécifique :">
                                    {sections.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.code_section} - {s.nom_section}</option>
                                    ))}
                                </optgroup>
                            </select>
                            <p className="text-[10px] text-muted-foreground mt-1">Laissez vide pour traiter toute l'usine d'un coup.</p>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Depuis le *</label>
                            <input type="date" value={data.date_debut} onChange={(e) => setData('date_debut', e.target.value)} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700">Jusqu'au *</label>
                            <input type="date" value={data.date_fin} onChange={(e) => setData('date_fin', e.target.value)} className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" required />
                        </div>
                        <div className="md:col-span-4 flex justify-end gap-3 mt-2 border-t pt-4">
                            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
                            <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white h-11 px-8 font-black">
                                {processing ? 'Traitement en cours...' : 'Générer les États'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* 💡 NOUVEAU : BARRE DE FILTRES INTELLIGENTE */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-3 rounded-xl border border-border shadow-sm">
                
                {/* Onglets de Statut */}
                <div className="flex bg-muted/50 p-1 rounded-lg">
                    <button 
                        onClick={() => handleFilterChange('status', 'PROVISOIRE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${filters.status === 'PROVISOIRE' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Clock size={16}/> À Valider
                    </button>
                    <button 
                        onClick={() => handleFilterChange('status', 'VALIDE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${filters.status === 'VALIDE' ? 'bg-white shadow-sm text-green-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <CheckCircle2 size={16}/> Historique (Validés)
                    </button>
                    <button 
                        onClick={() => handleFilterChange('status', 'TOUS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${filters.status === 'TOUS' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Archive size={16}/> Tous
                    </button>
                </div>

                {/* Filtre par Section */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={16} className="text-muted-foreground" />
                    <select 
                        value={filters.section_id || ''}
                        onChange={(e) => handleFilterChange('section_id', e.target.value)}
                        className="w-full md:w-64 p-2 text-sm font-bold bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Toutes les sections</option>
                        {sections.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.nom_section}</option>
                        ))}
                    </select>
                </div>
            </div>

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
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    {filters.status === 'PROVISOIRE' 
                                        ? "Vous n'avez aucun état en attente de validation." 
                                        : "Aucun état trouvé pour ces critères."}
                                </td>
                            </tr>
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
                                        <Link href={financeEtatsShow.url({ etat: etat.id })} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all">
                                            <Eye size={14} /> {etat.statut === 'PROVISOIRE' ? 'Vérifier' : 'Ouvrir'}
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {etats.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {etats.links.map((link: any, i: number) => (
                        <Link
                            key={i} href={link.url || '#'} preserveState preserveScroll
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${link.active ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-border hover:bg-muted'} ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}