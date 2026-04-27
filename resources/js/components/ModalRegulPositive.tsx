import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Search, Loader2, PlusCircle, MapPin, Zap, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { apiPersonnelSearch } from '@/routes';

export function ModalRegulPositive({ isOpen, onClose, pointage }: { isOpen: boolean; onClose: () => void; pointage: any }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        personnel_id: '',
        quantite: '',
        motif: '',
        paiement_immediat: true,
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);

    useEffect(() => {
        const abortController = new AbortController();

        // Condition adaptée selon le fichier (ex: if (!isOpen) return; pour ModalAjoutAgent)
        if (searchTerm.length >= 2) { 
            const delay = setTimeout(() => {
                axios.get(`${apiPersonnelSearch.url()}?q=${encodeURIComponent(searchTerm)}`, {
                    signal: abortController.signal // <-- Le bouclier anti-fuite
                })
                .then(r => setResults(r.data))
                .catch(err => {
                    if (!axios.isCancel(err)) console.error(err);
                });
            }, 300);
            return () => {
                clearTimeout(delay);
                abortController.abort();
            };
        } else {
            setResults([]);
        }
        
        return () => abortController.abort();
    }, [searchTerm]); 

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        post(`/api/pointages/${pointage.id}/regul-positive`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSearchTerm('');
                setSelectedAgent(null);
                onClose();
            },
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
                <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
                    <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                        <PlusCircle size={18}/> Signaler un Oubli
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-700 uppercase italic">Urgence du traitement</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setData('paiement_immediat', true)}
                                className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all ${data.paiement_immediat ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-md' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                            >
                                <Zap size={24} className={data.paiement_immediat ? 'text-orange-500 mb-1' : 'mb-1'} />
                                <span className="text-xs font-black uppercase">Express</span>
                                <span className="text-[9px] text-center mt-1">Paie générée maintenant</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setData('paiement_immediat', false)}
                                className={`flex flex-col items-center p-3 border-2 rounded-xl transition-all ${!data.paiement_immediat ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}
                            >
                                <CalendarClock size={24} className={!data.paiement_immediat ? 'text-emerald-500 mb-1' : 'mb-1'} />
                                <span className="text-xs font-black uppercase">Différé</span>
                                <span className="text-[9px] text-center mt-1">Prochaine paie globale</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-700 uppercase">Agent concerné *</label>
                        {!selectedAgent ? (
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                                <input
                                    type="text" value={searchTerm} autoFocus
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nom ou matricule..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border-2 border-emerald-100 rounded-xl focus:border-emerald-500 outline-none"
                                />
                                {results.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {results.map((p) => (
                                            <button key={p.id} type="button" onClick={() => { setData('personnel_id', p.id.toString()); setSelectedAgent(p); setResults([]); }} className="w-full px-4 py-3 text-left hover:bg-emerald-50 text-sm border-b">
                                                <div className="font-bold">{p.nom} {p.prenom}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] text-primary">{p.matricule}</Badge>
                                                    {p.site_travail && <span className="text-[10px] text-muted-foreground uppercase"><MapPin size={10} className="inline mr-1"/>{p.site_travail.nom_site}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div>
                                    <div className="font-bold text-emerald-900 uppercase">{selectedAgent.nom} {selectedAgent.prenom}</div>
                                    <div className="text-xs font-mono text-emerald-700">{selectedAgent.matricule}</div>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedAgent(null); setData('personnel_id', ''); setSearchTerm(''); }} className="text-emerald-700 hover:bg-emerald-100">Changer</Button>
                            </div>
                        )}
                        {errors.personnel_id && <p className="text-xs text-red-500 font-bold">{errors.personnel_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black text-gray-700 uppercase">Quantité *</label>
                            <input type="number" step="0.01" min="0.01" value={data.quantite} onChange={(e) => setData('quantite', e.target.value)} className="w-full p-2.5 text-sm border-2 border-border rounded-xl focus:border-emerald-500 outline-none font-black" />
                            {errors.quantite && <p className="text-xs text-red-500 font-bold">{errors.quantite}</p>}
                        </div>
                        <div className="space-y-1 text-right">
                            <label className="text-xs font-black text-gray-500 uppercase">Montant estimé</label>
                            <div className="text-lg font-black text-emerald-700 mt-2">
                                {(Number(data.quantite || 0) * pointage.taux_applique).toLocaleString()} F
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-700 uppercase">Motif de l'oubli *</label>
                        <textarea value={data.motif} onChange={(e) => setData('motif', e.target.value)} rows={2} className="w-full p-3 text-sm border-2 border-border rounded-xl focus:border-emerald-500 outline-none" placeholder="Ex: Oubli sur la fiche terrain..." />
                        {errors.motif && <p className="text-xs text-red-500 font-bold">{errors.motif}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
                        <Button type="submit" disabled={processing || !selectedAgent} className={`${data.paiement_immediat ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-600 hover:bg-emerald-700'} rounded-xl font-black px-6 shadow-md text-white transition-all`}>
                            {processing ? <Loader2 className="animate-spin" /> : (data.paiement_immediat ? 'Confirmer & Payer' : 'Mettre en attente')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}