import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import Heading from '@/components/heading';
import {
  Save,
  ArrowLeft,
  User,
  Phone,
  IdCard,
  MapPin,
  Briefcase,
  Info,
} from 'lucide-react';
import { personnelIndex, personnelUpdate } from '@/routes';
import { Badge } from '@/components/ui/badge';

export default function Edit({ personnel, sites, sections, localites }: any) {
  const generateGNumber = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = 'G';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const { data, setData, put, processing, errors } = useForm({
    nom: personnel.nom || '',
    prenom: personnel.prenom || '',
    surnom: personnel.surnom || '',
    sexe: personnel.sexe || 'M',
    date_naissance: personnel.date_naissance || '',
    lieu_naissance: personnel.lieu_naissance || '',
    num_acte_naissance: personnel.num_acte_naissance || '',
    num_cnib: personnel.num_cnib || '',
    sans_cnib: !!personnel.sans_cnib,
    date_cnib: personnel.date_cnib || '',
    lieu_cnib: personnel.lieu_cnib || '',
    num_cnss: personnel.num_cnss || '',
    date_cnss: personnel.date_cnss || '',
    telephone: personnel.telephone || '',
    a_telephone_propre:
      personnel.a_telephone_propre !== undefined
        ? !!personnel.a_telephone_propre
        : true,
    telephone_sc: personnel.telephone_sc || '',
    lien_telephone_sc: personnel.lien_telephone_sc || '',
    tel_compte_wave: personnel.tel_compte_wave || '',
    est_marie: !!personnel.est_marie,
    nb_charge: personnel.nb_charge ?? 0,
    niveau_etude: personnel.niveau_etude || '',
    classification: personnel.classification || '',
    localite_domicile_id: personnel.localite_domicile_id?.toString() || '',
    site_travail_id: personnel.site_travail_id?.toString() || '',
    section_defaut_id: personnel.section_defaut_id?.toString() || '',
    preference_paiement: personnel.preference_paiement || 'ESPECES',
    actif: !!personnel.actif,
  });

  const handleSansCnibToggle = (checked: boolean) => {
    setData((prev) => ({
      ...prev,
      sans_cnib: checked,
      num_cnib: checked
        ? prev.num_cnib.startsWith('G')
          ? prev.num_cnib
          : generateGNumber()
        : '',
    }));
  };

  const submit = (e: React.SubmitEvent) => {
    e.preventDefault();
    put(personnelUpdate.url(personnel.id));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Head title={`Modifier ${personnel.nom}`} />

      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-4">
          <Link
            href={personnelIndex().url}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <Heading
            title="Modifier l'Employé"
            description={`Matricule : ${personnel.matricule}`}
          />
        </div>
        <Badge
          variant="outline"
          className={data.actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
        >
          {data.actif ? 'Compte Actif' : 'Compte Désactivé'}
        </Badge>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* BLOC IDENTITÉ, CONTACT & INFOS COMPLÉMENTAIRES */}
        <div className="lg:col-span-7 space-y-6">
          {/* État civil & identité */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs border-b pb-3">
              <User size={16} /> État Civil & Identité
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Nom</Label>
                <Input
                  value={data.nom}
                  onChange={(e) => setData('nom', e.target.value.toUpperCase())}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.nom} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Prénom(s)</Label>
                <Input
                  value={data.prenom}
                  onChange={(e) => setData('prenom', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.prenom} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Sexe</Label>
                <Select value={data.sexe} onValueChange={(v) => setData('sexe', v)}>
                  <SelectTrigger className="h-11 rounded-xl border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={errors.sexe} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Surnom / Alias</Label>
                <Input
                  value={data.surnom}
                  onChange={(e) => setData('surnom', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.surnom} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label className="font-bold">Date de naissance</Label>
                <Input
                  type="date"
                  value={data.date_naissance}
                  onChange={(e) => setData('date_naissance', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.date_naissance} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Lieu de naissance</Label>
                <Input
                  value={data.lieu_naissance}
                  onChange={(e) => setData('lieu_naissance', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.lieu_naissance} />
              </div>
            </div>

            {/* Localité de domicile */}
            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1">
                <MapPin size={14} /> Localité de domicile *
              </Label>
              <Select
                value={data.localite_domicile_id}
                onValueChange={(v) => setData('localite_domicile_id', v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-2">
                  <SelectValue placeholder="Choisir la localité" />
                </SelectTrigger>
                <SelectContent>
                  {localites.map((loc: any) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.nom_localite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.localite_domicile_id} />
            </div>

            {/* CNIB intelligente */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-black text-xs uppercase flex items-center gap-2">
                  <IdCard size={14} /> Numéro de CNIB
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit_sans_cnib"
                    checked={data.sans_cnib}
                    onCheckedChange={(v) => handleSansCnibToggle(!!v)}
                  />
                  <Label
                    htmlFor="edit_sans_cnib"
                    className="text-xs font-bold text-orange-600 cursor-pointer"
                  >
                    Pas de CNIB
                  </Label>
                </div>
              </div>
              <Input
                value={data.num_cnib}
                onChange={(e) => setData('num_cnib', e.target.value)}
                disabled={data.sans_cnib}
                className={`h-12 text-lg font-black tracking-widest rounded-xl border-2 transition-all ${
                  data.sans_cnib
                    ? 'bg-slate-100 border-slate-200 text-slate-400'
                    : 'bg-white border-primary/30'
                }`}
              />
              <InputError message={errors.num_cnib} />
              {data.sans_cnib && (
                <p className="text-[10px] text-orange-500 font-bold italic flex items-center gap-1">
                  <Info size={10} /> Un numéro provisoire de type "G" a été généré.
                </p>
              )}
            </div>

            {/* Infos complémentaires CNIB & CNSS */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">N° Acte de naissance</Label>
                <Input
                  value={data.num_acte_naissance}
                  onChange={(e) => setData('num_acte_naissance', e.target.value)}
                  placeholder="Ex: AN-12345"
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.num_acte_naissance} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Date CNIB</Label>
                <Input
                  type="date"
                  value={data.date_cnib}
                  onChange={(e) => setData('date_cnib', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.date_cnib} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Lieu d'établissement CNIB</Label>
                <Input
                  value={data.lieu_cnib}
                  onChange={(e) => setData('lieu_cnib', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.lieu_cnib} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">N° CNSS</Label>
                <Input
                  value={data.num_cnss}
                  onChange={(e) => setData('num_cnss', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.num_cnss} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Date CNSS</Label>
                <Input
                  type="date"
                  value={data.date_cnss}
                  onChange={(e) => setData('date_cnss', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.date_cnss} />
              </div>
            </div>
          </div>

          {/* Contact intelligent */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 text-primary font-black uppercase text-xs">
                <Phone size={16} /> Contact
              </div>
              <Select
                value={data.a_telephone_propre ? 'PROPRE' : 'SC'}
                onValueChange={(v) => setData('a_telephone_propre', v === 'PROPRE')}
              >
                <SelectTrigger className="w-[180px] h-8 text-[10px] font-black uppercase">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PROPRE">Téléphone Personnel</SelectItem>
                  <SelectItem value="SC">Sous-couvert (S/C)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {data.a_telephone_propre ? (
              <div className="space-y-2 animate-in slide-in-from-left-2">
                <Label className="font-bold">Téléphone principal</Label>
                <Input
                  value={data.telephone}
                  onChange={(e) => setData('telephone', e.target.value)}
                  className="h-11 rounded-xl border-2 font-black text-lg"
                />
                <InputError message={errors.telephone} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-right-2">
                <div className="space-y-2">
                  <Label className="font-bold">N° Téléphone S/C</Label>
                  <Input
                    value={data.telephone_sc}
                    onChange={(e) => setData('telephone_sc', e.target.value)}
                    className="h-11 rounded-xl border-2 border-orange-200 font-black text-lg"
                  />
                  <InputError message={errors.telephone_sc} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Lien de parenté</Label>
                  <Input
                    value={data.lien_telephone_sc}
                    onChange={(e) => setData('lien_telephone_sc', e.target.value)}
                    className="h-11 rounded-xl border-2 border-orange-200"
                  />
                  <InputError message={errors.lien_telephone_sc} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-bold">Compte Wave (si disponible)</Label>
              <Input
                value={data.tel_compte_wave}
                onChange={(e) => setData('tel_compte_wave', e.target.value)}
                placeholder="Ex: 01 XX XX XX XX"
                className="rounded-xl h-11 border-2"
              />
              <InputError message={errors.tel_compte_wave} />
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs border-b pb-3">
              <User size={16} /> Informations Complémentaires
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Niveau d'étude</Label>
                <Input
                  value={data.niveau_etude}
                  onChange={(e) => setData('niveau_etude', e.target.value)}
                  placeholder="Ex: BAC, BEPC..."
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.niveau_etude} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Classification</Label>
                <Input
                  value={data.classification}
                  onChange={(e) => setData('classification', e.target.value)}
                  placeholder="Ex: Catégorie 1"
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.classification} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Nombre de charges</Label>
                <Input
                  type="number"
                  min="0"
                  value={data.nb_charge}
                  onChange={(e) => setData('nb_charge', e.target.value)}
                  className="rounded-xl h-11 border-2"
                />
                <InputError message={errors.nb_charge} />
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-xl border flex items-center gap-3 mt-4">
              <Checkbox
                id="est_marie"
                checked={data.est_marie}
                onCheckedChange={(v) => setData('est_marie', !!v)}
              />
              <Label htmlFor="est_marie" className="cursor-pointer font-bold text-sm">
                L'employé est marié(e)
              </Label>
              <InputError message={errors.est_marie} />
            </div>
          </div>
        </div>

        {/* BLOC AFFECTATION ET STATUT */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs border-b pb-3">
              <Briefcase size={16} /> Affectation Professionnelle
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1">
                <MapPin size={14} /> Site de travail
              </Label>
              <Select
                value={data.site_travail_id}
                onValueChange={(v) => setData('site_travail_id', v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.nom_site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.site_travail_id} />
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center gap-1">
                <MapPin size={14} /> Section par défaut
              </Label>
              <Select
                value={data.section_defaut_id}
                onValueChange={(v) => setData('section_defaut_id', v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-2">
                  <SelectValue placeholder="Choisir la section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec: any) => (
                    <SelectItem key={sec.id} value={sec.id.toString()}>
                      {sec.nom_section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputError message={errors.section_defaut_id} />
            </div>

            <div className="space-y-2 pt-4">
              <Label className="font-bold">Préférence de paiement</Label>
              <Select
                value={data.preference_paiement}
                onValueChange={(v) => setData('preference_paiement', v)}
              >
                <SelectTrigger className="h-11 rounded-xl border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESPECES">Espèces (Caisse)</SelectItem>
                  <SelectItem value="WAVE">Mobile Money (Wave)</SelectItem>
                </SelectContent>
              </Select>
              <InputError message={errors.preference_paiement} />
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <Checkbox
                id="edit_actif"
                checked={data.actif}
                onCheckedChange={(v) => setData('actif', !!v)}
              />
              <Label
                htmlFor="edit_actif"
                className="cursor-pointer font-bold text-orange-800 text-sm"
              >
                Agent Actif dans l'ERP
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            disabled={processing}
            className="w-full h-14 bg-primary text-white font-black uppercase rounded-2xl shadow-xl"
          >
            Mettre à jour la fiche
          </Button>
        </div>
      </form>
    </div>
  );
}