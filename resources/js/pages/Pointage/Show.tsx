import { usePage, router, Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    FileText, RotateCcw, X, CheckCircle2, 
    ArrowLeft, Lock, Unlock, AlertCircle, PlusCircle,
    Users, Banknote, Wallet, FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Routes Wayfinder
import { 
    apiPointageAgentsRemove, 
    apiPointagePdf, 
    apiPointageReset, 
    apiPointageSubmit,
    apiPointageValiderPreparation
} from '@/routes';

// Modales
import { ModalAjoutAgent } from '@/components/ModalAjoutAgent';
import { ModalRegulPositive } from '@/components/ModalRegulPositive';
import { ModalRegulNegative } from '@/components/ModalRegulNegative';

export default function Show() {
    const { pointage, canEdit, canSubmit, taux, flash, auth } = usePage<any>().props;
    
    // --- LOGIQUE DE DROITS & STATUTS ---
    const canCreateRegul = auth.user?.permissions?.includes('creer_regularisation') || auth.user?.permissions?.includes('*');
    
    // On considère la fiche "Soldée" si au moins une ligne est liée à un ticket de paie
    const isSolder = pointage.lignes.some((l: any) => l.ticket_paiement_id !== null);

    const isPreparation = pointage.statut === 'PREPARATION';
    const isEdite = pointage.statut === 'EDITE_TERRAIN';
    const isCloture = pointage.statut === 'CLOTURE';

    // --- ÉTATS DES MODALES ---
    const [isAjoutAgentOpen, setIsAjoutAgentOpen] = useState(false);
    const [isRegulPositiveOpen, setIsRegulPositiveOpen] = useState(false);
    const [isRegulNegativeOpen, setIsRegulNegativeOpen] = useState(false);
    const [selectedLigneForRegul, setSelectedLigneForRegul] = useState<any>(null);
    
    const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
    const [localPayments, setLocalPayments] = useState<Record<number, string>>({});

    // --- LOGIQUE DE SAISIE ---
    const getPaymentValue = (ligne: any) => {
        if (localPayments[ligne.id] !== undefined) return localPayments[ligne.id];
        return ligne.moyen_paiement || ligne.personnel.preference_paiement || 'WAVE';
    };

    const getQuantityValue = (ligne: any) => {
        if (localQuantities[ligne.id] !== undefined) return localQuantities[ligne.id];
        return Number(ligne.quantite) || 0;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(`quantite-${index + 1}`);
            if (nextInput) (nextInput as HTMLInputElement).focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevInput = document.getElementById(`quantite-${index - 1}`);
            if (prevInput) (prevInput as HTMLInputElement).focus();
        }
    };

    // --- ACTIONS ---
    const handleRemoveAgent = (ligneId: number) => {
        if (!confirm('Retirer cet agent ?')) return;
        router.delete(apiPointageAgentsRemove.url({ pointage: pointage.id, ligne: ligneId }), { preserveScroll: true });
    };

    const handleResetList = () => {
        if (!confirm('Restaurer la liste par défaut ?')) return;
        router.post(apiPointageReset.url({ pointage: pointage.id }), {}, { preserveScroll: true });
    };

    const handleOuvrirSaisie = () => {
        if (!confirm('Ouvrir la saisie terrain ?')) return;
        router.post(apiPointageValiderPreparation.url({ pointage: pointage.id }), {}, { preserveScroll: true });
    };

    const handleSubmitAll = () => {
        if (!confirm('Clôturer définitivement ?')) return;
        const quantities = pointage.lignes.map((ligne: any) => ({ 
            ligne_id: ligne.id, 
            quantite: getQuantityValue(ligne),
            moyen_paiement: getPaymentValue(ligne)
        }));
        router.post(apiPointageSubmit.url({ pointage: pointage.id }), { quantities }, {
            preserveScroll: true,
            onError: (errors) => alert(Object.values(errors).join('\n'))
        });
    };

    const handleAnnulerCloture = () => {
        if (!confirm("Réouvrir cette feuille pour correction ?")) return;
        router.post(`/api/pointages/${pointage.id}/annuler-cloture`, {}, { preserveScroll: true });
    };

    const totalBrut = pointage.lignes.reduce((sum: number, ligne: any) => sum + (getQuantityValue(ligne) * taux), 0);

    return (
        <div className="p-6 space-y-6 bg-background min-h-screen">
            <Head title={`Pointage - ${pointage.section.nom_section}`} />

            <Link href="/pointages" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:opacity-80">
                <ArrowLeft size={16} /> Retour
            </Link>

            {/* NOTIFICATIONS */}
            {(flash?.success || flash?.error) && (
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${flash?.success ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {flash?.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-bold text-sm">{flash?.success || flash?.error}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">{pointage.section.nom_section}</h2>
                        <Badge className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-0 ${isCloture ? 'bg-green-100 text-green-700' : isEdite ? 'bg-orange-100 text-orange-700' : 'bg-primary/10 text-primary'}`}>
                            {pointage.statut.replace('_', ' ')}
                            {isCloture && isSolder && " (SOLDÉ)"}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium uppercase font-black">
                        {pointage.site.nom_site} — {new Date(pointage.date_pointage).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                    <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
                        <span className="text-[10px] font-black text-muted-foreground uppercase block">Taux</span>
                        <span className="text-lg font-black text-secondary">{taux.toLocaleString()} F</span>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-xl border border-primary/10 text-center">
                        <span className="text-[10px] font-black text-primary uppercase block">Mode</span>
                        <span className="text-lg font-black text-primary uppercase">{pointage.type_pointage}</span>
                    </div>
                </div>
            </div>

            {/* ÉTAPE 1 : PRÉPARATION */}
            {isPreparation && canEdit && (
                <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-primary">
                        <Users size={24} />
                        <div>
                            <h4 className="font-black text-sm text-gray-900">Appel des agents</h4>
                            <p className="text-xs text-muted-foreground italic">Gérez la liste avant la saisie terrain.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button onClick={() => setIsAjoutAgentOpen(true)} className="flex-1 sm:flex-none font-black h-12 px-8 rounded-xl shadow-md"><PlusCircle size={20} className="mr-2" /> Ajouter</Button>
                        <Button onClick={handleResetList} variant="outline" className="flex-1 sm:flex-none border-destructive/30 text-destructive h-12 px-6 rounded-xl"><RotateCcw size={18} className="mr-2" /> Reset</Button>
                    </div>
                </div>
            )}

            {/* TABLEAU CENTRAL */}
            <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-black text-primary uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-4 text-center w-16">N°</th>
                            <th className="px-4 py-4">Agent</th>
                            <th className="px-4 py-4 text-center">Paiement</th>
                            <th className="px-4 py-4 text-center w-44">Quantité</th>
                            <th className="px-6 py-4 text-right">Total Brut</th>
                            {(isPreparation || (isCloture && isSolder && canCreateRegul)) && <th className="px-4 py-4 w-20 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {pointage.lignes.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-20 text-center text-muted-foreground italic font-bold">Aucun agent.</td></tr>
                        ) : (
                            pointage.lignes.map((ligne: any, index: number) => (
                                <tr key={ligne.id} className={`${ligne.type_ligne === 'REGULARISATION' ? 'bg-emerald-50/40' : 'hover:bg-accent/5'}`}>
                                    <td className="px-6 py-4 text-center text-xs font-black text-muted-foreground/60">{index + 1}</td>
                                    <td className="px-4 py-4">
                                        <div className="font-black text-sm uppercase text-gray-900">{ligne.personnel.nom} {ligne.personnel.prenom}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{ligne.personnel.matricule}</span>
                                            {ligne.type_ligne === 'REGULARISATION' && <Badge className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0 border-0">RÉGUL</Badge>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        {isEdite && canSubmit ? (
                                            <select value={getPaymentValue(ligne)} onChange={(e) => setLocalPayments({...localPayments, [ligne.id]: e.target.value})} className="text-[10px] font-black uppercase bg-orange-50 border-2 border-orange-200 text-orange-800 px-3 py-1.5 rounded-lg outline-none cursor-pointer">
                                                <option value="WAVE">WAVE</option>
                                                <option value="ESPECES">ESPÈCES</option>
                                            </select>
                                        ) : (
                                            <div className="flex justify-center">
                                                <span className={`flex items-center gap-1.5 text-[9px] font-black px-2.5 py-1 rounded-md border uppercase ${getPaymentValue(ligne) === 'ESPECES' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                                    {getPaymentValue(ligne) === 'ESPECES' ? <Banknote size={12}/> : <Wallet size={12}/>} {getPaymentValue(ligne)}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {isPreparation ? (
                                            <div className="flex items-center justify-center bg-gray-50 py-2 rounded-lg border border-dashed border-gray-200"><Lock size={14} className="text-muted-foreground/30" /></div>
                                        ) : isEdite && canSubmit ? (
                                            <input id={`quantite-${index}`} type="number" min="0" step="0.5" value={getQuantityValue(ligne) || ''} onChange={(e) => setLocalQuantities({...localQuantities, [ligne.id]: parseFloat(e.target.value) || 0})} onKeyDown={(e) => handleKeyDown(e, index)} className="w-full text-center py-2 border-2 border-orange-200 rounded-xl font-black text-sm bg-orange-50/30 outline-none focus:bg-white focus:border-orange-500 transition-all" />
                                        ) : (
                                            <div className="text-center font-black text-primary bg-primary/5 py-2 rounded-lg text-base">{Number(getQuantityValue(ligne)).toFixed(2)}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-gray-900 text-sm whitespace-nowrap">{(getQuantityValue(ligne) * taux).toLocaleString()} F</td>
                                    <td className="px-4 py-4 text-center">
                                        {isPreparation ? (
                                            <button onClick={() => handleRemoveAgent(ligne.id)} className="text-muted-foreground hover:text-destructive p-2 rounded-xl"><X size={18} /></button>
                                        ) : (isCloture && isSolder && canCreateRegul) ? (
                                            <button onClick={() => { setSelectedLigneForRegul(ligne); setIsRegulNegativeOpen(true); }} title="Signaler un trop-perçu" className="text-orange-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all"><AlertCircle size={18} /></button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    <tfoot className="bg-primary/5 border-t-2 border-primary/20 font-black text-primary">
                        <tr>
                            <td colSpan={4} className="px-6 py-5 text-right text-xs uppercase">Total Brut (Section)</td>
                            <td className="px-6 py-5 text-right text-2xl whitespace-nowrap">{totalBrut.toLocaleString()} F</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* ACTIONS FINALES */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t-2 border-muted">
                <div className="flex items-center gap-3">
                    {/* RÉGULARISATION POSITIVE : Seulement si la fiche est clôturée ET déjà soldée */}
                    {isCloture && isSolder && canCreateRegul && (
                        <Button onClick={() => setIsRegulPositiveOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-6 rounded-xl shadow-lg transition-transform active:scale-95"><PlusCircle size={20} className="mr-2" /> Signaler un oubli</Button>
                    )}
                    
                    {/* RÉOUVERTURE : Seulement si la fiche est clôturée MAIS non encore soldée */}
                    {isCloture && !isSolder && canEdit && (
                        <Button onClick={handleAnnulerCloture} variant="outline" className="border-orange-200 text-orange-700 hover:bg-orange-50 font-black h-12 px-6 rounded-xl"><RotateCcw size={20} className="mr-2" /> Réouvrir pour correction</Button>
                    )}
                </div>
                
                <div className="flex flex-wrap gap-4 items-center ml-auto">
                    <div className="flex gap-2">
                        <Button variant="outline" asChild className="h-12 px-6 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest hover:bg-muted">
                            <a href={apiPointagePdf.url({ pointage: pointage.id })} target="_blank" rel="noopener noreferrer"><FileText size={20} className="mr-2 text-primary" /> Fiche PDF</a>
                        </Button>
                        {isCloture && (
                             <Button variant="outline" asChild className="h-12 px-6 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                <a href={`/api/pointages/${pointage.id}/excel`} target="_blank"><FileSpreadsheet size={20} className="mr-2" /> Export Excel</a>
                            </Button>
                        )}
                    </div>

                    {isPreparation && canEdit && pointage.lignes.length > 0 && (
                        <Button onClick={handleOuvrirSaisie} className="bg-orange-500 hover:bg-orange-600 text-white font-black h-12 px-10 rounded-xl shadow-xl transition-transform active:scale-95"><Unlock size={20} className="mr-2" /> Ouvrir la saisie terrain</Button>
                    )}

                    {isEdite && canSubmit && (
                        <Button onClick={handleSubmitAll} className="bg-green-600 hover:bg-green-700 text-white font-black h-12 px-10 rounded-xl shadow-xl transition-all active:scale-95 animate-pulse hover:animate-none"><CheckCircle2 size={20} className="mr-2" /> Valider & Clôturer</Button>
                    )}
                </div>
            </div>

            {/* MODALES */}
            <ModalAjoutAgent isOpen={isAjoutAgentOpen} onClose={() => setIsAjoutAgentOpen(false)} pointageId={pointage.id} lignesExistantes={pointage.lignes} />
            <ModalRegulPositive isOpen={isRegulPositiveOpen} onClose={() => setIsRegulPositiveOpen(false)} pointage={pointage} />
            <ModalRegulNegative isOpen={isRegulNegativeOpen} onClose={() => { setIsRegulNegativeOpen(false); setSelectedLigneForRegul(null); }} ligne={selectedLigneForRegul} />
        </div>
    );
}