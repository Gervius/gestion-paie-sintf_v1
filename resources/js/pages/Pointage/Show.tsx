import { usePage, router, Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Search, RotateCcw, X, CheckCircle2, ArrowLeft, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Assure-toi que apiPointageValiderPreparation est bien importé ou appelé via son URL
import { apiPointageAgentsAdd, apiPointageAgentsRemove, apiPointagePdf, apiPersonnelSearch, apiPointageReset, apiPointageSubmit } from '@/routes';

export default function Show() {
    const { pointage, canEdit, canSubmit, taux, flash } = usePage<any>().props;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    const [localQuantities, setLocalQuantities] = useState<Record<number, number>>(
        Object.fromEntries(pointage.lignes.map((l: any) => [l.id, Number(l.quantite) || 0]))
    );

    const handleAddAgent = (personnelId: number) => {
        router.post(apiPointageAgentsAdd.url({ pointage: pointage.id }), 
            { personnel_id: personnelId },
            { preserveScroll: true, onSuccess: () => { setSearchTerm(''); setSearchResults([]); } }
        );
    };

    const handleRemoveAgent = (ligneId: number) => {
        if (!confirm('Retirer cet agent de la liste ?')) return;
        router.delete(apiPointageAgentsRemove.url({ pointage: pointage.id, ligne: ligneId }), { preserveScroll: true });
    };

    const handleResetList = () => {
        if (!confirm('Réinitialiser la liste avec les agents par défaut de cette section ?')) return;
        router.post(apiPointageReset.url({ pointage: pointage.id }), {}, { preserveScroll: true });
    };

    // NOUVEAU : Fonction pour passer à la saisie
    const handleOuvrirSaisie = () => {
        if (!confirm('Êtes-vous sûr de vouloir figer cette liste d\'agents et ouvrir la saisie des quantités ?')) return;
        router.post(`/api/pointages/${pointage.id}/valider-preparation`, {}, { preserveScroll: true });
    };

    const handleSubmitAll = () => {
        if (!confirm('Clôturer définitivement cette feuille ? Les montants seront figés et prêts pour la paie.')) return;
        const quantities = Object.entries(localQuantities).map(([id, q]) => ({ ligne_id: parseInt(id), quantite: Number(q) }));
        router.post(apiPointageSubmit.url({ pointage: pointage.id }), { quantities });
    };

    const handleSearch = async (q: string) => {
        setSearchTerm(q);
        if (q.length < 2) return setSearchResults([]);
        const res = await fetch(`${apiPersonnelSearch.url()}?q=${encodeURIComponent(q)}`);
        setSearchResults(await res.json());
    };

    const totalBrut = Object.values(localQuantities).reduce((sum, q) => sum + ((Number(q) || 0) * taux), 0);

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title={`Pointage - ${pointage.section.nom_section}`} />

            <Link href="/pointages" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={16} /> Retour aux feuilles
            </Link>

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-sm font-bold text-secondary uppercase tracking-wider">Feuille de Pointage</h2>
                    <p className="text-2xl font-black text-primary">{pointage.site.nom_site} — {pointage.section.nom_section}</p>
                    <p className="text-sm font-medium text-muted-foreground">{new Date(pointage.date_pointage).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-right">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${pointage.statut === 'CLOTURE' ? 'bg-green-100 text-green-700' : pointage.statut === 'EDITE_TERRAIN' ? 'bg-orange-100 text-orange-700' : 'bg-primary/10 text-primary'}`}>
                        {pointage.statut === 'PREPARATION' ? '1. PRÉPARATION LISTE' : pointage.statut === 'EDITE_TERRAIN' ? '2. SAISIE EN COURS' : '3. CLÔTURÉ'}
                    </span>
                    <p className="mt-2 text-2xl font-black text-secondary">{taux.toLocaleString('fr-FR')} F / Unité</p>
                </div>
            </div>

            {/* BARRE D'OUTILS - MODE PRÉPARATION */}
            {pointage.statut === 'PREPARATION' && canEdit && (
                <div className="flex flex-wrap gap-4 items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Ajouter un agent (Nom ou Matricule)..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {searchTerm.length >= 2 && searchResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-60 overflow-auto">
                                {searchResults.map(p => (
                                    <button key={p.id} onClick={() => handleAddAgent(p.id)} className="w-full text-left px-4 py-3 hover:bg-muted text-sm border-b last:border-0 transition-colors">
                                        <span className="font-bold text-primary">{p.matricule}</span> — {p.nom} {p.prenom}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Button onClick={handleResetList} variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 transition-colors">
                        <RotateCcw size={16} className="mr-2" /> Réinitialiser
                    </Button>
                    <Button className="bg-white text-primary border border-primary hover:bg-primary/10 ml-auto transition-colors" asChild>
                        <a href={apiPointagePdf.url({ pointage: pointage.id })} target="_blank" rel="noopener noreferrer">
                            <FileText size={16} className="mr-2" /> Imprimer feuille vierge
                        </a>
                    </Button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 text-left">Agent</th>
                            <th className="px-6 py-4 text-center">Type</th>
                            <th className="px-6 py-4 text-center w-48">Quantité de travail</th>
                            <th className="px-6 py-4 text-right">Montant Brut</th>
                            {pointage.statut === 'PREPARATION' && <th className="px-6 py-4 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pointage.lignes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                    Aucun agent n'est inscrit sur cette feuille.<br/>
                                    Utilisez la barre de recherche ci-dessus pour en ajouter.
                                </td>
                            </tr>
                        ) : (
                            pointage.lignes.map((ligne: any) => (
                                <tr key={ligne.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{ligne.matricule_personnel}</div>
                                        <div className="text-xs font-medium text-muted-foreground">{ligne.personnel.nom} {ligne.personnel.prenom}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide ${ligne.type_ligne === 'RENFORT' ? 'bg-secondary/20 text-secondary' : 'bg-muted text-gray-600'}`}>
                                            {ligne.type_ligne}
                                        </span>
                                    </td>
                                    
                                    {/* COLONNE QUANTITÉ : EXPLICITE ET INTUITIVE */}
                                    <td className="px-6 py-4 text-center">
                                        {pointage.statut === 'PREPARATION' ? (
                                            <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded p-2 text-gray-400">
                                                <Lock size={14} className="mb-1" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight">En attente<br/>de validation</span>
                                            </div>
                                        ) : pointage.statut === 'EDITE_TERRAIN' && canSubmit ? (
                                            <input 
                                                type="number" min="0" step="0.5"
                                                className="w-full text-center p-2.5 border-2 border-secondary/50 rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-all font-bold text-lg bg-orange-50/30"
                                                value={localQuantities[ligne.id] ?? ''}
                                                onChange={(e) => setLocalQuantities({...localQuantities, [ligne.id]: parseFloat(e.target.value) || 0})}
                                                placeholder="0.00"
                                            />
                                        ) : (
                                            <span className="font-mono font-bold text-gray-900 text-lg">
                                                {ligne.quantite !== null && ligne.quantite !== undefined ? Number(ligne.quantite).toFixed(2) : '0.00'}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right font-black text-primary text-lg">
                                        {((localQuantities[ligne.id] || 0) * taux).toLocaleString('fr-FR')} F
                                    </td>
                                    {pointage.statut === 'PREPARATION' && (
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleRemoveAgent(ligne.id)} 
                                                className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                                            >
                                                <X size={18} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                    {pointage.lignes.length > 0 && (
                        <tfoot className="bg-primary/5 border-t border-primary/20">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs text-primary">Total Brut Estimé</td>
                                <td className="px-6 py-4 text-right font-black text-2xl text-primary">{totalBrut.toLocaleString('fr-FR')} FCFA</td>
                                {pointage.statut === 'PREPARATION' && <td></td>}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {/* NOUVEAU BOUTON : PASSER À LA SAISIE */}
            {pointage.statut === 'PREPARATION' && canEdit && pointage.lignes.length > 0 && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleOuvrirSaisie} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 px-8 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-4">
                        <Unlock className="mr-3" size={24} /> Étape suivante : Verrouiller la liste et ouvrir la saisie
                    </Button>
                </div>
            )}

            {/* BOUTON CLÔTURE */}
            {pointage.statut === 'EDITE_TERRAIN' && canSubmit && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmitAll} className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg transition-all">
                        <CheckCircle2 className="mr-3" size={24} /> Terminer : Valider les quantités et clôturer
                    </Button>
                </div>
            )}
        </div>
    );
}