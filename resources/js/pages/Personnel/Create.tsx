import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import { Save, X, User, Phone, IdCard, MapPin, Briefcase, Info, Search } from 'lucide-react';
import { personnelIndex, personnelStore } from '@/routes';

export default function Create({ localites, sites, sections }: any) {
    const { data, setData, post, processing, errors } = useForm({
        nom: '', 
        prenom: '', 
        surnom: '', 
        sexe: 'F', 
        date_naissance: '', 
        lieu_naissance: '',
        num_cnib: '', 
        sans_cnib: false, 
        telephone: '', 
        a_telephone_propre: true, 
        telephone_sc: '', 
        lien_telephone_sc: '', 
        localite_domicile_id: '', 
        site_travail_id: '',
        section_defaut_id: '', 
        preference_paiement: 'WAVE', 
        est_marie: false
    });

    // --- ÉTATS POUR LA COMBOBOX DE RECHERCHE DE LOCALITÉ ---
    const [localiteSearch, setLocaliteSearch] = useState('');
    const [isLocOpen, setIsLocOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsLocOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filtrage instantané ultra-léger
    const filteredLocalites = localites.filter((loc: any) =>
        loc.nom_localite.toLowerCase().includes(localiteSearch.toLowerCase())
    );

    // --- LOGIQUE DE GÉNÉRATION DU NUMÉRO "G" ---
    const generateGNumber = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = 'G';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    // --- GESTION CNIB ---
    const handleSansCnibToggle = (checked: boolean) => {
        setData(prev => ({
            ...prev,
            sans_cnib: checked,
            num_cnib: checked ? generateGNumber() : ''
        }));
    };

    const submit = (e: React.SubmitEvent) => {
        e.preventDefault();
        post(personnelStore.url());
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
            <Head title="Nouvel Employé" />
            
            <div className="flex justify-between items-center border-b pb-4">
                <Heading title="Enrôlement Personnel" description="Création d'une nouvelle fiche agent" />
                <Button variant="outline" asChild className="rounded-xl">
                    <Link href={personnelIndex().url}><X className="mr-2 h-4 w-4" /> Annuler</Link>
                </Button>
            </div>

            <form onSubmit={submit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* SECTION GAUCHE : IDENTITÉ */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs border-b pb-3">
                                <User size={16}/> Informations d'Identité
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Nom *</Label>
                                    <Input value={data.nom} onChange={e => setData('nom', e.target.value.toUpperCase())} placeholder="Ex: SAWADOGO" className="rounded-xl h-11 border-2 focus:border-primary" />
                                    <InputError message={errors.nom} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Prénom(s) *</Label>
                                    <Input value={data.prenom} onChange={e => setData('prenom', e.target.value)} placeholder="Ex: Adama" className="rounded-xl h-11 border-2 focus:border-primary" />
                                    <InputError message={errors.prenom} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold">Sexe *</Label>
                                    <Select value={data.sexe} onValueChange={v => setData('sexe', v)}>
                                        <SelectTrigger className="h-11 rounded-xl border-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">Masculin</SelectItem>
                                            <SelectItem value="F">Féminin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Surnom / Alias</Label>
                                    <Input value={data.surnom} onChange={e => setData('surnom', e.target.value)} className="rounded-xl h-11 border-2" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="font-bold">Date de naissance</Label>
                                    <Input type="date" value={data.date_naissance} onChange={e => setData('date_naissance', e.target.value)} className="rounded-xl h-11 border-2" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Lieu de naissance</Label>
                                    <Input value={data.lieu_naissance} onChange={e => setData('lieu_naissance', e.target.value)} className="rounded-xl h-11 border-2" />
                                </div>
                            </div>

                            {/* NOUVEAU BLOC : LOCALITÉ DE DOMICILE AVEC RECHERCHE INTÉGRÉE */}
                            <div className="space-y-2" ref={wrapperRef}>
                                <Label className="font-bold flex items-center gap-1"><MapPin size={14}/> Localité de domicile *</Label>
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <Input
                                            type="text"
                                            placeholder="Taper pour filtrer les localités..."
                                            value={localiteSearch}
                                            onChange={(e) => {
                                                setLocaliteSearch(e.target.value);
                                                setIsLocOpen(true);
                                                setData('localite_domicile_id', ''); // On reset l'ID si l'utilisateur modifie le texte
                                            }}
                                            onFocus={() => setIsLocOpen(true)}
                                            className={`h-11 pl-9 rounded-xl border-2 transition-all font-bold ${data.localite_domicile_id ? 'border-green-500 bg-green-50 text-green-800' : 'focus:border-primary'}`}
                                        />
                                    </div>
                                    
                                    {isLocOpen && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-100 rounded-xl shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
                                            {filteredLocalites.length > 0 ? (
                                                filteredLocalites.map((loc: any) => (
                                                    <div
                                                        key={loc.id}
                                                        className="px-4 py-3 hover:bg-secondary/10 cursor-pointer text-sm font-bold text-slate-700 transition-colors border-b border-slate-50 last:border-0"
                                                        onClick={() => {
                                                            setData('localite_domicile_id', loc.id.toString());
                                                            setLocaliteSearch(loc.nom_localite);
                                                            setIsLocOpen(false);
                                                        }}
                                                    >
                                                        {loc.nom_localite}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-6 text-center text-sm font-bold text-slate-400 flex flex-col items-center gap-2">
                                                    <MapPin size={24} className="opacity-50" />
                                                    Localité introuvable
                                                    <span className="text-[10px] text-orange-500 uppercase bg-orange-50 px-2 py-1 rounded-md">Pour créer cette localité, ajoutez-la d'abord dans les Référentiels.</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <InputError message={errors.localite_domicile_id} />
                            </div>

                            {/* BLOC CNIB INTELLIGENT */}
                            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-black text-xs uppercase flex items-center gap-2">
                                        <IdCard size={14}/> Numéro de CNIB
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="sans_cnib" 
                                            checked={data.sans_cnib} 
                                            onCheckedChange={(v) => handleSansCnibToggle(!!v)} 
                                        />
                                        <Label htmlFor="sans_cnib" className="text-xs font-bold text-orange-600 cursor-pointer">L'agent n'a pas de CNIB</Label>
                                    </div>
                                </div>
                                <Input 
                                    value={data.num_cnib} 
                                    onChange={e => setData('num_cnib', e.target.value)}
                                    disabled={data.sans_cnib}
                                    placeholder="Ex: B1234567"
                                    className={`h-12 text-lg font-black tracking-widest rounded-xl border-2 transition-all ${data.sans_cnib ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white border-primary/30'}`}
                                />
                                {data.sans_cnib && (
                                    <p className="text-[10px] text-orange-500 font-bold italic flex items-center gap-1">
                                        <Info size={10}/> Un numéro provisoire de type "G" a été généré pour l'unicité.
                                    </p>
                                )}
                                <InputError message={errors.num_cnib} />
                            </div>
                        </div>

                        {/* BLOC TÉLÉPHONE INTELLIGENT */}
                        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b pb-3">
                                <div className="flex items-center gap-2 text-primary font-black uppercase text-xs">
                                    <Phone size={16}/> Contact Téléphonique
                                </div>
                                <Select 
                                    value={data.a_telephone_propre ? 'PROPRE' : 'SC'} 
                                    onValueChange={v => setData('a_telephone_propre', v === 'PROPRE')}
                                >
                                    <SelectTrigger className="w-[200px] h-8 text-[10px] font-black uppercase border-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PROPRE">Téléphone de l'agent</SelectItem>
                                        <SelectItem value="SC">Sous-couvert (S/C)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.a_telephone_propre ? (
                                <div className="space-y-2 animate-in slide-in-from-left-2">
                                    <Label className="font-bold">N° de téléphone principal *</Label>
                                    <Input 
                                        value={data.telephone} 
                                        onChange={e => setData('telephone', e.target.value)} 
                                        placeholder="70 00 00 00" 
                                        className="h-11 rounded-xl border-2 font-black text-lg" 
                                    />
                                    <InputError message={errors.telephone} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-2">
                                    <div className="space-y-2">
                                        <Label className="font-bold">N° Téléphone S/C *</Label>
                                        <Input 
                                            value={data.telephone_sc} 
                                            onChange={e => setData('telephone_sc', e.target.value)} 
                                            placeholder="70 00 00 00" 
                                            className="h-11 rounded-xl border-2 border-orange-200 font-black text-lg" 
                                        />
                                        <InputError message={errors.telephone_sc} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Lien avec l'agent *</Label>
                                        <Input 
                                            value={data.lien_telephone_sc} 
                                            onChange={e => setData('lien_telephone_sc', e.target.value)} 
                                            placeholder="Ex: Grand frère, Voisin..." 
                                            className="h-11 rounded-xl border-2 border-orange-200" 
                                        />
                                        <InputError message={errors.lien_telephone_sc} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION DROITE : AFFECTATION ET PAIE */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs border-b pb-3">
                                <Briefcase size={16}/> Affectation & Paie
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold flex items-center gap-1"><MapPin size={14}/> Site de travail *</Label>
                                <Select value={data.site_travail_id} onValueChange={v => setData('site_travail_id', v)}>
                                    <SelectTrigger className="h-11 rounded-xl border-2"><SelectValue placeholder="Choisir le site" /></SelectTrigger>
                                    <SelectContent>
                                        {sites.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.nom_site}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold">Section par défaut</Label>
                                <Select value={data.section_defaut_id} onValueChange={v => setData('section_defaut_id', v)}>
                                    <SelectTrigger className="h-11 rounded-xl border-2"><SelectValue placeholder="Choisir la section" /></SelectTrigger>
                                    <SelectContent>
                                        {sections.map((sec: any) => <SelectItem key={sec.id} value={sec.id.toString()}>{sec.nom_section}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label className="font-bold">Préférence de paiement *</Label>
                                <Select value={data.preference_paiement} onValueChange={v => setData('preference_paiement', v)}>
                                    <SelectTrigger className="h-11 rounded-xl border-2"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ESPECES">Espèces (Caisse)</SelectItem>
                                        <SelectItem value="WAVE">Mobile Money (Wave)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-xl border flex items-center gap-3 mt-4">
                                <Checkbox id="marie" checked={data.est_marie} onCheckedChange={v => setData('est_marie', !!v)} />
                                <Label htmlFor="marie" className="cursor-pointer font-bold text-sm">L'employé est marié(e)</Label>
                            </div>
                        </div>

                        <div className="p-6 bg-primary/5 rounded-2xl border-2 border-primary/10 space-y-4">
                            <h4 className="font-black text-xs uppercase text-primary">Récapitulatif Rapide</h4>
                            <div className="text-[11px] space-y-2 text-slate-600 font-bold">
                                <p>• Identité : {data.nom || '...'} {data.prenom || '...'}</p>
                                <p>• CNIB : {data.num_cnib || '...'}</p>
                                <p>• Contact : {data.a_telephone_propre ? data.telephone : data.telephone_sc + ' (S/C)' || '...'}</p>
                            </div>
                        </div>

                        <Button type="submit" disabled={processing} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase text-base rounded-2xl shadow-xl shadow-primary/20">
                            <Save className="mr-2 h-5 w-5" /> Enregistrer l'Employé
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}