import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { BarChart3, Building2, TableProperties, UserSquare } from 'lucide-react';
import EtatGeneralMacro from './Partials/EtatGeneralMacro';
import EtatPersonnelMicro from './Partials/EtatPersonnelMicro';
import EtatPointagePivot from './Partials/EtatPointagePivot';

interface ReportingProps {
    sites: { id: number; nom_site: string }[];
    produits: { id: number; nom_produit: string }[];
    sections: { id: number; nom_section: string }[];
    personnels: { id: number; nom: string; prenom: string; matricule: string }[];
}

export default function Index({ sites, produits, sections, personnels }: ReportingProps) {
    const [reportType, setReportType] = useState<'general' | 'personnel' | 'pivot'>('general');

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <Head title="Reporting & B.I" />

            {/* HEADER COMMUN (Sans les boutons d'export, qui sont maintenant dans les modules) */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-3">
                        <BarChart3 className="text-orange-500" size={28} />
                        Intelligence Métier
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium">Générez et exportez les états de paie et de production.</p>
                </div>
            </div>

            {/* ONGLETS DE NAVIGATION */}
            <div className="flex gap-4">
                <button 
                    onClick={() => setReportType('general')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                        reportType === 'general' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                >
                    <Building2 size={18} /> État Général (Macro)
                </button>
                <button 
                    onClick={() => setReportType('personnel')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                        reportType === 'personnel' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                >
                    <UserSquare size={18} /> État Personnel (Micro)
                </button>
                <button 
                    onClick={() => setReportType('pivot')}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                        reportType === 'pivot' ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                    }`}
                >
                    <TableProperties size={18} /> Matrice Pivot
                </button>
            </div>

            {/* APPEL DES SOUS-MODULES */}
            {reportType === 'general' && <EtatGeneralMacro sites={sites} produits={produits} />}
            {reportType === 'personnel' && <EtatPersonnelMicro produits={produits} sections={sections} personnels={personnels} />}
            {/* 🚨 NOUVEAU MODULE 🚨 */}
            {reportType === 'pivot' && <EtatPointagePivot produits={produits} sections={sections} />}
        </div>
    );
}