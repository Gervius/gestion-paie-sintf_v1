import { usePage, Link, router, Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Search, Plus, CheckCircle2, Eye } from 'lucide-react';
import { pointageCreate, pointageShow } from '@/routes';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PaginatedData<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

interface PointageItem {
    id: number;
    date_pointage: string;
    statut: 'PREPARATION' | 'EDITE_TERRAIN' | 'CLOTURE';
    site: { nom_site: string };
    section: { nom_section: string };
    type_pointage: 'JOURNALIER' | 'RENDEMENT';
}

const STATUT_CONFIG = {
    PREPARATION: { label: 'Préparation', classes: 'bg-primary/10 text-primary' },
    EDITE_TERRAIN: { label: 'Édition terrain', classes: 'bg-orange-100 text-orange-700' },
    CLOTURE: { label: 'Clôturé', classes: 'bg-green-100 text-green-700' },
};

export default function Index() {
    const { pointages, filters, flash } = usePage<{ 
        pointages: PaginatedData<PointageItem>;
        filters: { search?: string };
        flash: any;
    }>().props;

    const [search, setSearch] = useState(filters?.search || '');
    const isInitialRender = useRef(true);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        const delay = setTimeout(() => {
            router.get('/pointages', { search }, { preserveState: true, replace: true });
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Feuilles de Pointage" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Heading title="Feuilles de pointage" description="Historique et création des états de présence" />
                <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                    <Link href={pointageCreate.url()}>
                        <Plus size={18} className="mr-2" /> Nouvelle feuille
                    </Link>
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher par site ou section..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <table className="w-full text-sm">
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
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Aucune feuille de pointage trouvée.</td></tr>
                        ) : (
                            pointages.data.map((item) => (
                                <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">
                                        {new Date(item.date_pointage).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900">{item.site.nom_site}</td>
                                    <td className="px-4 py-4 text-gray-600">{item.section.nom_section}</td>
                                    <td className="px-4 py-4 text-xs font-bold text-secondary">
                                        {item.type_pointage === 'JOURNALIER' ? 'JOURNALIER' : 'RENDEMENT'}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge className={`${STATUT_CONFIG[item.statut]?.classes} border-0`}>
                                            {STATUT_CONFIG[item.statut]?.label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <Link href={pointageShow.url({ pointage: item.id })} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all">
                                            <Eye size={14} /> Consulter
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {pointages.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {pointages.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveState
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                                link.active ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-border hover:bg-muted'
                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}