import { usePage, Link, router, Head } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Download, Search, DollarSign, Loader2, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { financeEtatsIndex, financeEtatsValider, financeWaveGenerer, financeTicketsPayer } from '@/routes';
import { ConfirmationPaiementModal } from '@/components/ConfirmationPaiementModal';

export default function Show() {
    const { etat } = usePage<any>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [showPaiementModal, setShowPaiementModal] = useState(false);

    const formatMontant = (v: number) => v.toLocaleString('fr-FR') + ' F';

    const filteredTickets = etat.tickets.filter((t: any) =>
        t.personnel.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.personnel.matricule.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleValider = () => {
        if (!confirm('Confirmer la validation de cet état ?')) return;
        router.post(financeEtatsValider.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handleGenerateWave = () => {
        if (!confirm('Générer le lot pour les paiements Wave ?')) return;
        router.post(financeWaveGenerer.url({ etat: etat.id }), {}, { preserveScroll: true });
    };

    const handleConfirmPaiement = () => {
        if (!selectedTicket) return;
        router.post(financeTicketsPayer.url({ ticket: selectedTicket.id }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowPaiementModal(false);
                setSelectedTicket(null);
            }
        });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title={`Détail État ${etat.reference_etat}`} />

            <Link href={financeEtatsIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
                <ArrowLeft size={16} /> Retour aux états
            </Link>

            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-primary uppercase">{etat.section.nom_section}</h1>
                        <p className="text-sm text-muted-foreground font-medium">Référence : <span className="text-secondary font-mono">{etat.reference_etat}</span> — {new Date(etat.date_etat).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex gap-3">
                        {etat.statut === 'PROVISOIRE' ? (
                            <Button onClick={handleValider} className="bg-primary hover:bg-primary/90 text-white font-bold">
                                <CheckCircle className="mr-2" size={18} /> Valider l'état
                            </Button>
                        ) : (
                            <Button onClick={handleGenerateWave} className="bg-secondary hover:bg-secondary/90 text-white font-bold">
                                <FileSpreadsheet className="mr-2" size={18} /> Exporter Lot Wave
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Brut</p>
                        <p className="text-lg font-bold text-gray-900">{formatMontant(etat.montant_total_brut)}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Déductions</p>
                        <p className="text-lg font-bold text-destructive">{formatMontant(etat.montant_total_brut - etat.montant_total_net)}</p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                        <p className="text-[10px] font-bold text-primary uppercase">Net à Payer</p>
                        <p className="text-xl font-black text-primary">{formatMontant(etat.montant_total_net)}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl flex items-center justify-center">
                        <Badge className={etat.statut === 'VALIDE' ? 'bg-primary text-white px-4 py-1' : 'bg-orange-500 text-white px-4 py-1'}>
                            {etat.statut}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Chercher un agent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border text-[10px] font-bold text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Agent</th>
                            <th className="px-6 py-4 text-right">Brut</th>
                            <th className="px-6 py-4 text-right text-destructive">Déductions</th>
                            <th className="px-6 py-4 text-right">Net</th>
                            <th className="px-6 py-4 text-center">Mode</th>
                            <th className="px-6 py-4 text-center">Statut</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredTickets.map((ticket: any) => (
                            <tr key={ticket.id} className="hover:bg-accent/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900">{ticket.personnel.nom} {ticket.personnel.prenom}</div>
                                    <div className="font-mono text-[10px] text-secondary">{ticket.personnel.matricule}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">{formatMontant(ticket.montant_brut_cumule)}</td>
                                <td className="px-6 py-4 text-right text-destructive font-medium">
                                    {ticket.montant_deduit_manuel > 0 ? `-${formatMontant(ticket.montant_deduit_manuel)}` : '0'}
                                </td>
                                <td className="px-6 py-4 text-right font-black text-primary">{formatMontant(ticket.montant_net)}</td>
                                <td className="px-6 py-4 text-center">
                                    <Badge variant="outline" className={ticket.mode_paiement === 'WAVE' ? 'border-blue-400 text-blue-600' : 'border-primary text-primary'}>
                                        {ticket.mode_paiement}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-bold uppercase ${ticket.statut === 'SOLDE' ? 'text-primary' : 'text-orange-600'}`}>
                                        {ticket.statut.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {etat.statut === 'VALIDE' && ticket.mode_paiement === 'ESPECES' && ticket.statut === 'NON_SOLDE' && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => { setSelectedTicket(ticket); setShowPaiementModal(true); }}
                                            className="bg-primary hover:bg-primary/90 text-white font-bold h-8"
                                        >
                                            <DollarSign size={14} className="mr-1" /> Payer
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationPaiementModal
                isOpen={showPaiementModal}
                onClose={() => setShowPaiementModal(false)}
                onConfirm={handleConfirmPaiement}
                employe={selectedTicket ? `${selectedTicket.personnel.matricule} - ${selectedTicket.personnel.nom}` : ''}
                montant={selectedTicket?.montant_net ?? 0}
            />
        </div>
    );
}