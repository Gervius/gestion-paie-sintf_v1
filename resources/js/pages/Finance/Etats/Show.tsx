import { usePage, router, Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ArrowLeft, CheckCircle2, Wallet, Banknote, Edit3, Save, X, 
    FileSpreadsheet, Printer, Users, TrendingDown, Search, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { 
    financeEtatsIndex, financeEtatsValider, financeEtatsDestroy, 
    financeEtatsPayerMassEspeces, financeTicketsUpdateRetenue, 
    financeEtatsBordereauCaisse, financeWaveGenerer, 
    financeWaveTelecharger, financeWaveValider 
} from '@/routes';

export default function Show() {
    const { auth, etat } = usePage<any>().props;
    
    const userPerms = auth?.user?.permissions || [];
    const isSuperAdmin = userPerms.includes('*') || auth?.user?.roles?.includes('Super Admin');

    const canValider = isSuperAdmin || userPerms.includes('etats.valider');
    const canPayerEspeces = isSuperAdmin || userPerms.includes('tickets.payer');
    const canWaveGenerer = isSuperAdmin || userPerms.includes('tickets.wave.generer');
    const canWaveValider = isSuperAdmin || userPerms.includes('tickets.wave.valider');
    const canModifierRetenue = isSuperAdmin || userPerms.includes('avances.modifier') || userPerms.includes('tickets.payer');
    const canSupprimerEtat = isSuperAdmin || userPerms.includes('etats.supprimer');

    const [editingTicket, setEditingTicket] = useState<number | null>(null);
    const [retenueValue, setRetenueValue] = useState<number>(0);
    const [localSearch, setLocalSearch] = useState('');

    const isProvisoire = etat.statut === 'PROVISOIRE';
    const isValide = etat.statut === 'VALIDE'; 
    
    const ticketWaveAvecLot = etat.tickets.find((t: any) => t.lot_wave_id !== null && t.mode_paiement === 'WAVE');
    const hasWaveLot = !!ticketWaveAvecLot;
    const lotWaveId = ticketWaveAvecLot?.lot_wave_id;

    const totalAgents = etat.tickets.length;
    const totalBrut = etat.tickets.reduce((sum: number, t: any) => sum + Number(t.montant_brut_cumule), 0);
    const totalRetenues = etat.tickets.reduce((sum: number, t: any) => sum + Number(t.montant_deduit_manuel), 0);
    const totalNet = etat.tickets.reduce((sum: number, t: any) => sum + Number(t.montant_net), 0);
    
    const totalNetWave = etat.tickets.filter((t: any) => t.mode_paiement === 'WAVE').reduce((sum: number, t: any) => sum + Number(t.montant_net), 0);
    const totalNetEspeces = etat.tickets.filter((t: any) => t.mode_paiement === 'ESPECES').reduce((sum: number, t: any) => sum + Number(t.montant_net), 0);
    const hasTicketsEspeces = etat.tickets.some((t: any) => t.mode_paiement === 'ESPECES' && t.statut === 'NON_SOLDE');
    const hasTicketsWave = etat.tickets.some((t: any) => t.mode_paiement === 'WAVE' && t.statut === 'NON_SOLDE');

    const filteredTickets = etat.tickets.filter((t: any) => {
        const query = localSearch.toLowerCase();
        return t.personnel?.nom.toLowerCase().includes(query) || 
               t.personnel?.prenom.toLowerCase().includes(query) || 
               t.personnel?.matricule.toLowerCase().includes(query);
    });

    const handleValiderEtat = () => {
        if (!confirm('Verrouiller la campagne ? Les retenues ne pourront plus être modifiées.')) return;
        router.post(financeEtatsValider.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handleDeleteEtat = () => {
        if (!confirm('Annuler cette campagne ? Les pointages retourneront en attente.')) return;
        router.delete(financeEtatsDestroy.url({ etat: etat.id }));
    };

    const handleSaveRetenue = (ticketId: number) => {
        router.post(financeTicketsUpdateRetenue.url({ ticket: ticketId }), { montant_retenue: retenueValue }, {
            preserveScroll: true,
            onSuccess: () => setEditingTicket(null),
        });
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title={`Paiement - ${etat.reference_etat}`} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Link href={financeEtatsIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-gray-900 mb-2 transition-colors">
                        <ArrowLeft size={16} /> Retour aux campagnes
                    </Link>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">{etat.reference_etat}</h1>
                        <Badge className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border-0 shadow-sm ${isValide ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {etat.statut}
                        </Badge>
                    </div>
                </div>

                {isProvisoire && (
                    <div className="flex gap-3 bg-white p-2 rounded-xl shadow-sm border border-border">
                        {canSupprimerEtat && (
                            <Button onClick={handleDeleteEtat} variant="ghost" className="text-red-600 hover:bg-red-50 font-bold">Annuler</Button>
                        )}
                        {canValider && (
                            <Button onClick={handleValiderEtat} className="bg-secondary hover:bg-secondary/90 text-white font-bold h-10 px-6 shadow-sm">
                                <CheckCircle2 className="mr-2" size={16}/> Verrouiller pour Paiement
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* DASHBOARD KPIs (Style sobre) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1"><Users size={12}/> Effectif</span>
                    <span className="text-2xl font-black text-gray-900">{totalAgents} agents</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase">Masse Brute</span>
                    <span className="text-2xl font-black text-gray-900">{totalBrut.toLocaleString()} F</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-orange-600 uppercase flex items-center gap-1"><TrendingDown size={12}/> Retenues</span>
                    <span className="text-2xl font-black text-orange-600">- {totalRetenues.toLocaleString()} F</span>
                </div>
                <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-secondary uppercase">Net à Décaisser</span>
                    <span className="text-2xl font-black text-secondary">{totalNet.toLocaleString()} F</span>
                </div>
            </div>

            {/* LE TERMINAL DE DÉCAISSEMENT (Style industriel unifié) */}
            {isValide && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4">
                    {/* PANNEAU ESPÈCES */}
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-gray-900 uppercase flex items-center gap-2"><Banknote size={20} className="text-blue-500"/> Caisse Espèces</h3>
                            <span className="text-xl font-black text-gray-900">{Number(totalNetEspeces).toLocaleString()} F</span>
                        </div>
                        
                        {hasTicketsEspeces ? (
                            <div className="space-y-3">
                                <Button asChild variant="outline" className="w-full h-11 font-bold">
                                    <a href={financeEtatsBordereauCaisse.url({ etat: etat.id })} target="_blank">
                                        <Printer className="mr-2" size={16}/> 1. Imprimer Bordereau
                                    </a>
                                </Button>
                                {canPayerEspeces && (
                                    <Button 
                                        onClick={() => { if(confirm('Solder tous les paiements espèces ?')) router.post(financeEtatsPayerMassEspeces.url({ etat: etat.id }), {}, { preserveScroll: true }) }}
                                        className="w-full h-11 bg-secondary hover:bg-secondary/90 text-white font-bold"
                                    >
                                        <CheckCircle2 className="mr-2" size={16}/> 2. Confirmer Décaissement
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 h-11 bg-gray-50 text-muted-foreground rounded-lg font-bold text-sm border border-border">
                                <CheckCircle2 size={16} className="text-green-500" /> Caisse espèces soldée
                            </div>
                        )}
                    </div>

                    {/* PANNEAU WAVE */}
                    <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-gray-900 uppercase flex items-center gap-2"><Wallet size={20} className="text-indigo-500"/> Portail Wave</h3>
                            <span className="text-xl font-black text-gray-900">{Number(totalNetWave).toLocaleString()} F</span>
                        </div>

                        {hasTicketsWave ? (
                            <div className="space-y-3">
                                {!hasWaveLot ? (
                                    canWaveGenerer && (
                                        <Button onClick={() => router.post(financeWaveGenerer.url({ etat: etat.id }), {}, { preserveScroll: true })} className="w-full h-11 bg-secondary hover:bg-secondary/90 text-white font-bold">
                                            <Send className="mr-2" size={16}/> 1. Préparer Lot Wave
                                        </Button>
                                    )
                                ) : (
                                    <>
                                        <Button asChild variant="outline" className="w-full h-11 font-bold">
                                            <a href={financeWaveTelecharger.url({ lot: lotWaveId })} target="_blank">
                                                <FileSpreadsheet className="mr-2" size={16}/> 2. Télécharger Excel Wave
                                            </a>
                                        </Button>
                                        {canWaveValider && (
                                            <Button onClick={() => { if(confirm('Confirmer le transfert Wave ?')) router.post(financeWaveValider.url({ lot: lotWaveId }), {}, { preserveScroll: true }) }} className="w-full h-11 bg-secondary hover:bg-secondary/90 text-white font-bold">
                                                <CheckCircle2 className="mr-2" size={16}/> 3. Confirmer Transfert
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 h-11 bg-gray-50 text-muted-foreground rounded-lg font-bold text-sm border border-border">
                                <CheckCircle2 size={16} className="text-green-500" /> Transferts Wave soldés
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* LA LISTE DE PAIE */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm flex flex-col">
                <div className="p-3 border-b bg-white flex justify-between items-center">
                    <h3 className="font-black text-gray-900 text-sm uppercase">Détail des agents</h3>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                            type="text" 
                            placeholder="Rechercher un agent..." 
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm font-bold bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-secondary transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px] text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px]">Agent & Mode</th>
                                <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-center">Volume</th>
                                <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-right">Salaire Brut</th>
                                <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-right">Retenue Avance</th>
                                <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-right">Net à Payer</th>
                                <th className="px-6 py-4 font-black text-primary uppercase tracking-wider text-[10px] text-center">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTickets.map((ticket: any) => {
                                const detteTotaleAgent = Number(ticket.personnel?.total_avances_actives || 0);

                                return (
                                    <tr key={ticket.id} className="hover:bg-accent/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-black text-sm uppercase text-gray-900">
                                                {ticket.personnel?.nom} {ticket.personnel?.prenom}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono text-muted-foreground bg-gray-100 px-2 py-0.5 rounded">
                                                    {ticket.personnel?.matricule}
                                                </span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                                                    ticket.mode_paiement === 'ESPECES' ? 'text-blue-600 bg-blue-50' : 'text-indigo-600 bg-indigo-50'
                                                }`}>
                                                    {ticket.mode_paiement}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-center font-bold text-gray-600">
                                            {Number(ticket.quantite_totale).toFixed(2)}
                                        </td>

                                        <td className="px-6 py-4 text-right font-bold text-gray-500">
                                            {Number(ticket.montant_brut_cumule).toLocaleString()} F
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                {editingTicket === ticket.id ? (
                                                    <div className="flex items-center justify-end gap-2 animate-in zoom-in-95 bg-white p-1 rounded-lg border shadow-sm">
                                                        <input 
                                                            type="number" 
                                                            min="0"
                                                            max={detteTotaleAgent}
                                                            value={retenueValue} 
                                                            onChange={e => setRetenueValue(Number(e.target.value))} 
                                                            className="w-24 p-1 border-2 border-secondary rounded text-right font-black outline-none focus:ring-2 focus:ring-secondary/20" 
                                                            autoFocus 
                                                        />
                                                        <button onClick={() => handleSaveRetenue(ticket.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={16}/></button>
                                                        <button onClick={() => setEditingTicket(null)} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-end gap-2 font-bold text-red-600">
                                                            - {Number(ticket.montant_deduit_manuel).toLocaleString()} F
                                                            {isProvisoire && detteTotaleAgent > 0 && canModifierRetenue && (
                                                                <button 
                                                                    onClick={() => { setEditingTicket(ticket.id); setRetenueValue(ticket.montant_deduit_manuel); }} 
                                                                    className="text-gray-400 hover:text-secondary hover:bg-secondary/10 p-1 rounded transition-colors"
                                                                >
                                                                    <Edit3 size={14}/>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {detteTotaleAgent > 0 && (
                                                            <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-100 uppercase">
                                                                Dette : {detteTotaleAgent.toLocaleString()} F
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-4 text-right font-black text-secondary text-base">
                                            {Number(ticket.montant_net).toLocaleString()} F
                                        </td>

                                        <td className="px-6 py-4 text-center">
                                            <Badge className={`border-0 ${ticket.statut === 'SOLDE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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
        </div>
    );
}