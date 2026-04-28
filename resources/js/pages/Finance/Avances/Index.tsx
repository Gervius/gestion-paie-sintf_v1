import { usePage, router, Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, CheckCircle2, Trash2, Clock, Archive, Banknote } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
import { NouvelleAvanceModal } from './NouvelleAvanceModal'; // Assure-toi que le chemin est correct
import { financeAvancesDestroy, financeAvancesIndex } from '@/routes';

const STATUT_CONFIG = {
    ACTIVE: { label: 'En cours de prélèvement', classes: 'bg-orange-100 text-orange-700' },
    SOLDEE: { label: 'Soldée (Remboursée)', classes: 'bg-green-100 text-green-700' },
};

export default function Index() {
    const { avances, filters, flash, auth } = usePage<any>().props;

    // Permissions
    const userPerms = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || [];
    const isSuperAdmin = userPerms.includes('*') || userRoles.includes('Super Admin');
    const canCreate = isSuperAdmin || userPerms.includes('avances.creer');
    const canDelete = isSuperAdmin || userPerms.includes('avances.supprimer');

    const [search, setSearch] = useState(filters?.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isInitialRender = useRef(true);

    const handleDelete = useCallback((id: number) => {
        if (!confirm('Supprimer cette avance ? (Possible uniquement si aucun remboursement n\'a commencé)')) return;
        router.delete(financeAvancesDestroy.url({ avance: id }), { preserveScroll: true });
    }, []);

    // Fonction de filtrage dynamique
    const handleFilterChange = (key: string, value: string) => {
        router.get(financeAvancesIndex.url(), { ...filters, [key]: value, search }, { preserveState: true, preserveScroll: true });
    };

    
    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const delay = setTimeout(() => {
            handleFilterChange('search', search);
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Gestion des Avances" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Heading title="Avances & Prêts" description="Suivi des acomptes et retenues sur salaires" />
                {canCreate && (
                    <Button onClick={() => setIsModalOpen(true)} className="bg-secondary hover:bg-secondary/90 text-white font-bold h-11 shadow-md hover:scale-105 transition-transform">
                        <Plus size={18} className="mr-2" /> Accorder une avance
                    </Button>
                )}
            </div>

            {/* BARRE DE FILTRES INTELLIGENTE */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-3 rounded-xl border border-border shadow-sm">
                
                {/* Onglets de Statut */}
                <div className="flex bg-muted/50 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
                    <button 
                        onClick={() => handleFilterChange('status', 'ACTIVE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filters?.status === 'ACTIVE' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Clock size={16}/> En Cours (Restes à payer)
                    </button>
                    <button 
                        onClick={() => handleFilterChange('status', 'SOLDEE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filters?.status === 'SOLDEE' ? 'bg-white shadow-sm text-green-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <CheckCircle2 size={16}/> Avances Soldées
                    </button>
                    <button 
                        onClick={() => handleFilterChange('status', 'TOUS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filters?.status === 'TOUS' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Archive size={16}/> Toutes
                    </button>
                </div>

                {/* Barre de recherche */}
                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input 
                        type="text" 
                        placeholder="Rechercher par agent ou matricule..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all"
                    />
                </div>
            </div>

            {/* TABLEAU DES AVANCES */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[800px] text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px]">Date</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px]">Agent</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px]">Motif</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-right">Montant Initial</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-right">Solde Restant</th>
                            <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-center">Statut</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {/* Sécurité : on vérifie que avances et avances.data existent */}
                        {!avances?.data || avances.data.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                        <div className="bg-slate-50 p-4 rounded-full"><Banknote size={32} /></div>
                                        <p className="font-bold text-sm">
                                            {filters?.status === 'ACTIVE' 
                                                ? "Aucune avance en cours de recouvrement." 
                                                : "Aucune avance trouvée."}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            avances.data.map((avance: any) => (
                                <tr key={avance.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4 font-black text-gray-900 whitespace-nowrap">
                                        {new Date(avance.date_avance).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-black text-sm uppercase text-gray-900">{avance.personnel.nom} {avance.personnel.prenom}</div>
                                        <div className="text-[10px] font-mono text-muted-foreground">{avance.personnel.matricule}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                                        {avance.motif}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-500">
                                        {Number(avance.montant_initial).toLocaleString()} F
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-secondary text-base">
                                        {Number(avance.solde_restant).toLocaleString()} F
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge className={`${STATUT_CONFIG[avance.statut as keyof typeof STATUT_CONFIG]?.classes} border-0`}>
                                            {STATUT_CONFIG[avance.statut as keyof typeof STATUT_CONFIG]?.label}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Ne peut être supprimée que si elle n'a jamais été remboursée (montant_initial === solde_restant) */}
                                        {avance.montant_initial === avance.solde_restant && canDelete && (
                                            <button onClick={() => handleDelete(avance.id)} title="Annuler l'avance" className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {avances?.last_page > 1 && (
                <div className="mt-4">
                    <Pagination links={avances.links} />
                </div>
            )}

            {/* Modale d'ajout d'avance */}
            <NouvelleAvanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}