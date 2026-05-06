import { useState } from 'react';
import axios from 'axios';
import { Filter, Loader2, FileText, FileSpreadsheet, Building2, Package, Calendar, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EtatGeneralMacro({ sites, produits }: { sites: any[], produits: any[] }) {
    const [filters, setFilters] = useState({
        date_debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        date_fin: new Date().toISOString().split('T')[0],
        site_id: '',
        produit_id: '',
    });

    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/reporting/etat-general', filters);
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
        if (filters.site_id) params.append('site_id', filters.site_id);
        if (filters.produit_id) params.append('produit_id', filters.produit_id);
        return `/api/reporting/etat-general/${format}?${params.toString()}`;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PANNEAU FILTRES */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-border shadow-sm h-fit space-y-6">
                <div className="flex items-center gap-2 text-primary border-b pb-4">
                    <Filter size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm">Filtres (Macro)</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Calendar size={14}/> Période</label>
                        <input type="date" value={filters.date_debut} onChange={(e) => setFilters({...filters, date_debut: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary" />
                        <input type="date" value={filters.date_fin} onChange={(e) => setFilters({...filters, date_fin: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Building2 size={14}/> Site</label>
                        <select value={filters.site_id} onChange={(e) => setFilters({...filters, site_id: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary">
                            <option value="">Tous les sites</option>
                            {sites.map(site => <option key={site.id} value={site.id}>{site.nom_site}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Package size={14}/> Produit</label>
                        <select value={filters.produit_id} onChange={(e) => setFilters({...filters, produit_id: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary">
                            <option value="">Tous les produits</option>
                            {produits.map(prod => <option key={prod.id} value={prod.id}>{prod.nom_produit}</option>)}
                        </select>
                    </div>
                    <Button onClick={fetchReport} disabled={isLoading} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-md mt-4 transition-all">
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Générer l'état"}
                    </Button>
                    {error && <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                </div>
            </div>

            {/* ZONE RÉSULTAT */}
            <div className="lg:col-span-3">
                {isLoading && !reportData ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Extraction des données en cours...</p>
                    </div>
                ) : reportData ? (
                    <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
                        {/* EN-TÊTE AVEC BOUTONS D'EXPORT */}
                        <div className="bg-slate-800 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">État Général de la Paie</h3>
                                <p className="text-slate-300 text-xs font-medium mt-1 uppercase">Du {reportData.periode.debut} au {reportData.periode.fin}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <a href={getExportUrl('pdf')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-black transition-colors">
                                    <FileText size={16} className="text-red-400" /> PDF
                                </a>
                                <a href={getExportUrl('excel')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-black transition-colors">
                                    <FileSpreadsheet size={16} className="text-emerald-400" /> EXCEL
                                </a>
                                <Badge className="bg-white text-slate-800 font-black px-4 py-1 ml-2">MACRO</Badge>
                            </div>
                        </div>

                        {/* TABLEAU */}
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b-2 border-slate-200 text-xs font-black text-slate-500 uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 w-16 text-center">N°</th>
                                    <th className="px-6 py-4">Section de production</th>
                                    <th className="px-6 py-4 text-right">Coût du travail (Brut)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reportData.lignes.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-16 text-center text-slate-400 italic font-bold">Aucune donnée trouvée.</td></tr>
                                ) : (
                                    reportData.lignes.map((ligne: any, index: number) => (
                                        <tr key={index} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">{index + 1}</td>
                                            <td className="px-6 py-4 font-black text-slate-700 uppercase">{ligne.section}</td>
                                            <td className="px-6 py-4 text-right font-black text-slate-900">{ligne.montant_a_payer.toLocaleString()} CFA</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {reportData.lignes.length > 0 && (
                                <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                                    <tr className="bg-primary/5">
                                        <td colSpan={2} className="px-6 py-6 text-right text-sm font-black uppercase text-primary">Montant Total Net</td>
                                        <td className="px-6 py-6 text-right font-black text-2xl text-primary">{reportData.totaux.net.toLocaleString()} CFA</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Layers className="text-slate-300 mb-3" size={40} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configurez vos filtres (Macro)</p>
                    </div>
                )}
            </div>
        </div>
    );
}