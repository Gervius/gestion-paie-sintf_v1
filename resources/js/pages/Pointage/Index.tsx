import { usePage, Link, router, Head } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, CheckCircle2, Eye, Trash2, Clock, Archive, Filter, CalendarDays } from 'lucide-react';
import { pointageCreate, pointageShow, pointageDestroy } from '@/routes';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUT_CONFIG = {
    PREPARATION: { label: 'Préparation', classes: 'bg-primary/10 text-primary' },
    EDITE_TERRAIN: { label: 'Édition terrain', classes: 'bg-orange-100 text-orange-700' },
    CLOTURE: { label: 'Clôturé', classes: 'bg-green-100 text-green-700' },
};

export default function Index() {
    const { pointages, sites, sections, filters, flash, auth } = usePage<any>().props;

    // 1. Détection robuste du Super Admin
    const userPerms = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || [];
    const isSuperAdmin = userPerms.includes('*') || userRoles.includes('Super Admin');

    // 2. Application granulaire
    const canCreate = isSuperAdmin || userPerms.includes('pointages.creer');
    const canDelete = isSuperAdmin || userPerms.includes('pointages.supprimer');

    const [search, setSearch] = useState(filters?.search || '');
    
    const isInitialRender = useRef(true);

    const handleDelete = useCallback((id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette feuille de pointage ? Cette action est irréversible.')) return;
        router.delete(pointageDestroy.url({ pointage: id }), { preserveScroll: true });
    }, []);

    // Fonction de filtrage dynamique
    const handleFilterChange = (key: string, value: string) => {
        router.get('/pointages', { ...filters, [key]: value, search }, { preserveState: true, preserveScroll: true });
    };

    // Auto-recherche (Debounce)
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
            <Head title="Suivi des Pointages" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Heading title="Suivi des Pointages" description="Gestion des feuilles de présence journalières et rendements" />
                {canCreate && (
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-11" asChild>
                        <Link href={pointageCreate.url()}>
                            <Plus size={18} className="mr-2" /> Nouvelle feuille
                        </Link>
                    </Button>
                )}
            </div>

            {/* BARRE DE FILTRES INTELLIGENTE */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-3 rounded-xl border border-border shadow-sm">
                
                {/* Onglets de Statut */}
                <div className="flex bg-muted/50 p-1 rounded-lg w-full lg:w-auto overflow-x-auto">
                    <button 
                        onClick={() => handleFilterChange('status', 'EN_COURS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filters.status === 'EN_COURS' ? 'bg-white shadow-sm text-orange-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Clock size={16}/> En Cours (Actions requises)
                    </button>
                    <button 
                        onClick={() => handleFilterChange('status', 'CLOTURE')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filters.status === 'CLOTURE' ? 'bg-white shadow-sm text-green-600' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <CheckCircle2 size={16}/> Historique Clôturé
                    </button>
                    <button 
                        onClick={() => handleFilterChange('status', 'TOUS')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${filters.status === 'TOUS' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-gray-900'}`}
                    >
                        <Archive size={16}/> Tous
                    </button>
                </div>

                {/* Filtres Détaillés (Site, Section, Date) */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[150px]">
                        <Filter size={14} className="absolute left-3 top-3 text-muted-foreground" />
                        <select 
                            value={filters.site_id} 
                            onChange={(e) => handleFilterChange('site_id', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Tous les sites</option>
                            {sites.map((s: any) => <option key={s.id} value={s.id}>{s.nom_site}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 min-w-[150px]">
                        <Filter size={14} className="absolute left-3 top-3 text-muted-foreground" />
                        <select 
                            value={filters.section_id} 
                            onChange={(e) => handleFilterChange('section_id', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Toutes les sections</option>
                            {sections.map((s: any) => <option key={s.id} value={s.id}>{s.nom_section}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 min-w-[140px]">
                        <CalendarDays size={14} className="absolute left-3 top-3 text-muted-foreground" />
                        <input 
                            type="date" 
                            value={filters.date} 
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* TABLEAU DES POINTAGES */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Date</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Site</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Section</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Type</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase tracking-wider text-[10px]">Statut</th>
                            <th className="px-4 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pointages.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                    {filters.status === 'EN_COURS' 
                                        ? "Toutes les feuilles de pointage sont à jour (Clôturées) !" 
                                        : "Aucun pointage trouvé pour ces filtres."}
                                </td>
                            </tr>
                        ) : (
                            pointages.data.map((item: any) => (
                                <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-4 font-black text-gray-900 whitespace-nowrap">
                                        {new Date(item.date_pointage).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900">{item.site.nom_site}</td>
                                    <td className="px-4 py-4 text-gray-600 font-bold">{item.section.nom_section}</td>
                                    <td className="px-4 py-4 text-[10px] font-black text-secondary uppercase">
                                        {item.type_pointage}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge className={`${STATUT_CONFIG[item.statut as keyof typeof STATUT_CONFIG]?.classes} border-0`}>
                                            {STATUT_CONFIG[item.statut as keyof typeof STATUT_CONFIG]?.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={pointageShow.url({ pointage: item.id })} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all">
                                                <Eye size={14} /> Consulter
                                            </Link>
                                            
                                            {/* NOUVELLE CONDITION INFAILLIBLE : 
                                                nb_lignes_soldees doit être strictement égal à 0
                                            */}
                                            {(item.nb_lignes_soldees === 0) && ((canDelete && item.statut === 'PREPARATION') || isSuperAdmin) ? (
                                                <button 
                                                    onClick={() => handleDelete(item.id)} 
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                                                    title={isSuperAdmin && item.statut !== 'PREPARATION' ? "Forçage Super Admin (Aucun ticket n'est encore soldé)" : "Supprimer"}
                                                >
                                                    <Trash2 size={14} /> Supprimer
                                                </button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {pointages.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {pointages.links.map((link: any, i: number) => (
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