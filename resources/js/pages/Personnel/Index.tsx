import { Head, Link, router, usePage } from '@inertiajs/react';
import { PlusIcon, UploadIcon, Search, CheckCircle2, Pencil, Trash2, Download } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import type { Personnel, PaginatedData } from '@/types';
import { personnelIndex, personnelCreate, personnelDestroy } from '@/routes';

export default function Index({ personnels }: { personnels: PaginatedData<Personnel> }) {
    
    const { auth, filters, flash } = usePage<any>().props;
    
    // 1. On sécurise la récupération des permissions et des rôles
    const userPerms = auth?.user?.permissions || [];
    const userRoles = auth?.user?.roles || []; // Optionnel, selon la façon dont tu partages les infos via Inertia

    // 2. On recrée la logique du Gate::before côté React
    const isSuperAdmin = userPerms.includes('*') || userRoles.includes('Super Admin');

    // 3. On applique la vérification globale + spécifique
    const canCreate = isSuperAdmin || userPerms.includes('personnels.creer');
    const canUpdate = isSuperAdmin || userPerms.includes('personnels.modifier');
    const canDelete = isSuperAdmin || userPerms.includes('personnels.supprimer');
    
    const [search, setSearch] = useState(filters?.search || '');
    const [deleting, setDeleting] = useState<number | null>(null);
    
    const isInitialRender = useRef(true);

    useEffect(() => {
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        const delay = setTimeout(() => {
            router.get(
                personnelIndex().url, 
                { search }, 
                { preserveState: true, replace: true }
            );
        }, 300);
        return () => clearTimeout(delay);
    }, [search]);


    
    // Remplace ton handleDelete actuel par celui-ci :
    const handleDelete = useCallback((id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) return;
        setDeleting(id);
        router.delete(personnelDestroy.url({ personnel: id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null)
        });
    }, []); // Le tableau de dépendances vide garantit que la fonction n'est jamais recréée

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Gestion du Personnel" />

            {/* Notification de Succès */}
            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl animate-in fade-in slide-in-from-top-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Heading 
                    title="Personnel" 
                    description={`${personnels.total} employé(s) actif(s) dans le système`} 
                />
                <div className="flex gap-3">
                    {canCreate && (
                        <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                            <Link href={personnelCreate().url}>
                                <PlusIcon className="mr-2 size-4" /> Nouvel employé
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher (Nom, Matricule...)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Matricule</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Identité</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase tracking-wider text-[10px]">Affectation</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase tracking-wider text-[10px]">Paiement</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase tracking-wider text-[10px]">Statut</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase tracking-wider text-[10px]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {personnels.data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground font-medium">
                                    Aucun employé trouvé.
                                </td>
                            </tr>
                        ) : (
                            personnels.data.map((p) => (
                                <tr key={p.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-4 font-mono text-xs font-bold text-secondary">{p.matricule}</td>
                                    <td className="px-4 py-4">
                                        <div className="font-semibold text-gray-900">{p.nom} {p.prenom}</div>
                                        <div className="text-[10px] text-muted-foreground italic">{p.surnom || 'Pas de surnom'}</div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="text-xs font-medium">{p.site_travail?.nom_site || '—'}</div>
                                        <div className="text-[10px] text-muted-foreground">{p.section_defaut?.nom_section || '—'}</div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge variant="outline" className={p.preference_paiement === 'WAVE' ? 'border-blue-400 text-blue-600' : 'border-primary text-primary'}>
                                            {p.preference_paiement}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge className={p.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                                            {p.actif ? 'Actif' : 'Inactif'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Modifier */}
                                        {canUpdate && (
                                            <Link href={`/personnel/${p.id}/edit`} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Modifier l'employé">
                                                <Pencil size={18} />
                                            </Link>
                                        )}
                                        <a
                                            href={`/personnel/${p.id}/badge`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center"
                                            title="Télécharger le badge"
                                        >
                                            <Download size={18} />
                                        </a>
                                        {canDelete && (
                                            <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50" title="Supprimer l'employé">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {personnels.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {personnels.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            preserveState
                            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-colors ${
                                link.active 
                                    ? 'bg-primary text-white border-primary shadow-md' 
                                    : 'bg-white text-gray-600 border-border hover:bg-muted'
                            } ${!link.url && 'opacity-40 cursor-not-allowed'}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}