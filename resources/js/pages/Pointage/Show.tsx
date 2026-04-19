import { useState, useEffect } from 'react';
import { usePage, Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2, CheckCircle2, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';


import { pointageIndex, apiPointageSubmit, apiPointageAgentsRemove } from '@/routes';

export default function Show() {
    const { pointage, flash } = usePage<any>().props;
    
    
    const [lignes, setLignes] = useState(pointage.pointage_lignes || []);
    const [isSaving, setIsSaving] = useState(false);

    
    const handleQuantiteChange = (index: number, value: string) => {
        const newLignes = [...lignes];
        newLignes[index].quantite = value;
        setLignes(newLignes);
    };

    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextInput = document.getElementById(`qte-${index + 1}`);
            if (nextInput) {
                nextInput.focus();
                (nextInput as HTMLInputElement).select(); // Surligne le texte
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevInput = document.getElementById(`qte-${index - 1}`);
            if (prevInput) {
                prevInput.focus();
                (prevInput as HTMLInputElement).select();
            }
        }
    };

    
    const handleSaveAll = () => {
        setIsSaving(true);
        router.post(apiPointageSubmit.url({ pointage: pointage.id }), {
            lignes: lignes.map((l: any) => ({
                id: l.id,
                quantite: l.quantite
            }))
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false)
        });
    };

    const handleRemoveLine = (ligneId: number) => {
        if (!confirm('Retirer cet agent de la feuille ?')) return;
        router.delete(apiPointageAgentsRemove.url({ pointage: pointage.id, ligne: ligneId }), { preserveScroll: true });
    };

    return (
        
        <div className="flex flex-col h-[calc(100vh-2rem)] p-6 bg-background overflow-hidden">
            <Head title={`Pointage - ${pointage.section?.nom_section}`} />

            <div className="flex-none mb-6 space-y-4">
                <Link href={pointageIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
                    <ArrowLeft size={16} /> Retour aux feuilles
                </Link>

                {flash?.success && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-sm">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <span className="font-bold text-sm">{flash.success}</span>
                    </div>
                )}

                <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-border shadow-sm">
                    <div>
                        <Heading 
                            title={`Pointage ${pointage.section?.nom_section}`} 
                            description={`${new Date(pointage.date_pointage).toLocaleDateString('fr-FR')} - Site: ${pointage.site?.nom_site}`} 
                        />
                        <Badge className="mt-2 bg-slate-100 text-slate-700 border-0">
                            TAUX : {pointage.taux_applique} F / Unité
                        </Badge>
                    </div>
                    
                    <Button 
                        onClick={handleSaveAll} 
                        disabled={isSaving || pointage.statut !== 'PREPARATION'}
                        className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 shadow-md transition-all active:scale-95"
                    >
                        <Save className="mr-2" size={20} />
                        {isSaving ? 'Enregistrement...' : 'Enregistrer les quantités'}
                    </Button>
                </div>
            </div>

            
            <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-border shadow-sm relative">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-primary uppercase">N°</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-primary uppercase">Matricule</th>
                            <th className="px-4 py-4 text-left text-[10px] font-bold text-primary uppercase">Agent</th>
                            <th className="px-4 py-4 text-center text-[10px] font-bold text-primary uppercase w-48">Quantité (Entrée ⬇️)</th>
                            <th className="px-4 py-4 text-right text-[10px] font-bold text-primary uppercase">Montant Brut</th>
                            <th className="px-4 py-4 text-center text-[10px] font-bold text-primary uppercase w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {lignes.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium">
                                    Aucun agent n'est inscrit sur cette feuille de pointage.
                                </td>
                            </tr>
                        ) : (
                            lignes.map((ligne: any, index: number) => (
                                <tr key={ligne.id} className="hover:bg-accent/5 transition-colors group">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-mono font-bold text-gray-600">{ligne.matricule_personnel}</td>
                                    <td className="px-4 py-3 font-bold text-gray-900">
                                        {ligne.personnel?.nom} {ligne.personnel?.prenom}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {/* LE CHAMP MAGIQUE */}
                                        <input
                                            id={`qte-${index}`}
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={ligne.quantite}
                                            onChange={(e) => handleQuantiteChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index)}
                                            onFocus={(e) => e.target.select()} // Surligne tout au focus
                                            className="w-full text-center p-2 border-2 border-slate-200 rounded-lg focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none font-black text-lg transition-all"
                                            disabled={pointage.statut !== 'PREPARATION'}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-black text-secondary text-base">
                                        {/* Calcul visuel en temps réel (optionnel mais génial pour le pointeur) */}
                                        {(parseFloat(ligne.quantite || '0') * parseFloat(pointage.taux_applique)).toLocaleString()} F
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => handleRemoveLine(ligne.id)}
                                            tabIndex={-1} // 🚫 EXCLU DE LA TOUCHE TABULATION
                                            className="p-2 text-gray-300 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                            disabled={pointage.statut !== 'PREPARATION'}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            
            <div className="flex-none mt-4 bg-primary/5 p-4 rounded-xl border border-primary/20 flex justify-between items-center">
                <span className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <Calculator size={16} /> Total des agents pointés : {lignes.length}
                </span>
                <span className="text-sm text-muted-foreground italic">
                    Astuce : Utilisez les touches "Entrée", "Tab" ou les Flèches "Haut/Bas" pour saisir rapidement.
                </span>
            </div>
        </div>
    );
}