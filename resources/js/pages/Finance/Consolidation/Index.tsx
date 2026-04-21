import { usePage, router, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Wallet, Banknote, CheckCircle2, FileSpreadsheet, FileText, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';

export default function Index() {
    const { data, currentGlobalLot, can } = usePage<any>().props;
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState<'WAVE' | 'ESPECES'>('WAVE');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['data', 'stats', 'currentGlobalLot'], // On ne recharge que la donnée pure
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setIsRefreshing(false)
        });
    };

    const filteredData = data.filter((item: any) => {
        const matchSearch = item.nom_complet.toLowerCase().includes(search.toLowerCase()) || item.matricule.toLowerCase().includes(search.toLowerCase());
        const matchMode = item.mode_paiement === filterMode;
        return matchSearch && matchMode;
    });

    const totalNet = filteredData.reduce((sum: number, item: any) => sum + item.total_net, 0);

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Consolidation Globale" />
            
            <div className="flex justify-between items-start">
                <div>
                    <Heading title="Consolidation de Paie Usine" description="Regroupement multi-sections pour paiement de masse" />
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRefresh} 
                        className={`mt-2 text-primary hover:text-primary/80 px-0 ${isRefreshing ? 'opacity-50' : ''}`}
                    >
                        <RefreshCcw size={14} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
                        Synchroniser les validations récentes
                    </Button>
                </div>
                
                {/* BLOC D'ACTION DYNAMIQUE (LE COEUR DU DESIGN) */}
                <div className="bg-white border-2 border-primary/20 p-4 rounded-2xl shadow-xl min-w-[400px] animate-in zoom-in-95">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Processus de Paiement : {filterMode}</span>
                        <div className="flex bg-muted p-1 rounded-lg">
                            <button onClick={() => setFilterMode('WAVE')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${filterMode === 'WAVE' ? 'bg-white shadow text-indigo-600' : ''}`}>WAVE</button>
                            <button onClick={() => setFilterMode('ESPECES')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${filterMode === 'ESPECES' ? 'bg-white shadow text-emerald-600' : ''}`}>ESPÈCES</button>
                        </div>
                    </div>

                    {filterMode === 'WAVE' ? (
                        <div className="space-y-4">
                            {!currentGlobalLot ? (
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 text-sm font-medium">Étape 1 : Préparer le lot usine</div>
                                    <Button onClick={() => router.post('/finance/wave/generer-global')} className="bg-indigo-600">Générer Lot Global</Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                        <FileSpreadsheet size={20} />
                                        <div className="flex-1 text-xs">
                                            <strong>Lot {currentGlobalLot.reference_lot}</strong> en cours.<br/>
                                            {filteredData.length} agents concernés.
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700" asChild>
                                            <a href={`/finance/wave/${currentGlobalLot.id}/telecharger`} target="_blank">1. Télécharger Excel</a>
                                        </Button>
                                        <Button onClick={() => confirm('Confirmer le succès des transferts sur le portail ?') && router.post(`/finance/wave/${currentGlobalLot.id}/valider`)} className="flex-1 bg-indigo-600">
                                            2. Confirmer Paiement
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                <Banknote size={20} />
                                <div className="flex-1 text-xs font-bold">PAIEMENT CAISSE USINE : {totalNet.toLocaleString()} F</div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" asChild>
                                    <a href="/finance/consolidation/bordereau-especes" target="_blank" rel="noopener noreferrer">
                                        <FileText size={16} className="mr-2"/> 1. Imprimer Bordereau
                                    </a>
                                </Button>
                                <Button 
                                    onClick={() => confirm('Décaisser la totalité de la caisse ? Les montants seront figés.') && router.post('/finance/payer-tout-especes')} 
                                    className="flex-1 bg-emerald-600 font-black hover:bg-emerald-700"
                                >
                                    2. Valider Décaissement
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* LISTE DES AGENTS CONSOLIDÉS */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-muted/10 flex justify-between items-center">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                        <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-primary" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] font-black text-muted-foreground uppercase">Net Total à décaisser ({filterMode})</div>
                        <div className="text-xl font-black text-primary">{totalNet.toLocaleString()} FCFA</div>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-muted/30 text-[10px] font-black text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4">Agent</th>
                            <th className="px-6 py-4">Sections Impactées</th>
                            <th className="px-6 py-4 text-right">Net Fusionné</th>
                            <th className="px-6 py-4 text-center">État</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredData.map((agent: any) => (
                            <tr key={agent.personnel_id} className="hover:bg-accent/5">
                                <td className="px-6 py-3">
                                    <div className="font-bold">{agent.nom_complet}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground">{agent.matricule}</div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {agent.sections.map((s: string) => <span key={s} className="px-2 py-0.5 bg-white border rounded text-[9px] font-bold uppercase">{s}</span>)}
                                    </div>
                                </td>
                                <td className="px-6 py-3 text-right font-black text-primary">{agent.total_net.toLocaleString()} F</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${agent.statut_paiement === 'EN_COURS' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {agent.statut_paiement}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}