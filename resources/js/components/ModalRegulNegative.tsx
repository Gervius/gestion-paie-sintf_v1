import { useForm } from '@inertiajs/react';
import { AlertTriangle, X, Loader2, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ModalRegulNegative({ isOpen, onClose, ligne }: { isOpen: boolean; onClose: () => void; ligne: any }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        montant_trop_percu: ligne?.montant_brut || '',
        motif: 'Correction erreur de saisie',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ligne) return;
        post(`/api/lignes/${ligne.id}/regul-negative`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    if (!isOpen || !ligne) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
                <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
                    <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                        <AlertTriangle size={18}/> Signaler un Trop-Perçu
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-md transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-orange-50 text-orange-900 text-xs font-medium p-4 rounded-xl border border-orange-100 flex gap-3">
                        <Handshake size={28} className="shrink-0 text-orange-600" />
                        <div>
                            L'agent <strong>{ligne.personnel.nom}</strong> a été validé à tort pour <strong>{ligne.montant_brut.toLocaleString()} F</strong>.
                            <br/><br/>
                            Ce montant sera ajouté à son solde d'<strong>Avances</strong>. La retenue effective sera discutée manuellement lors de la paie.
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-700 uppercase">Montant à retenir (F) *</label>
                        <input 
                            type="number" step="1" min="1" max={ligne.montant_brut}
                            value={data.montant_trop_percu} 
                            onChange={(e) => setData('montant_trop_percu', e.target.value)} 
                            className="w-full p-3 text-lg border-2 border-orange-100 rounded-xl focus:border-orange-500 outline-none font-black text-orange-600" 
                        />
                        {errors.montant_trop_percu && <p className="text-xs text-red-500 font-bold">{errors.montant_trop_percu}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-black text-gray-700 uppercase">Motif de la retenue *</label>
                        <textarea value={data.motif} onChange={(e) => setData('motif', e.target.value)} rows={2} className="w-full p-3 text-sm border-2 border-border rounded-xl focus:border-orange-500 outline-none" />
                        {errors.motif && <p className="text-xs text-red-500 font-bold">{errors.motif}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button>
                        <Button type="submit" disabled={processing} className="bg-orange-500 hover:bg-orange-600 rounded-xl font-black px-6 shadow-md text-white">
                            {processing ? <Loader2 className="animate-spin" /> : 'Signaler le trop-perçu'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}