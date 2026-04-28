import { usePage, Link, router, Head, useForm } from '@inertiajs/react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { 
    Eye, Zap, CalendarRange, CheckSquare, Square, 
    Search, Inbox, ChevronRight, CheckCircle2, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { financeEtatsShow, financeEtatsCampagne } from '@/routes';

export default function Index() {
    const { etats, sections, date_debut_suggeree, filters, auth } = usePage<any>().props;
    
    const userPerms = auth?.user?.permissions || [];
    const isSuperAdmin = userPerms.includes('*') || auth?.user?.roles?.includes('Super Admin');
    const canGenererCampagne = isSuperAdmin || userPerms.includes('etats.creer');
    
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'PROVISOIRE');
    const isInitialRender = useRef(true);

    const { data, setData, post, processing } = useForm({
        section_ids: [] as number[],
        date_debut: date_debut_suggeree,
        date_fin: new Date().toISOString().split('T')[0],
    });

    const applyFilters = useCallback(() => {
        router.get(window.location.pathname, { 
            search: searchTerm, 
            status: statusFilter 
        }, { preserveState: true, replace: true, preserveScroll: true });
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        applyFilters();
    }, [statusFilter]);

    const toggleSection = useCallback((id: number) => {
        setData(prevData => {
            const current = [...prevData.section_ids];
            return {
                ...prevData,
                section_ids: current.includes(id) ? current.filter(i => i !== id) : [...current, id]
            };
        });
    }, []);

    const toggleAll = useCallback(() => {
        setData(prevData => ({
            ...prevData,
            section_ids: prevData.section_ids.length === sections.length ? [] : sections.map((s:any) => s.id)
        }));
    }, [sections]);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Campagnes de Paie" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Heading title="États de Paiement" description="Consolidation et préparation des virements" />
                {canGenererCampagne && (
                    <Button 
                        onClick={() => setShowForm(!showForm)} 
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold h-11 shadow-md hover:scale-105 transition-transform"
                    >
                        {showForm ? <ChevronRight className="mr-2 rotate-90" /> : <Zap size={18} className="mr-2" />}
                        Générer une campagne
                    </Button>
                )}
            </div>

            {/* FORMULAIRE SOBRE */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <form onSubmit={(e) => { e.preventDefault(); post(financeEtatsCampagne.url(), { onSuccess: () => setShowForm(false) }); }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Période du</label>
                                <input type="date" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} className="w-full px-3 py-2 text-sm font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Au (inclus)</label>
                                <input type="date" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} className="w-full px-3 py-2 text-sm font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all" />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Sections à inclure</label>
                                <button type="button" onClick={toggleAll} className="text-xs font-bold text-secondary underline hover:text-secondary/80">
                                    {data.section_ids.length === sections.length ? 'Tout décocher' : 'Tout cocher'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                {sections.map((s:any) => (
                                    <div key={s.id} onClick={() => toggleSection(s.id)} className={`p-3 border rounded-xl cursor-pointer flex items-center gap-2 transition-all ${data.section_ids.includes(s.id) ? 'border-secondary bg-secondary/5' : 'border-border bg-white hover:border-gray-300'}`}>
                                        {data.section_ids.includes(s.id) ? <CheckSquare className="text-secondary" size={16}/> : <Square className="text-gray-300" size={16}/>}
                                        <span className="text-[10px] font-black uppercase truncate">{s.nom_section}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={processing || data.section_ids.length === 0} className="w-full bg-secondary hover:bg-secondary/90 h-12 font-black uppercase text-sm">
                            {processing ? 'Calcul en cours...' : 'Lancer la consolidation'}
                        </Button>
                    </form>
                </div>
            )}

            {/* FILTRES FAÇON "AVANCES" */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-3 rounded-xl border border-border shadow-sm">
                <div className="flex bg-muted/50 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
                    <button 
                        onClick={() => setStatusFilter('PROVISOIRE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${statusFilter === 'PROVISOIRE' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        Provisoires
                    </button>
                    <button 
                        onClick={() => setStatusFilter('A_PAYER')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${statusFilter === 'A_PAYER' ? 'bg-white shadow-sm text-blue-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Clock size={16}/> À Décaisser
                    </button>
                    <button 
                        onClick={() => setStatusFilter('SOLDE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${statusFilter === 'SOLDE' ? 'bg-white shadow-sm text-green-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <CheckCircle2 size={16}/> Soldés
                    </button>
                    <button 
                        onClick={() => setStatusFilter('TOUS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${statusFilter === 'TOUS' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        Tous
                    </button>
                </div>

                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                        type="text" 
                        placeholder="Chercher une référence ou section..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                        className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all"
                    />
                </div>
            </div>

            {/* TABLEAU SOBRE */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[800px] text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px]">Référence & Période</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-center">Type</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-right">Masse Salariale</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-center">Statut</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {etats.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                        <div className="bg-slate-50 p-4 rounded-full"><Inbox size={32} /></div>
                                        <p className="font-bold text-sm">Aucune campagne trouvée</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            etats.data.map((etat:any) => (
                                <tr key={etat.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-black text-sm text-gray-900">{etat.reference_etat}</div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                                {etat.section?.nom_section}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <CalendarRange size={12} />
                                                Du {new Date(etat.date_debut).toLocaleDateString()} au {new Date(etat.date_fin).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" className="text-[9px] uppercase border-gray-200 text-gray-600 bg-white">
                                            {etat.type_pointage}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="text-gray-900 font-black text-base">{Number(etat.montant_total_net).toLocaleString()} F</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {etat.statut === 'PROVISOIRE' && (
                                            <Badge className="px-3 py-1 text-[10px] font-black uppercase border-0 bg-orange-100 text-orange-700">PROVISOIRE</Badge>
                                        )}
                                        {etat.statut === 'VALIDE' && etat.tickets_non_soldes_count > 0 && (
                                            <Badge className="px-3 py-1 text-[10px] font-black uppercase border-0 bg-blue-100 text-blue-700 animate-pulse">
                                                À DÉCAISSER
                                            </Badge>
                                        )}
                                        {etat.statut === 'VALIDE' && etat.tickets_non_soldes_count === 0 && (
                                            <Badge className="px-3 py-1 text-[10px] font-black uppercase border-0 bg-green-100 text-green-700">
                                                SOLDÉ
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            href={financeEtatsShow.url({ etat: etat.id })} 
                                            className="p-2 bg-gray-100 text-gray-500 rounded-lg inline-flex hover:bg-secondary hover:text-white transition-all"
                                        >
                                            <Eye size={18} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {etats?.last_page > 1 && (
                <div className="mt-4">
                    <Pagination links={etats.links} />
                </div>
            )}
        </div>
    );
}