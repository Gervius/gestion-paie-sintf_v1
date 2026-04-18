import { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { NouvelleAvanceModal } from './NouvelleAvanceModal'; 
import { financeAvancesIndex } from '@/routes';
import type { PaginatedData } from '@/types';

export default function Index() {
    const { avances, filters } = usePage<any>().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [showModal, setShowModal] = useState(false);

    // Recherche avec Debounce via Inertia
    useEffect(() => {
        const delay = setTimeout(() => {
            if (search !== filters?.search) {
                router.get(financeAvancesIndex.url(), { search }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(delay);
    }, [search, filters?.search]);

    const formatMontant = (v: number) => v.toLocaleString('fr-FR') + ' F';

    return (
        <div className="p-6 space-y-6">
            <Head title="Gestion des Avances" />

            <div className="flex items-center justify-between">
                <Heading title="Avances sur Salaire" description="Historique et gestion des prêts aux employés" />
                <Button onClick={() => setShowModal(true)} className="bg-secondary hover:bg-secondary/90 text-white">
                    <Plus size={18} className="mr-2" />
                    Octroyer une avance
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher (Nom, Matricule)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border text-xs font-bold text-primary uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Agent</th>
                            <th className="px-6 py-4 text-right">Montant Initial</th>
                            <th className="px-6 py-4 text-right">Solde Restant</th>
                            <th className="px-6 py-4 text-center">Date</th>
                            <th className="px-6 py-4 text-center">Statut</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {avances.data.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucune avance enregistrée</td></tr>
                        ) : (
                            avances.data.map((avance: any) => (
                                <tr key={avance.id} className="hover:bg-accent/5">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{avance.personnel.matricule}</div>
                                        <div className="text-sm text-muted-foreground">{avance.personnel.nom} {avance.personnel.prenom}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-700">
                                        {formatMontant(avance.montant_initial)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-destructive">
                                        {formatMontant(avance.solde_restant)}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm">
                                        {new Date(avance.date_avance).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge className={avance.statut === 'ACTIVE' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-primary/20 text-primary'}>
                                            {avance.statut}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de création */}
            <NouvelleAvanceModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
}