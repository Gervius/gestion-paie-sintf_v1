import { usePage, router, Link, Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    ArrowLeft, CheckCircle2, AlertCircle, Wallet, 
    Banknote, Edit3, Save, X, FileSpreadsheet, Trash2,
    FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// 💡 IMPORT DE TOUTES LES ROUTES DYNAMIQUES
import { 
    financeEtatsIndex, 
    financeEtatsValider, 
    financeEtatsDestroy, 
    financeEtatsPayerMassEspeces, 
    financeTicketsUpdateRetenue, 
    financeEtatsBordereauCaisse,
    financeWaveGenerer,
    financeWaveTelecharger,
    financeWaveValider
} from '@/routes';

export default function Show() {
    const { etat, can, flash } = usePage<any>().props;
    
    const [editingTicket, setEditingTicket] = useState<number | null>(null);
    const [retenueValue, setRetenueValue] = useState<number>(0);

    const isProvisoire = etat.statut === 'PROVISOIRE';
    const isValide = etat.statut === 'VALIDE';

    const handleValiderEtat = () => {
        if (!confirm('Êtes-vous sûr de valider cet état ? Les montants seront verrouillés pour le paiement.')) return;
        router.post(financeEtatsValider.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handleDeleteEtat = () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet état ? Tous les pointages liés redeviendront "En attente" pour une prochaine génération.')) return;
        router.delete(financeEtatsDestroy.url({ etat: etat.id }));
    };

    const handlePayerEspeces = () => {
        if (!confirm('Confirmez-vous le décaissement de tous les tickets ESPÈCES ? Cette action va solder les tickets et déduire les avances.')) return;
        router.post(financeEtatsPayerMassEspeces.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handleSaveRetenue = (ticketId: number) => {
        router.post(financeTicketsUpdateRetenue.url({ ticket: ticketId }), { montant_retenue: retenueValue }, {
            preserveScroll: true,
            onSuccess: () => setEditingTicket(null),
            onError: (err) => alert(err.error || "Erreur lors de l'application de la retenue.")
        });
    };

    // --- Calculs Rapides (Statistiques) ---
    const totalTickets = etat.tickets.length;
    const ticketsWave = etat.tickets.filter((t: any) => t.mode_paiement === 'WAVE').length;
    const ticketsEspeces = etat.tickets.filter((t: any) => t.mode_paiement === 'ESPECES').length;
    const totalRetenues = etat.tickets.reduce((sum: number, t: any) => sum + Number(t.montant_deduit_manuel), 0);

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title={`État de Paie - ${etat.reference_etat}`} />

            <Link href={financeEtatsIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={16} /> Retour aux états de paie
            </Link>

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            {flash?.error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-sm">{flash.error}</span>
                </div>
            )}

            {/* EN-TÊTE ET KPI */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4 bg-white p-6 rounded-xl border border-border shadow-sm flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-primary">ÉTAT {etat.reference_etat}</h2>
                        <p className="text-muted-foreground font-medium mt-1">Section : {etat.section.nom_section} — Date : {new Date(etat.date_etat).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                            isProvisoire ? 'bg-orange-100 text-orange-700' : 
                            isValide ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                            STATUT : {etat.statut}
                        </span>
                        
                        {isProvisoire && can.valider_etat && (
                            <Button onClick={handleDeleteEtat} variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 mt-1">
                                <Trash2 size={14} className="mr-1.5" /> Supprimer l'état
                            </Button>
                        )}
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Brut Généré</div>
                    <div className="text-2xl font-black text-gray-900">{Number(etat.montant_total_brut).toLocaleString('fr-FR')} F</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-1">Total Retenues (Avances)</div>
                    <div className="text-2xl font-black text-destructive">{totalRetenues.toLocaleString('fr-FR')} F</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-border shadow-sm bg-primary/5 border-primary/20">
                    <div className="text-xs font-bold text-primary uppercase mb-1">Net Total à Payer</div>
                    <div className="text-2xl font-black text-primary">{Number(etat.montant_total_net).toLocaleString('fr-FR')} F</div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-center">
                    <div className="text-xs font-bold text-muted-foreground uppercase mb-2">Répartition ({totalTickets} agents)</div>
                    <div className="flex gap-4">
                        <span className="text-sm font-bold text-indigo-600"><Wallet size={14} className="inline mr-1"/> {ticketsWave} Wave</span>
                        <span className="text-sm font-bold text-emerald-600"><Banknote size={14} className="inline mr-1"/> {ticketsEspeces} Espèces</span>
                    </div>
                </div>
            </div>

            {/* TABLEAU DES TICKETS */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-[10px] font-bold text-primary uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-4 text-left">Agent</th>
                            <th className="px-4 py-4 text-center">Mode</th>
                            <th className="px-4 py-4 text-right">Brut Cumulé</th>
                            <th className="px-4 py-4 text-center">Avance en cours</th>
                            <th className="px-4 py-4 text-right">Retenue (Déduction)</th>
                            <th className="px-4 py-4 text-right">Net à Payer</th>
                            <th className="px-4 py-4 text-center">Statut Ticket</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {etat.tickets.map((ticket: any) => (
                            <tr key={ticket.id} className="hover:bg-accent/5">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-gray-900">{ticket.personnel.matricule}</div>
                                    <div className="text-xs text-muted-foreground">{ticket.personnel.nom} {ticket.personnel.prenom}</div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase ${ticket.mode_paiement === 'ESPECES' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'}`}>
                                        {ticket.mode_paiement}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-600">
                                    {Number(ticket.montant_brut_cumule).toLocaleString('fr-FR')} F
                                </td>
                                
                                <td className="px-4 py-3 text-center">
                                    {ticket.avance ? (
                                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                            {Number(ticket.avance.solde_restant).toLocaleString('fr-FR')} F
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-right">
                                    {editingTicket === ticket.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <input 
                                                type="number" 
                                                className="w-24 p-1 text-right border rounded outline-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                                value={retenueValue}
                                                onChange={(e) => setRetenueValue(Number(e.target.value))}
                                                max={ticket.avance ? Number(ticket.avance.solde_restant) : 0}
                                            />
                                            <button onClick={() => handleSaveRetenue(ticket.id)} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save size={16}/></button>
                                            <button onClick={() => setEditingTicket(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2 font-bold text-destructive">
                                            -{Number(ticket.montant_deduit_manuel).toLocaleString('fr-FR')} F
                                            {isProvisoire && ticket.avance && (
                                                <button onClick={() => { setEditingTicket(ticket.id); setRetenueValue(Number(ticket.montant_deduit_manuel)); }} className="text-gray-400 hover:text-primary transition-colors">
                                                    <Edit3 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 text-right font-black text-primary text-base">
                                    {Number(ticket.montant_net).toLocaleString('fr-FR')} F
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ticket.statut === 'SOLDE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {ticket.statut.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* BARRE D'ACTIONS GLOBALES */}
            <div className="flex justify-end gap-4 pt-4">
                
                {/* Bouton de validation globale (Chef de section) */}
                {isProvisoire && can.valider_etat && (
                    <Button onClick={handleValiderEtat} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 h-12">
                        <CheckCircle2 className="mr-2" size={20} /> Valider l'État (Verrouiller)
                    </Button>
                )}

                {isValide && (
                    <>
                        {/* 🟢 ZONE ESPÈCES (Ergonomie 3 étapes) */}
                        {can.payer_especes && (() => {
                            const ticketsEspeces = etat.tickets.filter((t: any) => t.mode_paiement === 'ESPECES');
                            if (ticketsEspeces.length === 0) return null;

                            const isEspecesSolde = ticketsEspeces.every((t: any) => t.statut === 'SOLDE');

                            if (!isEspecesSolde) {
                                return (
                                    <div className="flex gap-2 p-1 bg-emerald-50 border border-emerald-200 rounded-xl items-center pr-2">
                                        <Button className="bg-white text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold h-10 transition-all shadow-sm" asChild>
                                            <a href={financeEtatsBordereauCaisse.url({ etat: etat.id })} target="_blank" rel="noopener noreferrer">
                                                <FileText className="mr-2" size={18} /> Imprimer Bordereau
                                            </a>
                                        </Button>
                                        <Button onClick={handlePayerEspeces} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 transition-all shadow-md">
                                            <Banknote className="mr-2" size={18} /> Confirmer Décaissement
                                        </Button>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2 px-4 h-12 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold text-sm">
                                    <CheckCircle2 size={18} className="text-green-500" /> Paiements Espèces validés
                                </div>
                            );
                        })()}
                        
                        {/* 🔵 ZONE WAVE (Ergonomie 3 étapes) */}
                        {can.gerer_wave && (() => {
                            const waveTickets = etat.tickets.filter((t: any) => t.mode_paiement === 'WAVE');
                            if (waveTickets.length === 0) return null;

                            const lotCree = waveTickets.find((t: any) => t.lot_wave_id !== null);

                            if (!lotCree) {
                                return (
                                    <Button type="button" onClick={() => router.post(financeWaveGenerer.url({ etat: etat.id }))} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 transition-all">
                                        <FileSpreadsheet className="mr-2" size={20} /> Générer Lot Wave
                                    </Button>
                                );
                            } 
                            
                            const isWaveSolde = waveTickets.every((t: any) => t.statut === 'SOLDE');

                            if (!isWaveSolde) {
                                return (
                                    <div className="flex gap-2 p-1 bg-indigo-50 border border-indigo-200 rounded-xl items-center pr-2">
                                        <Button className="bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-bold h-10 transition-all shadow-sm" asChild>
                                            <a href={financeWaveTelecharger.url({ lot: lotCree.lot_wave_id })} target="_blank" rel="noopener noreferrer">
                                                <FileSpreadsheet className="mr-2" size={18} /> Télécharger Excel
                                            </a>
                                        </Button>
                                        <Button 
                                            onClick={() => {
                                                if (confirm('Avez-vous bien effectué le transfert sur le portail Wave ? Cette action va solder les tickets et déduire les avances.')) {
                                                    router.post(financeWaveValider.url({ lot: lotCree.lot_wave_id }), {}, { preserveScroll: true });
                                                }
                                            }} 
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 transition-all shadow-md"
                                        >
                                            <CheckCircle2 className="mr-2" size={18} /> Confirmer Transfert
                                        </Button>
                                    </div>
                                );
                            }

                            return (
                                <div className="flex items-center gap-2 px-4 h-12 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-bold text-sm">
                                    <CheckCircle2 size={18} className="text-green-500" /> Transferts Wave validés
                                </div>
                            );
                        })()}
                    </>
                )}
            </div>
        </div>
    );
}