import { Head, useForm, Link } from '@inertiajs/react';
import { Building2, Upload, X, Save, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import InputError from '@/components/input-error';
import * as routes from '@/routes';

export default function Edit({ societe }: any) {
    const { data, setData, post, processing, errors } = useForm({
        raison_sociale: societe.raison_sociale || '',
        ifu: societe.ifu || '',
        rccm: societe.rccm || '',
        telephone: societe.telephone || '',
        email: societe.email || '',
        adresse: societe.adresse || '',
        gerant: societe.gerant || '',
        telephone_gerant: societe.telephone_gerant || '',
        email_gerant: societe.email_gerant || '',
        logo: null as File | null,
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(societe.logo_url || null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(routes.societeUpdate.url());
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Paramètres société" />

            <div>
                <h1 className="text-3xl font-black text-primary tracking-tight">Paramètres SINTF</h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Gérez les informations légales et l'identité visuelle apparaissant sur les documents
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* Logo */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-secondary">Identité Visuelle</CardTitle>
                        <CardDescription>Logo de l'entreprise pour les impressions</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-start gap-6 pt-6">
                        <Avatar className="h-28 w-28 rounded-xl border-2 border-border bg-white">
                            <AvatarImage src={logoPreview || ''} alt="Logo" className="object-contain" />
                            <AvatarFallback className="rounded-xl bg-primary/5">
                                <Building2 className="h-12 w-12 text-primary" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Label htmlFor="logo" className="cursor-pointer block">
                                <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 p-6 hover:bg-primary/5 transition-colors bg-white">
                                    <Upload className="h-6 w-6 text-primary" />
                                    <span className="font-bold text-gray-700">Choisir un nouveau logo</span>
                                </div>
                                <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                            </Label>
                            {data.logo && <p className="mt-2 text-sm font-medium text-secondary">Fichier : {data.logo.name}</p>}
                            <InputError message={errors.logo} className="mt-1" />
                            {logoPreview && (
                                <button type="button" onClick={() => { setData('logo', null); setLogoPreview(societe.logo_url || null); }} className="mt-3 flex items-center gap-1 text-sm font-bold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-md transition-colors">
                                    <X className="h-4 w-4" /> Supprimer la sélection
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Informations générales */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b"><CardTitle className="text-primary">Informations générales</CardTitle></CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
                        <div className="space-y-1.5 sm:col-span-2"><Label>Raison sociale *</Label><Input value={data.raison_sociale} onChange={e => setData('raison_sociale', e.target.value)} className="focus-visible:ring-secondary" required /><InputError message={errors.raison_sociale} /></div>
                        <div className="space-y-1.5"><Label>IFU</Label><Input value={data.ifu} onChange={e => setData('ifu', e.target.value)} className="focus-visible:ring-secondary" /><InputError message={errors.ifu} /></div>
                        <div className="space-y-1.5"><Label>RCCM</Label><Input value={data.rccm} onChange={e => setData('rccm', e.target.value)} className="focus-visible:ring-secondary" /><InputError message={errors.rccm} /></div>
                        <div className="space-y-1.5"><Label>Téléphone *</Label><Input value={data.telephone} onChange={e => setData('telephone', e.target.value)} className="focus-visible:ring-secondary" required /><InputError message={errors.telephone} /></div>
                        <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="focus-visible:ring-secondary" /><InputError message={errors.email} /></div>
                        <div className="space-y-1.5 sm:col-span-2"><Label>Adresse complète *</Label><Textarea value={data.adresse} onChange={e => setData('adresse', e.target.value)} rows={3} className="focus-visible:ring-secondary resize-none" required /><InputError message={errors.adresse} /></div>
                    </CardContent>
                </Card>

                {/* Gérant */}
                <Card className="border-border shadow-sm">
                    <CardHeader className="bg-muted/30 border-b"><CardTitle className="text-primary">Direction / Gérance</CardTitle></CardHeader>
                    <CardContent className="grid gap-6 sm:grid-cols-2 pt-6">
                        <div className="space-y-1.5 sm:col-span-2"><Label>Nom du gérant *</Label><Input value={data.gerant} onChange={e => setData('gerant', e.target.value)} className="focus-visible:ring-secondary" required /><InputError message={errors.gerant} /></div>
                        <div className="space-y-1.5"><Label>Téléphone du gérant</Label><Input value={data.telephone_gerant} onChange={e => setData('telephone_gerant', e.target.value)} className="focus-visible:ring-secondary" /><InputError message={errors.telephone_gerant} /></div>
                        <div className="space-y-1.5"><Label>Email du gérant</Label><Input type="email" value={data.email_gerant} onChange={e => setData('email_gerant', e.target.value)} className="focus-visible:ring-secondary" /><InputError message={errors.email_gerant} /></div>
                    </CardContent>
                </Card>

                {/* Actions avec Link Inertia */}
                <div className="flex justify-end gap-4 pt-4 pb-8">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard">Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white font-bold min-w-[220px]">
                        {processing ? 'Enregistrement...' : <><Save className="mr-2 h-4 w-4" /> Enregistrer les paramètres</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Paramètres société', href: '/societe/edit' },
    ],
};