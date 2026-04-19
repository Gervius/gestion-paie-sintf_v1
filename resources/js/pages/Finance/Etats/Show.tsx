import { useState } from 'react';
import { router, usePage, Head, Link } from '@inertiajs/react';
import { Wallet, Save, CheckCircle, ArrowLeft, Banknote, Edit3, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';


import { 
    financeEtatsIndex, 
    financeEtatsValider, 
    financeEtatsPayerMassEspeces, 
    financeTicketsUpdateRetenue 
} from '@/routes';

export default function Show() {
    const { etat, flash } = usePage<any>().props;
    const [editingTicket, setEditingTicket] = useState<number | null>(null);
    const [tempRetenue, setTempRetenue] = useState<string>('0');

    const handleSaveRetenue = (ticketId: number) => {
        
        router.post(financeTicketsUpdateRetenue.url({ ticket: ticketId }), {
            montant_retenue: tempRetenue
        }, { 
            preserveScroll: true, 
            onSuccess: () => setEditingTicket(null) 
        });
    };

    const handleValiderEtat = () => {
        if (!confirm('Voulez-vous figer cet état ? Une fois validé, les retenues ne seront plus modifiables.')) return;
        router.post(financeEtatsValider.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handlePaiementMasse = () => {
        if (!confirm('Confirmer le paiement immédiat en espèces de TOUS les tickets de cet état ?')) return;
        router.post(financeEtatsPayerMassEspeces.url({ etat: etat.id }));
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title={`Détail État - ${etat.reference_etat}`} />

            <Link href={financeEtatsIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={16} /> Retour à la liste des états
            </Link>

            {/* Affichage des notifications Flash */}
            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}
            
            {flash?.error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-sm">{flash.error}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-border shadow-sm">
                <div>
                    <Heading title={etat.reference_etat} description={`Période de cumul pour la section ${etat.section?.nom_section}`} />
                    <Badge className={`mt-2 border-0 ${etat.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        STATUT : {etat.statut}
                    </Badge>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Net total à décaisser</p>
                    <p className="text-3xl font-black text-secondary">{etat.montant_total_net.toLocaleString()} FCFA</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-4 text-left">Personnel</th>
                            <th className="px-4 py-4 text-right">Salaire Brut</th>
                            <th className="px-4 py-4 text-center">Dette (Avance)</th>
                            <th className="px-4 py-4 text-center w-48">Retenue (Entente)</th>
                            <th className="px-4 py-4 text-right">Net à Payer</th>
                            <th className="px-4 py-4 text-center">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {etat.tickets.map((ticket: any) => (
                            <tr key={ticket.id} className="hover:bg-accent/5 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="font-bold text-gray-900">{ticket.personnel?.nom} {ticket.personnel?.prenom}</div>
                                    <div className="text-[10px] text-muted-foreground font-bold italic">{ticket.mode_paiement}</div>
                                </td>
                                <td className="px-4 py-4 text-right font-medium text-gray-600">
                                    {ticket.montant_brut_cumule.toLocaleString()} F
                                </td>
                                <td className="px-4 py-4 text-center">
                                    {ticket.avance ? (
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black border border-orange-200">
                                            <Wallet size={12} /> RESTANT: {ticket.avance.solde_restant.toLocaleString()} F
                                        </div>
                                    ) : (
                                        <span className="text-gray-300 text-xs">—</span>
                                    )}
                                </td>
                                
                                
                                <td className="px-4 py-4 text-center">
                                    {etat.statut === 'PROVISOIRE' ? (
                                        ticket.avance ? (
                                            editingTicket === ticket.id ? (
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="number" className="w-full text-center p-1.5 border-2 border-primary rounded-lg font-bold outline-none"
                                                        value={tempRetenue} onChange={(e) => setTempRetenue(e.target.value)} autoFocus
                                                    />
                                                    <Button size="sm" onClick={() => handleSaveRetenue(ticket.id)} className="bg-primary h-9 px-2">
                                                        <Save size={16}/>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => { setEditingTicket(ticket.id); setTempRetenue(ticket.montant_deduit_manuel.toString()); }}
                                                    className={`group flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed transition-all ${ticket.montant_deduit_manuel > 0 ? 'bg-destructive/5 border-destructive text-destructive' : 'hover:border-primary text-gray-400'}`}
                                                >
                                                    <span className="font-black">
                                                        {ticket.montant_deduit_manuel > 0 ? `-${ticket.montant_deduit_manuel.toLocaleString()} F` : 'Ajuster retenue'}
                                                    </span>
                                                    <Edit3 size={14} className="opacity-0 group-hover:opacity-100" />
                                                </button>
                                            )
                                        ) : (
                                            <span className="text-gray-300 text-[10px] font-bold uppercase tracking-tighter italic">Non éligible</span>
                                        )
                                    ) : (
                                        <span className={`font-black ${ticket.montant_deduit_manuel > 0 ? 'text-destructive' : 'text-gray-400'}`}>
                                            {ticket.montant_deduit_manuel > 0 ? `-${ticket.montant_deduit_manuel.toLocaleString()} F` : '0 F'}
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-4 text-right font-black text-primary text-base">
                                    {ticket.montant_net.toLocaleString()} F
                                </td>
                                
                                <td className="px-4 py-4 text-center">
                                    {ticket.statut === 'SOLDE' ? (
                                        <Badge className="bg-green-100 text-green-700 shadow-none border-0">PAYÉ</Badge>
                                    ) : (
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                            {etat.statut === 'VALIDE' ? 'Prêt au décaissement' : 'En attente validation'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {etat.tickets.length > 0 && (
                        <tfoot className="bg-primary/5 border-t border-primary/20">
                            <tr>
                                <td colSpan={4} className="px-4 py-4 text-right font-bold uppercase text-[10px] text-primary tracking-widest">Cumul Net à décaisser</td>
                                <td className="px-4 py-4 text-right font-black text-xl text-primary">{etat.montant_total_net.toLocaleString()} F</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

            <div className="flex justify-end gap-4 bg-white p-6 rounded-xl border border-border shadow-sm">
                {etat.statut === 'PROVISOIRE' ? (
                    <Button 
                        onClick={handleValiderEtat} 
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold h-12 px-8 shadow-md transition-all active:scale-95"
                    >
                        <CheckCircle className="mr-2" size={20} /> Valider l'État (Figer les retenues)
                    </Button>
                ) : (
                    <Button 
                        onClick={handlePaiementMasse} 
                        className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 shadow-lg transition-all active:scale-95"
                        disabled={etat.tickets.filter((t:any) => t.mode_paiement === 'ESPECES' && t.statut === 'NON_SOLDE').length === 0}
                    >
                        <Banknote className="mr-2" size={20} /> Payer tous les tickets "Espèces"
                    </Button>
                )}
            </div>
        </div>
    );
}