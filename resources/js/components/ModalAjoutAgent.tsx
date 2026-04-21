import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { X, Search, Plus, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';

// 💡 Importation des définitions de routes Wayfinder
import { apiPersonnelSearch, apiPointageAgentsAdd } from '@/routes';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pointageId: number;
    lignesExistantes: any[]; // On passe les agents déjà présents sur la feuille
}

export function ModalAjoutAgent({ isOpen, onClose, pointageId, lignesExistantes }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loadingId, setLoadingId] = useState<number | null>(null);

    // Liste des IDs déjà présents pour griser les boutons et éviter les doublons
    const existingIds = lignesExistantes.map(l => l.personnel_id);

    // Recherche avec un léger délai (Debounce) pour ne pas saturer le serveur
    useEffect(() => {
        if (!isOpen) return;
        const delay = setTimeout(() => {
            if (searchTerm.length >= 2) {
                axios.get(`${apiPersonnelSearch.url()}?q=${encodeURIComponent(searchTerm)}`)
                     .then(r => setResults(r.data));
            } else {
                setResults([]);
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm, isOpen]);

    const handleAdd = (personnelId: number) => {
        setLoadingId(personnelId);
        
        // 💡 Utilisation de router.post avec preserveState pour ne pas fermer la modale
        router.post(apiPointageAgentsAdd.url({ pointage: pointageId }),
            { personnel_id: personnelId },
            {
                preserveScroll: true,
                preserveState: true, // Garde la modale ouverte et le texte de recherche intact
                onSuccess: () => {
                    setLoadingId(null);
                },
                onError: () => setLoadingId(null)
            }
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* EN-TÊTE FIXE */}
                <div className="bg-primary p-4 flex justify-between items-center text-white">
                    <h2 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                        Recherche d'Agents (Toute l'Usine)
                    </h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-md transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* ZONE DE RECHERCHE FIXE */}
                <div className="p-5 border-b border-border bg-muted/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Tapez un nom, un matricule ou un surnom..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 text-base border-2 border-primary/20 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                         <span className="text-[10px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">Conseil</span>
                         <p className="text-[10px] font-medium italic">Utilisez le matricule pour un résultat immédiat sans risque d'homonyme.</p>
                    </div>
                </div>

                {/* LISTE DES RÉSULTATS DÉFILANTE */}
                <div className="flex-1 overflow-y-auto p-3 bg-gray-50/30">
                    {searchTerm.length >= 2 && results.length === 0 ? (
                        <div className="p-10 text-center text-muted-foreground text-sm font-medium">
                            Aucun agent trouvé pour "{searchTerm}".
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.map((agent) => {
                                const isAlreadyIn = existingIds.includes(agent.id);
                                const isLoading = loadingId === agent.id;

                                return (
                                    <div 
                                        key={agent.id} 
                                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                                            isAlreadyIn 
                                            ? 'bg-muted/50 border-transparent opacity-70' 
                                            : 'bg-white border-border hover:border-primary/40 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="font-black text-sm text-gray-900 uppercase">
                                                {agent.nom} <span className="font-medium text-gray-700">{agent.prenom}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Badge Matricule bien visible */}
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30 font-mono text-[10px] py-0.5">
                                                    {agent.matricule}
                                                </Badge>
                                                
                                                {/* Badge Site pour lever le doute */}
                                                {agent.site_travail ? (
                                                    <span className="flex items-center text-[10px] font-bold text-muted-foreground bg-gray-100 px-2 py-1 rounded-md uppercase">
                                                        <MapPin size={10} className="mr-1 text-primary/60" /> {agent.site_travail.nom_site}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-orange-500 font-bold uppercase">Sans Site Défini</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Action Bouton */}
                                        {isAlreadyIn ? (
                                            <div className="flex items-center gap-1.5 text-green-700 font-bold text-[10px] uppercase">
                                                <CheckCircle2 size={16} /> Déjà Présent
                                            </div>
                                        ) : (
                                            <Button 
                                                size="sm"
                                                disabled={isLoading}
                                                onClick={() => handleAdd(agent.id)}
                                                className="bg-primary text-white font-black px-6 shadow-sm"
                                            >
                                                {isLoading ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Plus size={18} className="mr-1.5" />
                                                )}
                                                Ajouter
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}