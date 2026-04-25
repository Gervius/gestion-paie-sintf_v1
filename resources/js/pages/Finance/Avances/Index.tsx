import { usePage, useForm, Head, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Plus, CheckCircle2, Banknote, Search, CalendarClock, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/Pagination';
import { financeAvancesStore } from '@/routes';

export default function Index() {
    const { avances, personnels, filters, flash } = usePage<any>().props;
    const [showForm, setShowForm] = useState(false);
    
    // Filtres du tableau principal
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    // --- ÉTATS POUR LA RECHERCHE AGENT (AUTOCOMPLETE) ---
    const [agentSearchQuery, setAgentSearchQuery] = useState('');
    const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsAgentDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Filtrage ultra-rapide côté client (limité à 50 résultats pour ne pas faire ramer le navigateur)
    const filteredPersonnels = personnels
        .filter((p: any) => 
            `${p.nom} ${p.prenom} ${p.matricule}`.toLowerCase().includes(agentSearchQuery.toLowerCase())
        )
        .slice(0, 50);

    // --- MOTEUR DU TABLEAU ---
    useEffect(() => {
        const delay = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get(window.location.pathname, { search: searchTerm }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm]);

    // --- FORMULAIRE ---
    const { data, setData, post, processing, errors, reset } = useForm({
        personnel_id: '', 
        montant: '', 
        motif: '', 
        date: new Date().toISOString().split('T')[0],
    });

    const handleSelectAgent = (agent: any) => {
        setData('personnel_id', agent.id);
        setAgentSearchQuery(`${agent.matricule} — ${agent.nom} ${agent.prenom}`);
        setIsAgentDropdownOpen(false);
    };

    const handleClearAgent = () => {
        setData('personnel_id', '');
        setAgentSearchQuery('');
        setIsAgentDropdownOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(financeAvancesStore.url(), { 
            onSuccess: () => { 
                setShowForm(false); 
                reset(); 
                setAgentSearchQuery('');
            } 
        });
    };

    return (
        <div className="p-6 space-y-6 bg-background">
            <Head title="Gestion des Avances" />

            {flash?.success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-sm">{flash.success}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Heading title="Avances sur Salaire" description="Historique des prêts et suivi des soldes restants" />
                <Button onClick={() => setShowForm(!showForm)} className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Accorder une avance
                </Button>
            </div>

            {/* FORMULAIRE D'AVANCE */}
            {showForm && (
                <div className="bg-white border-2 border-primary/20 rounded-xl p-6 shadow-sm">
                    <h3 className="text-sm font-bold text-primary mb-4 uppercase flex items-center gap-2"><Banknote size={16}/> Saisir une nouvelle avance</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                        
                        {/* NOUVEAU CHAMP DE RECHERCHE AGENT */}
                        <div className="space-y-1.5 md:col-span-2 relative" ref={wrapperRef}>
                            <label className="text-xs font-bold text-gray-700">Agent bénéficiaire *</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher nom ou matricule..." 
                                    value={agentSearchQuery}
                                    onChange={(e) => {
                                        setAgentSearchQuery(e.target.value);
                                        setData('personnel_id', ''); // On vide l'ID si l'utilisateur tape quelque chose de nouveau
                                        setIsAgentDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsAgentDropdownOpen(true)}
                                    className={`w-full pl-10 pr-10 py-2.5 border rounded-lg outline-none transition-all ${data.personnel_id ? 'border-green-500 bg-green-50 text-green-900 font-bold' : 'border-border focus:ring-2 focus:ring-primary'}`}
                                />
                                {agentSearchQuery && (
                                    <button type="button" onClick={handleClearAgent} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* LISTE DÉROULANTE INTELLIGENTE */}
                            {isAgentDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {filteredPersonnels.length === 0 ? (
                                        <div className="p-3 text-sm text-muted-foreground text-center">Aucun agent trouvé</div>
                                    ) : (
                                        filteredPersonnels.map((p: any) => (
                                            <div 
                                                key={p.id} 
                                                onClick={() => handleSelectAgent(p)}
                                                className="px-4 py-2.5 hover:bg-primary/10 cursor-pointer flex flex-col border-b last:border-b-0"
                                            >
                                                <span className="font-bold text-sm uppercase text-gray-900">{p.nom} {p.prenom}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground">{p.matricule}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {errors.personnel_id && <p className="text-xs text-destructive mt-1">Veuillez sélectionner un agent dans la liste.</p>}
                        </div>

                        {/* MONTANT CORRIGÉ (step="1") */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700">Montant (FCFA) *</label>
                            <input 
                                type="number" 
                                min="1" 
                                step="1" 
                                value={data.montant} 
                                onChange={(e) => setData('montant', e.target.value)} 
                                className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none font-bold" 
                                placeholder="Ex: 450"
                                required 
                            />
                        </div>

                        <div className="space-y-1.5 md:col-span-1">
                            <label className="text-xs font-bold text-gray-700">Motif *</label>
                            <input type="text" value={data.motif} onChange={(e) => setData('motif', e.target.value)} className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                        </div>

                        <Button type="submit" disabled={processing || !data.personnel_id} className="bg-orange-500 hover:bg-orange-600 text-white h-[46px] w-full font-bold mt-5 disabled:opacity-50">
                            {processing ? 'En cours...' : 'Valider'}
                        </Button>
                    </form>
                </div>
            )}

            <div className="flex bg-white p-2 rounded-xl border border-border shadow-sm max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input type="text" placeholder="Rechercher dans l'historique..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium" />
                </div>
            </div>

            {/* TABLEAU HISTORIQUE */}
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px] flex items-center gap-2"><CalendarClock size={14} className="text-secondary"/> Date</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Bénéficiaire</th>
                            <th className="px-4 py-4 text-left font-bold text-primary uppercase text-[10px]">Motif</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Montant Initial</th>
                            <th className="px-4 py-4 text-right font-bold text-primary uppercase text-[10px]">Reste à Payer</th>
                            <th className="px-4 py-4 text-center font-bold text-primary uppercase text-[10px]">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {avances.data.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-bold">Aucune avance correspondante.</td></tr>
                        ) : (
                            avances.data.map((avance: any) => (
                                <tr key={avance.id} className="hover:bg-accent/5">
                                    <td className="px-4 py-4 font-medium text-gray-600">{new Date(avance.date_avance).toLocaleDateString('fr-FR')}</td>
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-gray-900 uppercase">{avance.personnel?.nom} {avance.personnel?.prenom}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono">{avance.personnel?.matricule}</div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-700">{avance.motif}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-500">{avance.montant_initial.toLocaleString()} F</td>
                                    <td className="px-4 py-4 text-right font-black text-secondary text-base">{avance.solde_restant > 0 ? `${avance.solde_restant.toLocaleString()} F` : '0 F'}</td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge className={`border-0 ${avance.statut === 'SOLDEE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {avance.statut === 'SOLDEE' ? 'REMBOURSÉE' : 'EN COURS'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Pagination links={avances.links} />
        </div>
    );
}