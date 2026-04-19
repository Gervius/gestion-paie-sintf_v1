import { useForm, Head, Link } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus, Shield, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Heading from '@/components/heading';
import { usersStore, usersIndex } from '@/routes';

export default function Create({ roles, sites }: { roles: any[], sites: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        username: '', 
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
        site_ids: [] as string[], 
    });

    const handleRoleToggle = (roleName: string) => {
        if (data.roles.includes(roleName)) {
            setData('roles', data.roles.filter((r) => r !== roleName));
        } else {
            setData('roles', [...data.roles, roleName]);
        }
    };

    const handleSiteToggle = (siteId: string) => {
        if (data.site_ids.includes(siteId)) {
            setData('site_ids', data.site_ids.filter((id) => id !== siteId));
        } else {
            setData('site_ids', [...data.site_ids, siteId]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(usersStore.url());
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 bg-background">
            <Head title="Nouvel Utilisateur" />

            <Link href={usersIndex.url()} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={16} /> Retour à la liste des utilisateurs
            </Link>

            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
                <Heading title="Créer un compte d'accès" description="Ajouter un nouvel utilisateur et configurer ses habilitations" />
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Colonne de gauche : Identifiants */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                            <UserPlus size={16} /> Identifiants
                        </h3>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Nom complet *</label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.name ? 'border-destructive' : 'border-border'}`} required />
                            {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Identifiant (Username) *</label>
                            <input type="text" value={data.username} onChange={(e) => setData('username', e.target.value)} className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.username ? 'border-destructive' : 'border-border'}`} required />
                            {errors.username && <p className="text-xs text-destructive font-medium">{errors.username}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Adresse Email *</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.email ? 'border-destructive' : 'border-border'}`} required />
                            {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Mot de passe *</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.password ? 'border-destructive' : 'border-border'}`} required />
                            {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Confirmer le mot de passe *</label>
                            <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} className="w-full p-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" required />
                        </div>
                    </div>

                    {/* Colonne de droite : Rôles & Sites */}
                    <div className="space-y-8">
                        {/* Bloc Rôles */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                                <Shield size={16} /> Rôles
                            </h3>
                            {errors.roles && <p className="text-xs text-destructive font-medium">{errors.roles}</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                {roles.map((role) => (
                                    <label key={role.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${data.roles.includes(role.name) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                        <input type="checkbox" className="w-4 h-4 text-primary rounded" checked={data.roles.includes(role.name)} onChange={() => handleRoleToggle(role.name)} />
                                        <span className="font-bold text-gray-800 text-sm capitalize">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Bloc Sites ✅ */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-2 border-b pb-2">
                                <Building2 size={16} /> Sites Autorisés
                            </h3>
                            {errors.site_ids && <p className="text-xs text-destructive font-medium">{errors.site_ids}</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                                {sites.length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic">Aucun site disponible.</p>
                                ) : (
                                    sites.map((site) => (
                                        <label key={site.id} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${data.site_ids.includes(site.id.toString()) ? 'border-secondary bg-secondary/5' : 'border-border hover:border-secondary/50'}`}>
                                            <input type="checkbox" className="w-4 h-4 text-secondary rounded" checked={data.site_ids.includes(site.id.toString())} onChange={() => handleSiteToggle(site.id.toString())} />
                                            <span className="font-bold text-gray-800 text-sm">{site.nom_site}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-6 border-t border-border flex justify-end gap-4">
                    <Button variant="outline" asChild className="h-12 px-6">
                        <Link href={usersIndex.url()}>Annuler</Link>
                    </Button>
                    <Button type="submit" disabled={processing} className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 shadow-md transition-all">
                        <Save className="mr-2" size={20} /> Créer le profil
                    </Button>
                </div>
            </form>
        </div>
    );
}