import { usePage, router, Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ArrowLeft, CheckCircle2, Wallet, Banknote, Edit3, Save, X, 
    FileSpreadsheet, Trash2, Printer, AlertCircle, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// IMPORT STRICT DE TES ROUTES ZIGGY
import { 
    financeEtatsIndex, financeEtatsValider, financeEtatsDestroy, 
    financeEtatsPayerMassEspeces, financeTicketsUpdateRetenue, 
    financeEtatsBordereauCaisse, financeWaveGenerer, 
    financeWaveTelecharger, financeWaveValider 
} from '@/routes';

export default function Show() {
    const { etat, can } = usePage<any>().props;

    const [editingTicket, setEditingTicket] = useState<number | null>(null);
    const [retenueValue, setRetenueValue] = useState<number>(0);

    // --- ANALYSE DES ÉTATS ---
    const isProvisoire = etat.statut === 'PROVISOIRE';
    const isValide = etat.statut === 'VALIDE'; // Prêt pour le décaissement
    
    // Détection du lot Wave (si un ticket a un lot_wave_id, le lot est généré)
    const ticketWaveAvecLot = etat.tickets.find((t: any) => t.lot_wave_id !== null && t.mode_paiement === 'WAVE');
    const hasWaveLot = !!ticketWaveAvecLot;
    const lotWaveId = ticketWaveAvecLot?.lot_wave_id;

    // --- CALCULS POUR LE CAISSIER ---
    const totalNetWave = etat.tickets.filter((t: any) => t.mode_paiement === 'WAVE').reduce((sum: number, t: any) => sum + Number(t.montant_net), 0);
    const totalNetEspeces = etat.tickets.filter((t: any) => t.mode_paiement === 'ESPECES').reduce((sum: number, t: any) => sum + Number(t.montant_net), 0);
    const hasTicketsEspeces = etat.tickets.some((t: any) => t.mode_paiement === 'ESPECES' && t.statut === 'NON_SOLDE');
    const hasTicketsWave = etat.tickets.some((t: any) => t.mode_paiement === 'WAVE' && t.statut === 'NON_SOLDE');

    // --- ACTIONS BACKEND ---
    const handleValiderEtat = () => {
        if (!confirm('Verrouiller la campagne ? Les retenues ne pourront plus être modifiées.')) return;
        router.post(financeEtatsValider.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handleDeleteEtat = () => {
        if (!confirm('Annuler cette campagne ? Les pointages retourneront en attente.')) return;
        router.delete(financeEtatsDestroy.url({ etat: etat.id }));
    };

    // 💡 Correction appliquée : Utilisation stricte de la route générée
    const handleSaveRetenue = (ticketId: number) => {
        router.post(financeTicketsUpdateRetenue.url({ ticket: ticketId }), { montant_retenue: retenueValue }, {
            preserveScroll: true,
            onSuccess: () => setEditingTicket(null),
        });
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <Head title={`Paiement - ${etat.reference_etat}`} />

            {/* EN-TÊTE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link href={financeEtatsIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-secondary mb-2">
                        <ArrowLeft size={16} /> Retour aux campagnes
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">{etat.reference_etat}</h1>
                        <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border-0 ${isValide ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {etat.statut}
                        </Badge>
                    </div>
                </div>

                {/* CONTRÔLES ÉTAPE 1 : VALIDATION */}
                {isProvisoire && (
                    <div className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border">
                        <Button onClick={handleDeleteEtat} variant="ghost" className="text-red-500 hover:bg-red-50 font-black">
                            <Trash2 className="mr-2" size={18}/> Annuler
                        </Button>
                        <Button onClick={handleValiderEtat} className="bg-secondary hover:bg-secondary/90 text-white font-black px-6 shadow-md">
                            <CheckCircle2 className="mr-2" size={18}/> Verrouiller & Passer au Paiement
                        </Button>
                    </div>
                )}
            </div>

            {/* CONTRÔLES ÉTAPE 2 : LE TERMINAL DE DÉCAISSEMENT (Visible uniquement si validé) */}
            {isValide && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                    
                    {/* PANNEAU ESPÈCES */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-blue-800 uppercase flex items-center gap-2"><Banknote size={20}/> Caisse Espèces</h3>
                            <span className="text-2xl font-black text-blue-600">{Number(totalNetEspeces).toLocaleString()} F</span>
                        </div>
                        
                        {hasTicketsEspeces ? (
                            <div className="space-y-3">
                                <Button asChild variant="outline" className="w-full h-12 border-2 border-blue-200 text-blue-700 font-bold hover:bg-blue-50">
                                    <a href={financeEtatsBordereauCaisse.url({ etat: etat.id })} target="_blank">
                                        <Printer className="mr-2" size={18}/> 1. Imprimer Bordereau de Caisse
                                    </a>
                                </Button>
                                {/* Remplace la route si ta méthode est différente, j'utilise la route globale du contrôleur */}
                                <Button 
                                    onClick={() => { 
                                        if(confirm('Solder tous les paiements espèces ?')) 
                                            router.post(financeEtatsPayerMassEspeces.url({ etat: etat.id }), {}, { preserveScroll: true }) 
                                    }}
                                >
                                    <CheckCircle2 className="mr-2" size={18}/> 2. Confirmer Décaissement Espèces
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">
                                <CheckCircle2 size={18} className="text-green-500" /> Tous les paiements espèces sont soldés
                            </div>
                        )}
                    </div>

                    {/* PANNEAU WAVE */}
                    <div className="bg-white p-6 rounded-2xl border-2 border-indigo-100 shadow-md">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-indigo-800 uppercase flex items-center gap-2"><Wallet size={20}/> Portail Wave</h3>
                            <span className="text-2xl font-black text-indigo-600">{Number(totalNetWave).toLocaleString()} F</span>
                        </div>

                        {hasTicketsWave ? (
                            <div className="space-y-3">
                                {!hasWaveLot ? (
                                    <Button 
                                        onClick={() => router.post(financeWaveGenerer.url({ etat: etat.id }), {}, { preserveScroll: true })} 
                                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md"
                                    >
                                        <Send className="mr-2" size={18}/> 1. Préparer le lot Wave
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" className="w-full h-12 border-2 border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50">
                                            <a href={financeWaveTelecharger.url({ lot: lotWaveId })} target="_blank">
                                                <FileSpreadsheet className="mr-2" size={18}/> 2. Télécharger Excel (Pour Wave)
                                            </a>
                                        </Button>
                                        <Button 
                                            onClick={() => { if(confirm('Avez-vous effectué le transfert sur le portail Wave ? Cette action soldera les tickets.')) router.post(financeWaveValider.url({ lot: lotWaveId }), {}, { preserveScroll: true }) }} 
                                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-black shadow-md"
                                        >
                                            <CheckCircle2 className="mr-2" size={18}/> 3. Confirmer Transfert Wave
                                        </Button>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 h-12 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">
                                <CheckCircle2 size={18} className="text-green-500" /> Tous les transferts Wave sont soldés
                            </div>
                        )}
                    </div>

                </div>
            )}

            {/* LA LISTE DE PAIE */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Agent & Mode</th>
                            <th className="px-6 py-4 text-center">Volume</th>
                            <th className="px-6 py-4 text-right">Salaire Brut</th>
                            <th className="px-6 py-4 text-right">Retenue Avance</th>
                            <th className="px-6 py-4 text-right text-secondary">Net à Payer</th>
                            <th className="px-6 py-4 text-center">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {etat.tickets.map((ticket: any) => {
                            // On récupère la dette totale calculée par le backend
                            const detteTotaleAgent = Number(ticket.personnel?.total_avances_actives || 0);

                            return (
                                <tr key={ticket.id} className="hover:bg-slate-50/80 group">
                                    <td className="px-6 py-4">
                                        <div className="font-black text-sm uppercase text-slate-800">
                                            {ticket.personnel?.nom} {ticket.personnel?.prenom}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                {ticket.personnel?.matricule}
                                            </span>
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                                ticket.mode_paiement === 'ESPECES' ? 'text-blue-600 bg-blue-50' : 'text-indigo-600 bg-indigo-50'
                                            }`}>
                                                {ticket.mode_paiement}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-center font-bold text-slate-600">
                                        {Number(ticket.quantite_totale).toFixed(2)}
                                    </td>

                                    <td className="px-6 py-4 text-right font-bold text-slate-400">
                                        {Number(ticket.montant_brut_cumule).toLocaleString()} F
                                    </td>
                                    
                                    {/* COLONNE RETENUE AVEC INDICATEUR DE DETTE */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            {editingTicket === ticket.id ? (
                                                <div className="flex items-center justify-end gap-2 animate-in zoom-in-95">
                                                    <input 
                                                        type="number" 
                                                        min="0"
                                                        max={detteTotaleAgent}
                                                        value={retenueValue} 
                                                        onChange={e => setRetenueValue(Number(e.target.value))} 
                                                        className="w-24 p-1.5 border-2 border-secondary rounded-lg text-right font-black outline-none focus:ring-2 focus:ring-secondary/20" 
                                                        autoFocus 
                                                    />
                                                    <button onClick={() => handleSaveRetenue(ticket.id)} className="text-green-600 p-1 hover:bg-green-50 rounded"><Save size={18}/></button>
                                                    <button onClick={() => setEditingTicket(null)} className="text-red-500 p-1 hover:bg-red-50 rounded"><X size={18}/></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-end gap-2 font-bold text-red-500">
                                                        - {Number(ticket.montant_deduit_manuel).toLocaleString()} F
                                                        {isProvisoire && (
                                                            <button 
                                                                onClick={() => { 
                                                                    setEditingTicket(ticket.id); 
                                                                    setRetenueValue(ticket.montant_deduit_manuel); 
                                                                }} 
                                                                className="text-slate-300 hover:text-secondary opacity-0 group-hover:opacity-100 transition-all"
                                                            >
                                                                <Edit3 size={16}/>
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Affichage de la dette totale pour guider le comptable */}
                                                    {detteTotaleAgent > 0 && (
                                                        <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 uppercase">
                                                            Dette : {detteTotaleAgent.toLocaleString()} F
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right font-black text-secondary text-lg">
                                        {Number(ticket.montant_net).toLocaleString()} F
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <Badge className={`border-0 ${ticket.statut === 'SOLDE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {ticket.statut}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}