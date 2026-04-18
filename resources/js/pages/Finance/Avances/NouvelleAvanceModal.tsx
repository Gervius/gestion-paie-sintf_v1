import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { X, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { financeAvancesStore, apiPersonnelSearch } from '@/routes';
import axios from 'axios';

export function NouvelleAvanceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        personnel_id: '', montant: '', motif: '', date_avance: new Date().toISOString().split('T')[0],
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [selectedPersonnel, setSelectedPersonnel] = useState<any>(null);

    // Recherche asynchrone des employés
    useEffect(() => {
        if (searchTerm.length >= 2 && !selectedPersonnel) {
            axios.get(`${apiPersonnelSearch.url()}?q=${encodeURIComponent(searchTerm)}`)
                 .then((r) => setResults(r.data));
        } else {
            setResults([]);
        }
    }, [searchTerm, selectedPersonnel]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(financeAvancesStore.url(), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSearchTerm('');
                setSelectedPersonnel(null);
                onClose();
            },
        });
    };

    const handleSelectPersonnel = (p: any) => {
        setData('personnel_id', p.id.toString());
        setSelectedPersonnel(p);
        setSearchTerm(`${p.matricule} - ${p.nom} ${p.prenom}`);
        setResults([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                <div className="bg-primary p-6 flex justify-between items-center text-white">
                    <h2 className="text-lg font-bold">Octroyer une Avance</h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Bénéficiaire *</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setSelectedPersonnel(null); setData('personnel_id', ''); }}
                                placeholder="Rechercher (Nom, Matricule...)"
                                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none"
                            />
                            {results.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {results.map((p) => (
                                        <button key={p.id} type="button" onClick={() => handleSelectPersonnel(p)} className="w-full px-4 py-3 text-left hover:bg-muted text-sm border-b last:border-0">
                                            <span className="font-bold text-primary">{p.matricule}</span> - {p.nom} {p.prenom}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {errors.personnel_id && <p className="mt-1 text-xs text-destructive">{errors.personnel_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Montant (FCFA) *</label>
                            <input type="number" min="0" value={data.montant} onChange={(e) => setData('montant', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none" />
                            {errors.montant && <p className="mt-1 text-xs text-destructive">{errors.montant}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-primary mb-2">Date *</label>
                            <input type="date" value={data.date_avance} onChange={(e) => setData('date_avance', e.target.value)} className="w-full px-3 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none" />
                            {errors.date_avance && <p className="mt-1 text-xs text-destructive">{errors.date_avance}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-primary mb-2">Motif d'octroi *</label>
                        <textarea value={data.motif} onChange={(e) => setData('motif', e.target.value)} rows={2} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-secondary outline-none" placeholder="Ex: Avance Tabaski..." />
                        {errors.motif && <p className="mt-1 text-xs text-destructive">{errors.motif}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={processing} className="bg-secondary hover:bg-secondary/90">
                            {processing ? <Loader2 className="animate-spin mr-2 size-4" /> : null}
                            Confirmer l'Avance
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}