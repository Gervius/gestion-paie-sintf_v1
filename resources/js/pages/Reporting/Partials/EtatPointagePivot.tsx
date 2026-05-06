import { useState } from 'react';
import axios from 'axios';
import { Filter, Loader2, FileText, FileSpreadsheet, Package, Calendar, Wrench, Layers, TableProperties } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EtatPointagePivot({ produits, sections }: { produits: any[], sections: any[] }) {
    const [filters, setFilters] = useState({
        date_debut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        date_fin: new Date().toISOString().split('T')[0],
        produit_id: '',
        section_id: '',
    });

    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const dateDebutObj = new Date(filters.date_debut);
    const dateFinObj = new Date(filters.date_fin);
    const diffTime = Math.abs(dateFinObj.getTime() - dateDebutObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le premier jour
    
    // Le PDF n'est cliquable que si on a moins de 7 jours et que les données sont chargées
    const canExportPdf = diffDays <= 7;

    const fetchReport = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/reporting/etat-pointage-section', filters);
            setReportData(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de la génération du tableau croisé.");
        } finally {
            setIsLoading(false);
        }
    };

    const getExportUrl = (format: 'pdf' | 'excel') => {
        const params = new URLSearchParams();
        if (filters.date_debut) params.append('date_debut', filters.date_debut);
        if (filters.date_fin) params.append('date_fin', filters.date_fin);
        if (filters.produit_id) params.append('produit_id', filters.produit_id);
        if (filters.section_id) params.append('section_id', filters.section_id);
        return `/api/reporting/etat-pointage-section/${format}?${params.toString()}`; // Routes à créer plus tard
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PANNEAU FILTRES */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-border shadow-sm h-fit space-y-6">
                <div className="flex items-center gap-2 text-primary border-b pb-4">
                    <Filter size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm">Filtres (Pivot)</h3>
                </div>
                <div className="space-y-4">
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Calendar size={14}/> Période (Max 31 jours)</label>
                        <input type="date" value={filters.date_debut} onChange={(e) => setFilters({...filters, date_debut: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary" />
                        <input type="date" value={filters.date_fin} onChange={(e) => setFilters({...filters, date_fin: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Package size={14}/> Produit</label>
                        <select value={filters.produit_id} onChange={(e) => setFilters({...filters, produit_id: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary">
                            <option value="">Tous les produits</option>
                            {produits.map(prod => <option key={prod.id} value={prod.id}>{prod.nom_produit}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2"><Wrench size={14}/> Section</label>
                        <select value={filters.section_id} onChange={(e) => setFilters({...filters, section_id: e.target.value})} className="w-full text-sm font-bold border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-primary">
                            <option value="">Toutes les sections</option>
                            {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.nom_section}</option>)}
                        </select>
                    </div>

                    <Button onClick={fetchReport} disabled={isLoading} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-md mt-4 transition-all">
                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Générer la matrice"}
                    </Button>
                    {error && <div className="text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                </div>
            </div>

            {/* ZONE RÉSULTAT */}
            <div className="lg:col-span-3">
                {isLoading && !reportData ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-dashed border-slate-300">
                        <Loader2 className="animate-spin text-primary mb-4" size={32} />
                        <p className="text-sm font-bold text-muted-foreground animate-pulse">Génération du tableau croisé...</p>
                    </div>
                ) : reportData ? (
                    <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden flex flex-col">
                        
                        {/* EN-TÊTE AVEC BOUTONS */}
                        <div className="bg-slate-800 text-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-widest">État de Pointage par Section</h3>
                                <p className="text-slate-300 text-xs font-medium mt-1 uppercase">Du {reportData.periode.debut} au {reportData.periode.fin}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {canExportPdf ? (
                                    <a href={getExportUrl('pdf')} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-black transition-colors" title="Télécharger la fiche de la semaine">
                                        <FileText size={16} className="text-red-400" /> PDF
                                    </a>
                                ) : (
                                    <button disabled title="Le PDF est limité à 7 jours max (Utilisez l'Excel pour les longues périodes)" className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg text-xs font-black text-slate-400 cursor-not-allowed">
                                        <FileText size={16} /> PDF (Max 7J)
                                    </button>
                                )}
                                <a href={getExportUrl('excel')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-black transition-colors">
                                    <FileSpreadsheet size={16} className="text-emerald-400" /> EXCEL
                                </a>
                                <Badge className="bg-white text-slate-800 font-black px-4 py-1 ml-2">PIVOT</Badge>
                            </div>
                        </div>

                        {/* TABLEAU SCROLLABLE (Défilement horizontal) */}
                        <div className="overflow-x-auto w-full pb-4">
                            <table className="w-full text-left border-collapse min-w-max">
                                <thead className="bg-slate-50 border-b-2 border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        {/* Colonnes figées à gauche */}
                                        <th className="px-3 py-3 sticky left-0 bg-slate-50 z-20 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            Matricule & Nom
                                        </th>
                                        <th className="px-3 py-3 text-center bg-emerald-50 border-r border-slate-200">
                                            Total Qté
                                        </th>
                                        <th className="px-3 py-3 text-center bg-emerald-50 border-r border-slate-200">
                                            Total Brut
                                        </th>

                                        {/* Colonnes dynamiques des Jours */}
                                        {reportData.colonnes.map((col: any) => (
                                            <th key={col.cle} className="px-2 py-3 text-center border-r border-slate-100 min-w-[40px]">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {reportData.lignes.length === 0 ? (
                                        <tr><td colSpan={reportData.colonnes.length + 3} className="px-6 py-16 text-center text-slate-400 italic font-bold">Aucun pointage trouvé pour ces filtres.</td></tr>
                                    ) : (
                                        reportData.lignes.map((ligne: any) => (
                                            <tr key={ligne.personnel_id} className="hover:bg-slate-50">
                                                {/* Colonne figée */}
                                                <td className="px-3 py-2 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                    <div className="font-black text-xs text-slate-800 whitespace-nowrap">{ligne.nom_complet}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{ligne.matricule}</div>
                                                </td>
                                                {/* Totaux */}
                                                <td className="px-3 py-2 text-center font-bold text-xs text-emerald-700 bg-emerald-50/30 border-r border-slate-200">
                                                    {ligne.total_quantite > 0 ? ligne.total_quantite : '-'}
                                                </td>
                                                <td className="px-3 py-2 text-right font-black text-xs text-emerald-800 bg-emerald-50/30 border-r border-slate-200">
                                                    {ligne.total_montant > 0 ? ligne.total_montant.toLocaleString() : '-'}
                                                </td>
                                                
                                                {/* Jours Dynamiques */}
                                                {reportData.colonnes.map((col: any) => {
                                                    const val = ligne.pointages_qte[col.cle];
                                                    return (
                                                        <td key={col.cle} className={`px-2 py-2 text-center text-[10px] border-r border-slate-100 ${val > 0 ? 'font-black text-slate-700 bg-orange-50/50' : 'text-slate-300'}`}>
                                                            {val > 0 ? val : '-'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        <TableProperties className="text-slate-300 mb-3" size={40} />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Configurer la matrice croisée</p>
                    </div>
                )}
            </div>
        </div>
    );
}