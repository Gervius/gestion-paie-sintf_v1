import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, X, User } from 'lucide-react';
import type { Localite, Site, Section } from '@/types';
import { personnelIndex } from '@/routes';

export default function Create({ localites, sites, sections }: any) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '', prenom: '', surnom: '', sexe: '', date_naissance: '', lieu_naissance: '',
        num_cnib: '', telephone: '', localite_domicile_id: '', site_travail_id: '',
        section_defaut_id: '', preference_paiement: 'ESPECES', est_marie: false
    });

    const sectionsByProduit = sections.reduce((acc: any, s: any) => {
        const key = s.produit?.nom_produit ?? 'Autre';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Head title="Recrutement Personnel" />
            <Heading title="Nouvel Employé" description="Enregistrement des données civiles et professionnelles" />

            <form onSubmit={(e) => { e.preventDefault(); post('/personnel'); }} className="space-y-8">
                
                {/* Section : État Civil & Identité */}
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-primary font-bold flex items-center gap-2 mb-6 border-b pb-2">
                        État Civil & Identité
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <Label>Nom *</Label>
                            <Input value={data.nom} onChange={e => setData('nom', e.target.value)} required />
                            <InputError message={errors.nom} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Prénom *</Label>
                            <Input value={data.prenom} onChange={e => setData('prenom', e.target.value)} required />
                            <InputError message={errors.prenom} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Sexe *</Label>
                            <Select onValueChange={v => setData('sexe', v)}>
                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                <SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent>
                            </Select>
                            <InputError message={errors.sexe} />
                        </div>
                        
                        {/* NOUVEAUX CHAMPS AJOUTÉS POUR PASSER LA VALIDATION */}
                        <div className="space-y-1.5">
                            <Label>Date de naissance *</Label>
                            <Input type="date" value={data.date_naissance} onChange={e => setData('date_naissance', e.target.value)} required />
                            <InputError message={errors.date_naissance} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Lieu de naissance *</Label>
                            <Input value={data.lieu_naissance} onChange={e => setData('lieu_naissance', e.target.value)} required />
                            <InputError message={errors.lieu_naissance} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Numéro CNIB *</Label>
                            <Input value={data.num_cnib} onChange={e => setData('num_cnib', e.target.value)} placeholder="Ex: B1234567" required />
                            <InputError message={errors.num_cnib} />
                        </div>
                    </div>
                </div>

                {/* Section : Coordonnées & Origine */}
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-secondary font-bold flex items-center gap-2 mb-6 border-b pb-2">
                        Coordonnées & Origine
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <Label>Téléphone *</Label>
                            <Input type="tel" value={data.telephone} onChange={e => setData('telephone', e.target.value)} placeholder="Ex: 70 00 00 00" required />
                            <InputError message={errors.telephone} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Localité / Village d'origine *</Label>
                            <Select onValueChange={v => setData('localite_domicile_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Choisir un village" /></SelectTrigger>
                                <SelectContent>
                                    {localites.map((loc: any) => (
                                        <SelectItem key={loc.id} value={String(loc.id)}>{loc.nom_localite}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.localite_domicile_id} />
                        </div>
                    </div>
                </div>

                {/* Section : Affectation SINTF */}
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-primary font-bold flex items-center gap-2 mb-6 border-b pb-2">
                        Affectation & Paiement
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Site de Travail *</Label>
                                <Select onValueChange={v => setData('site_travail_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Choisir un site" /></SelectTrigger>
                                    <SelectContent>{sites.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.nom_site}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={errors.site_travail_id} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Section par défaut *</Label>
                                <Select onValueChange={v => setData('section_defaut_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Choisir la section" /></SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(sectionsByProduit).map(([prod, secs]: any) => (
                                            <SelectGroup key={prod}>
                                                <SelectLabel className="text-secondary font-bold">{prod}</SelectLabel>
                                                {secs.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.nom_section}</SelectItem>)}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.section_defaut_id} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Mode de Paiement Préféré *</Label>
                                <Select defaultValue="ESPECES" onValueChange={v => setData('preference_paiement', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ESPECES">Espèces (Caisse)</SelectItem>
                                        <SelectItem value="WAVE">Mobile Money (Wave)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                <Checkbox id="marie" checked={data.est_marie} onCheckedChange={v => setData('est_marie', !!v)} />
                                <Label htmlFor="marie" className="cursor-pointer">L'employé est marié(e)</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" asChild><Link href={personnelIndex().url}>Annuler</Link></Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 min-w-[200px] text-white">
                        {processing ? 'Enregistrement...' : "Enregistrer l'Employé"}
                    </Button>
                </div>
            </form>
        </div>
    );
}