import { useState, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Search, Loader2, User, Banknote, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { financeAvancesStore, apiPersonnelSearch } from '@/routes';
import axios from 'axios';

export function NouvelleAvanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        personnel_id: '',
        montant: '',
        motif: '',
        date_avance: new Date().toISOString().split('T')[0],
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // --- MOTEUR DE RECHERCHE ASYNC ---
    // --- MOTEUR DE RECHERCHE ASYNC (SÉCURISÉ) ---
    useEffect(() => {
        // 1. Initialisation du contrôleur d'annulation
        const abortController = new AbortController();

        if (searchTerm.length >= 2 && !selectedPersonnel) {
            setIsSearching(true);
            
            const delay = setTimeout(() => {
                axios.get(`${apiPersonnelSearch.url()}?q=${encodeURIComponent(searchTerm)}`, {
                    signal: abortController.signal // 2. Attachement du signal à la requête
                })
                .then((r) => {
                    setResults(r.data);
                    setIsSearching(false);
                })
                .catch((err) => {
                    // 3. On ignore l'erreur si elle est due à une annulation volontaire
                    if (!axios.isCancel(err)) {
                        setIsSearching(false);
                    }
                });
            }, 300); 

            return () => {
                clearTimeout(delay);
                abortController.abort(); // 4. Annule la requête HTTP en vol si le composant est démonté
            };
        } else {
            setResults([]);
            setIsSearching(false);
        }
        
        return () => abortController.abort();
    }, [searchTerm, selectedPersonnel]);

    const handleSelect = (p: any) => {
        setSelectedPersonnel(p);
        setData('personnel_id', p.id);
        setSearchTerm(`${p.matricule} - ${p.nom} ${p.prenom}`);
        setResults([]);
    };

    const resetSelection = () => {
        setSelectedPersonnel(null);
        setData('personnel_id', '');
        setSearchTerm('');
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        post(financeAvancesStore.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                resetSelection();
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="bg-secondary p-4 text-white flex justify-between items-center">
                    <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Banknote size={20} /> Accorder une avance
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X size={20}/></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* RECHERCHE AGENT */}
                    <div className="relative" ref={searchRef}>
                        <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Rechercher l'agent (Nom ou Matricule) *</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedPersonnel) resetSelection();
                                }}
                                placeholder="Tapez le nom ou le matricule..."
                                className="w-full pl-10 pr-10 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-secondary/10 outline-none font-bold transition-all"
                                autoComplete="off"
                            />
                            {selectedPersonnel && (
                                <button type="button" onClick={resetSelection} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:bg-red-50 p-1 rounded-md">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* RESULTATS DE RECHERCHE */}
                        {results.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-border rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {results.map((p) => (
                                    <div 
                                        key={p.id} 
                                        onClick={() => handleSelect(p)}
                                        className="p-3 hover:bg-secondary/5 cursor-pointer border-b last:border-0 flex items-center gap-3 transition-colors"
                                    >
                                        <div className="bg-gray-100 p-2 rounded-lg text-secondary"><User size={16}/></div>
                                        <div>
                                            <div className="font-black text-sm uppercase">{p.nom} {p.prenom}</div>
                                            <div className="text-[10px] font-mono text-muted-foreground">{p.matricule} — {p.site_travail?.nom_site}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {isSearching && <div className="absolute right-12 top-[38px]"><Loader2 className="animate-spin text-secondary" size={18}/></div>}
                        {errors.personnel_id && <p className="mt-1 text-xs text-destructive font-bold">{errors.personnel_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* MONTANT PRÉCIS (Correction Step 1) */}
                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Montant (FCFA) *</label>
                            <input 
                                type="number" step="1" min="1"
                                value={data.montant} 
                                onChange={(e) => setData('montant', e.target.value)} 
                                className="w-full px-3 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-secondary/10 outline-none font-black text-lg" 
                            />
                            {errors.montant && <p className="mt-1 text-xs text-destructive font-bold">{errors.montant}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Date d'octroi</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input 
                                    type="date" 
                                    value={data.date_avance} 
                                    onChange={(e) => setData('date_avance', e.target.value)} 
                                    className="w-full pl-10 pr-3 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-secondary/10 outline-none font-bold" 
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-700 uppercase mb-1.5">Motif / Justification *</label>
                        <textarea 
                            value={data.motif} 
                            onChange={(e) => setData('motif', e.target.value)} 
                            rows={2} 
                            className="w-full px-3 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-secondary/10 outline-none font-medium text-sm" 
                            placeholder="Ex: Avance Tabaski, Frais de santé..."
                        />
                        {errors.motif && <p className="mt-1 text-xs text-destructive font-bold">{errors.motif}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} className="font-bold">Annuler</Button>
                        <Button type="submit" disabled={processing || !data.personnel_id} className="bg-secondary hover:bg-secondary/90 text-white font-black px-8">
                            {processing ? <Loader2 className="animate-spin mr-2 size-4" /> : null}
                            Confirmer l'Avance
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}