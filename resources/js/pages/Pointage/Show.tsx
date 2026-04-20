import { usePage, router, Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, Search, RotateCcw, X, CheckCircle2, ArrowLeft, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { 
    apiPointageAgentsAdd, 
    apiPointageAgentsRemove, 
    apiPointagePdf, 
    apiPersonnelSearch, 
    apiPointageReset, 
    apiPointageSubmit,
    apiPointageValiderPreparation
} from '@/routes';

export default function Show() {
    const { pointage, canEdit, canSubmit, taux, flash } = usePage<any>().props;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    const [localQuantities, setLocalQuantities] = useState<Record<number, number>>(
        Object.fromEntries(pointage.lignes.map((l: any) => [l.id, Number(l.quantite) || 0]))
    );

    const [localPayments, setLocalPayments] = useState<Record<number, string>>(
        Object.fromEntries(pointage.lignes.map((l: any) => [l.id, l.moyen_paiement || l.personnel.preference_paiement || 'WAVE']))
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

    const handleOuvrirSaisie = () => {
        if (!confirm('Êtes-vous sûr de vouloir figer cette liste d\'agents et ouvrir la saisie des quantités ?')) return;
        router.post(apiPointageValiderPreparation.url({ pointage: pointage.id }), {}, { preserveScroll: true });
    };

    const handleSubmitAll = () => {
        if (!confirm('Clôturer définitivement cette feuille ? Les montants seront figés et prêts pour la paie.')) return;
        
        const quantities = Object.entries(localQuantities).map(([id, q]) => ({ 
            ligne_id: parseInt(id), 
            quantite: Number(q),
            moyen_paiement: localPayments[parseInt(id)]
        }));

        router.post(apiPointageSubmit.url({ pointage: pointage.id }), { quantities }, {
            preserveScroll: true,
            onError: (errors) => {
                console.error(errors);
                alert(errors.error || "Erreur lors de la validation. Vérifiez les quantités ou vos permissions.");
            }
        });
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

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-primary uppercase">FEUILLE DE POINTAGE PERSONNEL</h2>
                        <span className={`inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-bold ${pointage.statut === 'CLOTURE' ? 'bg-green-100 text-green-700' : pointage.statut === 'EDITE_TERRAIN' ? 'bg-orange-100 text-orange-700' : 'bg-primary/10 text-primary'}`}>
                            {pointage.statut === 'PREPARATION' ? '1. PRÉPARATION LISTE' : pointage.statut === 'EDITE_TERRAIN' ? '2. SAISIE EN COURS' : '3. CLÔTURÉ'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border border-border">
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Site</span><br/><span className="font-bold text-sm">{pointage.site.nom_site}</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Produit</span><br/><span className="font-bold text-sm">{pointage.section.produit?.nom_produit || 'N/A'}</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Section</span><br/><span className="font-bold text-sm">{pointage.section.nom_section}</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Type de pointage</span><br/><span className="font-bold text-sm">{pointage.type_pointage}</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Unité</span><br/><span className="font-bold text-sm">{pointage.section.unite_mesure?.code || '-'}</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Taux appliqué</span><br/><span className="font-bold text-sm text-secondary">{taux.toLocaleString('fr-FR')} FCFA</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">N° Fiche</span><br/><span className="font-black text-sm text-primary">#{String(pointage.id).padStart(5, '0')}</span></div>
                    <div><span className="text-[10px] font-bold text-muted-foreground uppercase">Date de travail</span><br/><span className="font-bold text-sm">{new Date(pointage.date_pointage).toLocaleDateString('fr-FR')}</span></div>
                </div>
            </div>

            {pointage.statut === 'PREPARATION' && canEdit && (
                <div className="flex flex-wrap gap-4 items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                        <input 
                            type="text" 
                            placeholder="Ajouter un agent (Nom, Matricule, CNIB)..."
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
                            <FileText size={16} className="mr-2" /> Imprimer fiche terrain
                        </a>
                    </Button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead className="bg-muted/50 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-4 text-center">N°</th>
                            <th className="px-4 py-4 text-left">Matricule</th>
                            <th className="px-4 py-4 text-left">Nom & Prénoms</th>
                            <th className="px-4 py-4 text-center">N° CNIB</th>
                            <th className="px-4 py-4 text-center">Téléphone</th>
                            <th className="px-4 py-4 text-center">Paiement</th>
                            <th className="px-4 py-4 text-center w-32">Quantité</th>
                            <th className="px-4 py-4 text-center">Unité</th>
                            <th className="px-4 py-4 text-right">Montant Brut</th>
                            {pointage.statut === 'PREPARATION' && <th className="px-4 py-4 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pointage.lignes.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                    Aucun agent n'est inscrit sur cette feuille.<br/>
                                    Utilisez la barre de recherche ci-dessus pour en ajouter.
                                </td>
                            </tr>
                        ) : (
                            pointage.lignes.map((ligne: any, index: number) => (
                                <tr key={ligne.id} className="hover:bg-accent/5 transition-colors">
                                    <td className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">{index + 1}</td>
                                    <td className="px-4 py-3 font-mono font-bold text-sm text-gray-900">{ligne.personnel.matricule}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-sm uppercase">{ligne.personnel.nom} <span className="font-normal">{ligne.personnel.prenom}</span></div>
                                        {ligne.personnel.surnom && <div className="text-[10px] text-muted-foreground italic">Alias: {ligne.personnel.surnom}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-center font-mono text-xs">{ligne.personnel.num_cnib || '-'}</td>
                                    <td className="px-4 py-3 text-center font-mono text-xs">{ligne.personnel.tel_compte_wave || ligne.personnel.telephone || '-'}</td>
                                    
                                    <td className="px-4 py-3 text-center">
                                        {pointage.statut === 'EDITE_TERRAIN' && canSubmit ? (
                                            <select
                                                className="w-full text-center p-2 border-2 border-secondary/50 rounded-lg focus:ring-2 focus:ring-secondary outline-none font-bold text-xs bg-orange-50/30 uppercase cursor-pointer"
                                                value={localPayments[ligne.id] || 'WAVE'}
                                                onChange={(e) => setLocalPayments({...localPayments, [ligne.id]: e.target.value})}
                                            >
                                                <option value="WAVE">WAVE</option>
                                                <option value="ESPECES">ESPÈCES</option>
                                            </select>
                                        ) : (
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase ${localPayments[ligne.id] === 'ESPECES' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                                {localPayments[ligne.id] || 'WAVE'}
                                            </span>
                                        )}
                                    </td>
                                    
                                    <td className="px-4 py-3 text-center">
                                        {pointage.statut === 'PREPARATION' ? (
                                            <div className="flex flex-col items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded p-2 text-gray-400">
                                                <Lock size={14} className="mb-1" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-center leading-tight">En attente<br/>de validation</span>
                                            </div>
                                        ) : pointage.statut === 'EDITE_TERRAIN' && canSubmit ? (
                                            <input 
                                                type="number" min="0" step="0.5"
                                                className="w-full text-center p-2 border-2 border-secondary/50 rounded-lg focus:ring-2 focus:ring-secondary outline-none transition-all font-bold text-sm bg-orange-50/30"
                                                value={localQuantities[ligne.id] ?? ''}
                                                onChange={(e) => setLocalQuantities({...localQuantities, [ligne.id]: parseFloat(e.target.value) || 0})}
                                                placeholder="0"
                                            />
                                        ) : (
                                            <span className="font-mono font-bold text-gray-900 text-sm">
                                                {ligne.quantite !== null && ligne.quantite !== undefined ? Number(ligne.quantite).toFixed(2) : '0.00'}
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-center text-xs font-bold text-muted-foreground">
                                        {pointage.section.unite_mesure?.code || '-'}
                                    </td>

                                    <td className="px-4 py-3 text-right font-black text-primary text-sm whitespace-nowrap">
                                        {((localQuantities[ligne.id] || 0) * taux).toLocaleString('fr-FR')} F
                                    </td>

                                    {pointage.statut === 'PREPARATION' && (
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => handleRemoveAgent(ligne.id)} 
                                                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg hover:bg-destructive/10"
                                            >
                                                <X size={16} />
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
                                <td colSpan={8} className="px-4 py-4 text-right font-bold uppercase tracking-wider text-xs text-primary">Total Brut Estimé</td>
                                <td className="px-4 py-4 text-right font-black text-xl text-primary whitespace-nowrap">{totalBrut.toLocaleString('fr-FR')} F</td>
                                {pointage.statut === 'PREPARATION' && <td></td>}
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            {pointage.statut === 'PREPARATION' && canEdit && pointage.lignes.length > 0 && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleOuvrirSaisie} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 px-8 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-4">
                        <Unlock className="mr-3" size={24} /> Étape suivante : Ouvrir la saisie
                    </Button>
                </div>
            )}

            {pointage.statut === 'EDITE_TERRAIN' && canSubmit && (
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSubmitAll} className="bg-green-600 hover:bg-green-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg transition-all">
                        <CheckCircle2 className="mr-3" size={24} /> Terminer : Valider
                    </Button>
                </div>
            )}
        </div>
    );
}