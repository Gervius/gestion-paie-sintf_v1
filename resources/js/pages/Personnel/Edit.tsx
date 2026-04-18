import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, User, ArrowLeft, MapPin, Briefcase } from 'lucide-react';
import { personnelIndex } from '@/routes'; // Wayfinder

export default function Edit({ personnel, localites, sites, sections }: any) {
    const { data, setData, put, processing, errors } = useForm({
        nom: personnel.nom || '',
        prenom: personnel.prenom || '',
        surnom: personnel.surnom || '',
        sexe: personnel.sexe || 'M',
        date_naissance: personnel.date_naissance || '',
        lieu_naissance: personnel.lieu_naissance || '',
        num_acte_naissance: personnel.num_acte_naissance || '',
        num_cnib: personnel.num_cnib || '',
        date_cnib: personnel.date_cnib || '',
        lieu_cnib: personnel.lieu_cnib || '',
        num_cnss: personnel.num_cnss || '',
        telephone: personnel.telephone || '',
        tel_compte_wave: personnel.tel_compte_wave || '',
        est_marie: !!personnel.est_marie,
        nb_charge: personnel.nb_charge?.toString() || '0',
        niveau_etude: personnel.niveau_etude || '',
        classification: personnel.classification || '',
        localite_domicile_id: personnel.localite_domicile_id?.toString() || '',
        site_travail_id: personnel.site_travail_id?.toString() || '',
        section_defaut_id: personnel.section_defaut_id?.toString() || '',
        preference_paiement: personnel.preference_paiement || 'ESPECES',
        actif: !!personnel.actif,
    });

    const sectionsByProduit = sections.reduce((acc: any, s: any) => {
        const key = s.produit?.nom_produit ?? 'Autre';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Utilisation explicite de l'URL Laravel puisque Wayfinder peut ne pas l'avoir encore scannée
        put(`/personnel/${personnel.id}`);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <Head title="Modifier l'Employé" />
            
            <Link href={personnelIndex().url} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
                <ArrowLeft size={16} /> Retour à la liste du personnel
            </Link>

            <Heading title="Modifier l'Employé" description={`Mise à jour du profil de ${personnel.nom} ${personnel.prenom} (${personnel.matricule})`} />

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* ETAT CIVIL */}
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-primary font-bold flex items-center gap-2 mb-6 border-b pb-2"><User size={18} /> État Civil & Identité</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5"><Label>Nom *</Label><Input value={data.nom} onChange={e => setData('nom', e.target.value)} required /><InputError message={errors.nom} /></div>
                        <div className="space-y-1.5"><Label>Prénom *</Label><Input value={data.prenom} onChange={e => setData('prenom', e.target.value)} required /><InputError message={errors.prenom} /></div>
                        <div className="space-y-1.5"><Label>Surnom</Label><Input value={data.surnom} onChange={e => setData('surnom', e.target.value)} /><InputError message={errors.surnom} /></div>
                        <div className="space-y-1.5">
                            <Label>Sexe *</Label>
                            <Select value={data.sexe} onValueChange={v => setData('sexe', v)}>
                                <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                                <SelectContent><SelectItem value="M">Masculin</SelectItem><SelectItem value="F">Féminin</SelectItem></SelectContent>
                            </Select>
                            <InputError message={errors.sexe} />
                        </div>
                        <div className="space-y-1.5"><Label>Date de naissance *</Label><Input type="date" value={data.date_naissance} onChange={e => setData('date_naissance', e.target.value)} required /><InputError message={errors.date_naissance} /></div>
                        <div className="space-y-1.5"><Label>Lieu de naissance *</Label><Input value={data.lieu_naissance} onChange={e => setData('lieu_naissance', e.target.value)} required /><InputError message={errors.lieu_naissance} /></div>
                        <div className="space-y-1.5"><Label>Numéro CNIB *</Label><Input value={data.num_cnib} onChange={e => setData('num_cnib', e.target.value)} required /><InputError message={errors.num_cnib} /></div>
                        <div className="space-y-1.5"><Label>Date CNIB</Label><Input type="date" value={data.date_cnib} onChange={e => setData('date_cnib', e.target.value)} /><InputError message={errors.date_cnib} /></div>
                        <div className="space-y-1.5"><Label>Lieu CNIB</Label><Input value={data.lieu_cnib} onChange={e => setData('lieu_cnib', e.target.value)} /><InputError message={errors.lieu_cnib} /></div>
                        <div className="space-y-1.5"><Label>N° Acte de Naissance</Label><Input value={data.num_acte_naissance} onChange={e => setData('num_acte_naissance', e.target.value)} /><InputError message={errors.num_acte_naissance} /></div>
                        <div className="space-y-1.5"><Label>N° CNSS</Label><Input value={data.num_cnss} onChange={e => setData('num_cnss', e.target.value)} /><InputError message={errors.num_cnss} /></div>
                        <div className="space-y-1.5"><Label>Niveau d'étude</Label><Input value={data.niveau_etude} onChange={e => setData('niveau_etude', e.target.value)} /><InputError message={errors.niveau_etude} /></div>
                    </div>
                </div>

                {/* COORDONNÉES */}
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-secondary font-bold flex items-center gap-2 mb-6 border-b pb-2"><MapPin size={18} /> Coordonnées & Origine</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5"><Label>Téléphone *</Label><Input type="tel" value={data.telephone} onChange={e => setData('telephone', e.target.value)} required /><InputError message={errors.telephone} /></div>
                        <div className="space-y-1.5"><Label>Téléphone Wave</Label><Input type="tel" value={data.tel_compte_wave} onChange={e => setData('tel_compte_wave', e.target.value)} /><InputError message={errors.tel_compte_wave} /></div>
                        <div className="space-y-1.5">
                            <Label>Localité / Village *</Label>
                            <Select value={data.localite_domicile_id} onValueChange={v => setData('localite_domicile_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Choisir un village" /></SelectTrigger>
                                <SelectContent>{localites.map((loc: any) => <SelectItem key={loc.id} value={String(loc.id)}>{loc.nom_localite}</SelectItem>)}</SelectContent>
                            </Select>
                            <InputError message={errors.localite_domicile_id} />
                        </div>
                    </div>
                </div>

                {/* AFFECTATION SINTF */}
                <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                    <h2 className="text-primary font-bold flex items-center gap-2 mb-6 border-b pb-2"><Briefcase size={18} /> Profil SINTF & Paiement</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Site de Travail *</Label>
                                <Select value={data.site_travail_id} onValueChange={v => setData('site_travail_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Choisir un site" /></SelectTrigger>
                                    <SelectContent>{sites.map((s:any) => <SelectItem key={s.id} value={String(s.id)}>{s.nom_site}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={errors.site_travail_id} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Section par défaut *</Label>
                                <Select value={data.section_defaut_id} onValueChange={v => setData('section_defaut_id', v)}>
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
                            <div className="space-y-1.5"><Label>Classification (Grade)</Label><Input value={data.classification} onChange={e => setData('classification', e.target.value)} /><InputError message={errors.classification} /></div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Mode de Paiement Préféré *</Label>
                                <Select value={data.preference_paiement} onValueChange={v => setData('preference_paiement', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="ESPECES">Espèces (Caisse)</SelectItem><SelectItem value="WAVE">Mobile Money (Wave)</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                                <Checkbox id="marie" checked={data.est_marie} onCheckedChange={v => setData('est_marie', !!v)} />
                                <Label htmlFor="marie" className="cursor-pointer">L'employé est marié(e)</Label>
                            </div>
                            <div className="space-y-1.5"><Label>Nombre d'enfants à charge</Label><Input type="number" min="0" value={data.nb_charge} onChange={e => setData('nb_charge', e.target.value)} /><InputError message={errors.nb_charge} /></div>
                            
                            {/* Désactivation de l'agent */}
                            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mt-4">
                                <Checkbox id="actif" checked={data.actif} onCheckedChange={v => setData('actif', !!v)} />
                                <Label htmlFor="actif" className="cursor-pointer font-bold text-orange-800">Employé Actif (Décocher pour désactiver)</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" asChild><Link href={personnelIndex().url}>Annuler</Link></Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white min-w-[200px]">
                        {processing ? 'Mise à jour...' : "Enregistrer les modifications"}
                    </Button>
                </div>
            </form>
        </div>
    );
}