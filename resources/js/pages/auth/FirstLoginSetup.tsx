import { useForm, Head, usePage } from '@inertiajs/react';
import { ShieldCheck, UserCircle, KeyRound, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { profileFirstLoginUpdate } from '@/routes';

export default function FirstLoginSetup() {
    const { user } = usePage<any>().props;
    
    const { data, setData, post, processing, errors } = useForm({
        username: user?.username || '', 
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(profileFirstLoginUpdate.url());
    };

    return (
        // 1. h-[100dvh] et overflow-hidden forcent la page à ne jamais scroller
        <div className="h-[100dvh] w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
            <Head title="Configuration Initiale" />

            <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-xl flex flex-col max-h-full">
                
                {/* En-tête compacté */}
                <div className="text-center space-y-2 mb-5">
                    <div className="inline-flex p-3 bg-primary/10 rounded-full text-primary">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-secondary uppercase tracking-wide">Sécurisez votre compte</h1>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-tight">
                            Bonjour <span className="text-primary font-bold">{user?.name}</span>. Première connexion.<br/>
                            Configurez vos identifiants pour continuer.
                        </p>
                    </div>
                </div>

                {/* Formulaire resserré (space-y-4 au lieu de 6) */}
                <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-center">
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <UserCircle size={14} className="text-primary" /> Identifiant de connexion *
                        </label>
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            className={`w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all font-bold ${errors.username ? 'border-destructive' : 'border-border bg-slate-50 focus:bg-white'}`}
                            placeholder="ex: mkabore"
                            required
                        />
                        {errors.username && <p className="text-[10px] text-destructive font-bold">{errors.username}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <KeyRound size={14} className="text-primary" /> Nouveau mot de passe *
                        </label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={`w-full p-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all ${errors.password ? 'border-destructive' : 'border-border bg-slate-50 focus:bg-white'}`}
                            required
                        />
                        {errors.password && <p className="text-[10px] text-destructive font-bold">{errors.password}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Confirmer le mot de passe *</label>
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            className="w-full p-2.5 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none bg-slate-50 focus:bg-white transition-all"
                            required
                        />
                    </div>

                    {/* Bouton ajusté (h-12 au lieu de h-14) avec un mt-auto si l'écran est un peu plus grand */}
                    <div className="pt-2 mt-auto">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-xl shadow-md transition-all active:scale-95 group"
                        >
                            {processing ? 'Enregistrement...' : (
                                <>Accéder à SINTF <ArrowRight className="ml-2 opacity-70 group-hover:opacity-100 transition-opacity" size={16} /></>
                            )}
                        </Button>
                    </div>
                </form>

            </div>
        </div>
    );
}