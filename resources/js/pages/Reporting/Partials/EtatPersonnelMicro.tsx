import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Filter, Loader2, FileText, FileSpreadsheet, Package, Calendar, UserSquare, Wrench, Layers, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EtatPersonnelMicro({ produits, sections, personnels }: { produits: any[], sections: any[], personnels: any[] }) {
    const [filters, setFilters] = useState({
        date_debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        date_fin: new Date().toISOString().split('T')[0],
        produit_id: '',
        section_id: '',
        personnel_id: '',
    });

    const [agentSearchQuery, setAgentSearchQuery] = useState('');
    const [showAgentList, setShowAgentList] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setShowAgentList(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredAgents = personnels.filter(p => {
        const searchStr = (p.matricule + ' ' + p.nom + ' ' + p.prenom).toLowerCase();
        return searchStr.includes(agentSearchQuery.toLowerCase());
    }).slice(0, 50);

    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        if (!filters.personnel_id) return setError("Veuillez sélectionner un agent.");
        setIsLoading(true); setError(null);
        try {
            const response = await axios.post('/api/reporting/etat-personnel', filters);
            setReportData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur de génération.");
        } finally {
            setIsLoading(false);
        }
    };

    const getExportUrl = (format: 'pdf' | 'excel') => {
        const params = new URLSearchParams();
        if (filters.date_debut) params.append('date_debut', filters.date_debut);
        if (filters.date_fin) params.append('date_fin', filters.date_fin);
        if (filters.personnel_id) params.append('personnel_id', filters.personnel_id);
        if (filters.produit_id) params.append('produit_id', filters.produit_id);
        if (filters.section_id) params.append('section_id', filters.section_id);
        return `/api/reporting/etat-personnel/${format}?${params.toString()}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PANNEAU FILTRES */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-border shadow-sm h-fit space-y-6">
                <div className="flex items-center gap-2 text-primary border-b pb-4">
                    <Filter size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm">Filtres (Micro)</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Calendar size={14}/> Période</label>
                        <input type="date" value={filters.date_debut} onChange={(e) => setFilters({...filters, date_debut: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary" />
                        <input type="date" value={filters.date_fin} onChange={(e) => setFilters({...filters, date_fin: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary" />
                    </div>

                    <div className="space-y-2 relative" ref={wrapperRef}>
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><UserSquare size={14}/> Recherche Agent</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input 
                                type="text" placeholder="Ex: BO-2026-001 ou Traoré" value={agentSearchQuery}
                                onChange={(e) => { setAgentSearchQuery(e.target.value); setShowAgentList(true); }}
                                onClick={() => setShowAgentList(true)}
                                className="w-full text-sm font-bold border-2 border-slate-200 pl-10 pr-3 py-2 rounded-xl outline-none focus:border-primary"
                            />
                        </div>
                        {showAgentList && (
                            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filteredAgents.map(agent => (
                                    <div key={agent.id} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                                        onClick={() => {
                                            setFilters({...filters, personnel_id: agent.id.toString()});
                                            setAgentSearchQuery(`${agent.matricule} - ${agent.nom} ${agent.prenom}`);
                                            setShowAgentList(false);
                                        }}>
                                        <div className="font-black text-sm text-slate-800">{agent.nom} {agent.prenom}</div>
                                        <div className="text-xs font-mono text-slate-500">{agent.matricule}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Package size={14}/> Produit</label>
                        <select value={filters.produit_id} onChange={(e) => setFilters({...filters, produit_id: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary">
                            <option value="">Tous</option>
                            {produits.map(prod => <option key={prod.id} value={prod.id}>{prod.nom_produit}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Wrench size={14}/> Section</label>
                        <select value={filters.section_id} onChange={(e) => setFilters({...filters, section_id: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary">
                            <option value="">Toutes</option>
                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.nom_section}</option>)}
                        </select>
                    </div>

                    <Button onClick={fetchReport} disabled={isLoading} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-md mt-4 transition-all">
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Générer la fiche"}
                    </Button>
                    {error && <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                </div>
            </div>

            {/* ZONE RÉSULTAT */}
            <div className="lg:col-span-3">
                {isLoading && !reportData ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Calcul des rendements...</p>
                    </div>
                ) : reportData ? (
                    <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
                        
                        {/* EN-TÊTE AVEC BOUTONS */}
                        <div className="bg-slate-800 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">État de Paiement Personnel</h3>
                                <p className="text-slate-300 text-xs font-medium mt-1 uppercase">Du {reportData.periode.debut} au {reportData.periode.fin}</p>
                                <div className="mt-4 bg-slate-700/50 p-3 rounded-lg inline-block border border-slate-600">
                                    <div className="text-lg font-black">{reportData.personnel.nom_complet}</div>
                                    <div className="text-xs text-slate-300 font-mono mt-1">Matricule: {reportData.personnel.matricule}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Le bouton PDF qu'on a codé précédemment */}
                                <a href={getExportUrl('pdf')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-black transition-colors">
                                    <FileText size={16} className="text-red-400" /> Fiche PDF
                                </a>
                                {/* Le bouton EXCEL que nous ferons à la prochaine étape */}
                                <a href={getExportUrl('excel')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-black transition-colors">
                                    <FileSpreadsheet size={16} className="text-emerald-400" /> EXCEL
                                </a>
                                <Badge className="bg-white text-slate-800 font-black px-4 py-1 ml-2">MICRO</Badge>
                            </div>
                        </div>

                        {/* TABLEAU */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b-2 border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-4 py-4">Produit</th>
                                        <th className="px-4 py-4">Section</th>
                                        <th className="px-4 py-4 text-center">Taux</th>
                                        <th className="px-4 py-4 text-center bg-orange-50 border-x border-orange-100">Qté Totale</th>
                                        <th className="px-4 py-4 text-center">Jours</th>
                                        <th className="px-4 py-4 text-center">Rendement Moy.</th>
                                        <th className="px-6 py-4 text-right">Montant Brut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reportData.lignes.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400 italic font-bold">Aucune activité enregistrée.</td></tr>
                                    ) : (
                                        reportData.lignes.map((ligne: any, index: number) => (
                                            <tr key={index} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-bold text-xs text-slate-600 uppercase">{ligne.produit}</td>
                                                <td className="px-4 py-3 font-black text-xs text-slate-800 uppercase">{ligne.section}</td>
                                                <td className="px-4 py-3 text-center text-xs font-mono">{ligne.taux}</td>
                                                <td className="px-4 py-3 text-center font-black text-orange-600 bg-orange-50/30 border-x border-orange-50">
                                                    {ligne.quantite_totale} <span className="text-[9px] text-orange-400">{ligne.unite}</span>
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-slate-600">{ligne.nb_jours}</td>
                                                <td className="px-4 py-3 text-center font-bold text-emerald-600">{ligne.rendement_moyen}</td>
                                                <td className="px-6 py-3 text-right font-black text-slate-900">{ligne.montant_a_payer.toLocaleString()} CFA</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {reportData.lignes.length > 0 && (
                                <tfoot className="border-t-2 border-gray-300">
                                    <tr>
                                        <td colSpan={8} className="text-right uppercase pr-4 py-2 font-bold text-gray-700">
                                            Montant Total :
                                        </td>
                                        <td className="text-right font-bold py-2">
                                            {reportData.finances?.montant_total?.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={8} className="text-right uppercase pr-4 py-2 font-bold text-red-600">
                                            Avance Déduite :
                                        </td>
                                        <td className="text-right font-bold py-2 text-red-600">
                                            - {reportData.finances?.avance_deduite?.toLocaleString()}
                                        </td>
                                    </tr>
                                    <tr className="bg-gray-100">
                                        <td colSpan={8} className="text-right uppercase pr-4 py-3 font-black text-gray-900">
                                            Net à Payer :
                                        </td>
                                        <td className="text-right font-black py-3 text-emerald-700">
                                            {reportData.finances?.net_a_payer?.toLocaleString()} CFA
                                        </td>
                                    </tr>
                                </tfoot>
        )}
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Layers className="text-slate-300 mb-3" size={40} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recherchez un agent (Micro)</p>
                    </div>
                )}
            </div>
        </div>
    );
}