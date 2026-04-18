import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { referentielsImportIndex, referentielsImportPreview, referentielsImportStore } from '@/routes';

const types = [
    { value: 'localites', label: 'Localités' },
    { value: 'sites', label: 'Sites' },
    { value: 'produits', label: 'Produits' },
    { value: 'sections', label: 'Sections' },
];

export default function Import() {
    const [step, setStep] = useState(1);
    const [preview, setPreview] = useState<{ valid: any[]; errors: any[] } | null>(null);
    const [selectedType, setSelectedType] = useState('');

    const { data, setData, post, processing } = useForm({
        file: null as File | null,
        type: '',
    });

    const handlePreview = () => {
        const formData = new FormData();
        formData.append('file', data.file!);
        formData.append('type', data.type);
        post(referentielsImportPreview.url(), {
            data: formData,
            onSuccess: (page) => {
                setPreview(page.props.preview as any);
                setSelectedType(data.type);
                setStep(2);
            },
        });
    };

    const handleImport = () => {
        post(referentielsImportStore.url(), {
            data: { type: selectedType, validRows: preview?.valid },
            onSuccess: () => {
                setStep(1);
                setPreview(null);
                setData('file', null);
                setData('type', '');
            },
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Importer des référentiels</h1>

            {step === 1 && (
                <div className="bg-white p-6 rounded-lg border">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Type de référentiel</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full md:w-64 px-3 py-2 border rounded-md"
                                required
                            >
                                <option value="">Sélectionner...</option>
                                {types.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Fichier CSV</label>
                            <input
                                type="file"
                                accept=".csv,.txt"
                                onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                        <button
                            onClick={handlePreview}
                            disabled={!data.file || !data.type || processing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Upload size={18} /> Prévisualiser
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && preview && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg border">
                            <h2 className="font-semibold text-green-700 flex items-center gap-2 mb-3">
                                <CheckCircle size={20} /> Lignes valides ({preview.valid.length})
                            </h2>
                            <div className="max-h-80 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-green-50">
                                        <tr>{Object.keys(preview.valid[0] || {}).map((k) => <th key={k} className="px-2 py-1 text-left">{k}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {preview.valid.map((row, i) => (
                                            <tr key={i} className="border-t">
                                                {Object.values(row).map((v, j) => <td key={j} className="px-2 py-1">{String(v)}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-lg border">
                            <h2 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                                <XCircle size={20} /> Erreurs ({preview.errors.length})
                            </h2>
                            <div className="max-h-80 overflow-auto">
                                {preview.errors.map((err, i) => (
                                    <div key={i} className="mb-2 p-2 bg-red-50 rounded text-sm">
                                        <p className="font-medium">Ligne {err.row}</p>
                                        <p className="text-red-600">{err.errors.join(', ')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setStep(1)} className="px-4 py-2 border rounded-md">Annuler</button>
                        <button
                            onClick={handleImport}
                            disabled={preview.valid.length === 0 || processing}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            Confirmer l'import ({preview.valid.length} lignes)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}