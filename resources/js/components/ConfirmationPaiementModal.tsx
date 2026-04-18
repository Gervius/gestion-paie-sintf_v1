import { X, AlertCircle } from 'lucide-react';

interface ConfirmationPaiementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    employe: string;
    montant: number;
}

export function ConfirmationPaiementModal({
    isOpen,
    onClose,
    onConfirm,
    employe,
    montant,
}: ConfirmationPaiementModalProps) {
    if (!isOpen) return null;

    const formatMontant = (value: number) => {
        return value.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' FCFA';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Confirmer le règlement</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded">
                        <AlertCircle size={24} className="text-orange-600 flex-shrink-0" />
                        <p className="text-sm text-orange-800">
                            Cette action est irréversible. Assurez-vous d'avoir remis le montant en espèces à l'employé.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Employé</p>
                            <p className="text-lg font-medium text-gray-900">{employe}</p>
                        </div>

                        <div className="p-6 bg-blue-50 border-2 border-blue-600 rounded-lg text-center">
                            <p className="text-sm text-gray-600 mb-2">Montant à payer</p>
                            <p className="text-4xl font-bold text-blue-900">{formatMontant(montant)}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Confirmer le paiement
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}