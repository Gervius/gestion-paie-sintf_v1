import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';

export default function PersonnelImport() {
    const [step, setStep] = useState<'upload'|'preview'|'done'>('upload');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handlePreview = async () => {
        if (!fileRef.current?.files?.[0]) return;
        setLoading(true);
        const fd = new FormData();
        fd.append('file', fileRef.current.files[0]);
        try {
            const res = await axios.post('/api/personnel/import/preview', fd);
            setPreview(res.data);
            setStep('preview');
        } catch (e) { alert("Erreur de format CSV"); }
        finally { setLoading(false); }
    };

    const handleConfirm = () => {
        setLoading(true);
        router.post('/api/personnel/import', { validRows: preview.valid }, {
            onSuccess: () => setStep('done'),
            onFinish: () => setLoading(false)
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Head title="Importation de masse" />
            <Heading title="Import Personnel" description="Charger une liste d'employés via fichier CSV" />

            {step === 'upload' && (
                <div className="bg-white border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center space-y-4">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                        <Upload size={32} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">Cliquez pour choisir votre fichier CSV</p>
                        <p className="text-xs text-muted-foreground mt-1">Colonnes : nom, prenom, sexe, telephone, code_site, code_section...</p>
                    </div>
                    <input ref={fileRef} type="file" className="mx-auto block text-sm" accept=".csv" />
                    <Button onClick={handlePreview} disabled={loading} className="bg-primary px-8">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : 'Analyser le fichier'}
                    </Button>
                </div>
            )}

            {step === 'preview' && preview && (
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <Badge className="bg-green-100 text-green-700 p-2"><CheckCircle className="mr-1 size-3"/> {preview.valid.length} Valides</Badge>
                        {preview.errors.length > 0 && (
                            <Badge className="bg-orange-100 text-orange-700 p-2"><AlertTriangle className="mr-1 size-3"/> {preview.errors.length} Erreurs</Badge>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-auto border rounded-lg bg-white">
                        <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-muted">
                                <tr><th className="p-3 text-left">Nom</th><th className="p-3 text-left">Prénom</th><th className="p-3 text-left">Site</th></tr>
                            </thead>
                            <tbody>
                                {preview.valid.map((r:any, i:number) => (
                                    <tr key={i} className="border-t">
                                        <td className="p-3 font-bold">{r.nom}</td><td className="p-3">{r.prenom}</td><td className="p-3 text-secondary font-mono">{r.code_site}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setStep('upload')}>Annuler</Button>
                        <Button onClick={handleConfirm} disabled={loading} className="bg-primary px-8">
                            {loading ? <Loader2 className="animate-spin mr-2" /> : `Importer les ${preview.valid.length} agents`}
                        </Button>
                    </div>
                </div>
            )}

            {step === 'done' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center space-y-6">
                    <CheckCircle className="size-16 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-black text-green-900">Importation Terminée !</h2>
                    <div className="flex justify-center gap-4">
                        <Button className="bg-primary" asChild><Link href="/personnel">Retourner à la liste</Link></Button>
                        <Button variant="outline" onClick={() => setStep('upload')}>Nouvel import</Button>
                    </div>
                </div>
            )}
        </div>
    );
}