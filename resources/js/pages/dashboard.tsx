import { Head, Link } from '@inertiajs/react';
import {
    LayoutDashboard, Users, ClipboardList, Coins, Receipt,
    Building2, Wrench, Package, MapPin, Upload, Shield,
    Landmark, Settings, ArrowRightLeft, TrendingUp, Clock,
    AlertCircle, CheckCircle, ChevronRight, FileCheck, Wallet, FileSpreadsheet, Pencil, UserCog, Key, Layers, Calendar, Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
    userName: string;
    roles: string[];
    kpis: Record<string, number | string>;
    quickLinks: { label: string; url: string; icon?: string }[];
}

const iconMap: Record<string, any> = {
    LayoutDashboard, Users, ClipboardList, Coins, Receipt,
    Building2, Wrench, Package, MapPin, Upload, Shield,
    Landmark, Settings, ArrowRightLeft, FileCheck, Wallet, 
    FileSpreadsheet, Pencil, UserCog, Key, Layers, Calendar, Building
};

const formatKpiLabel = (key: string) => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const formatKpiValue = (value: number | string) => {
    if (typeof value === 'number') {
        return value > 1000 ? value.toLocaleString('fr-FR') + ' FCFA' : value.toLocaleString('fr-FR');
    }
    return String(value);
};

export default function Dashboard({ userName, roles, kpis, quickLinks }: Props) {
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex h-full flex-1 flex-col gap-6 p-6 bg-background">
            <Head title="Tableau de bord" />

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tight">Bonjour, {userName} 👋</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        {today} · Profil : <span className="text-secondary font-bold">{roles.join(', ')}</span>
                    </p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0 gap-1.5 px-3 py-1.5 shadow-sm">
                    <CheckCircle className="h-4 w-4" /> Session active
                </Badge>
            </div>

            <Separator className="bg-border" />

            {Object.keys(kpis).length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(kpis).map(([key, value]) => (
                        <Card key={key} className="overflow-hidden border-border shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                                <CardTitle className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                                    {formatKpiLabel(key)}
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-secondary" />
                            </CardHeader>
                            <CardContent className="pt-4 bg-white">
                                <div className="text-2xl font-black text-primary">{formatKpiValue(value)}</div>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <Clock size={12} className="text-secondary"/> Mis à jour en temps réel
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div>
                <h2 className="mb-4 text-xl font-bold text-primary flex items-center gap-2">
                    <LayoutDashboard size={20} className="text-secondary"/> Accès rapides
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {quickLinks.map((link) => {
                        const IconComponent = link.icon ? iconMap[link.icon] : null;
                        return (
                            <Link 
                                key={link.url} 
                                href={link.url} 
                                className="group flex items-center justify-between rounded-xl border border-border bg-white p-5 transition-all hover:border-secondary hover:shadow-md"
                            >
                                <div className="flex items-center gap-4">
                                    {IconComponent && (
                                        <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-secondary/10 group-hover:text-secondary transition-colors">
                                            <IconComponent className="h-6 w-6" />
                                        </div>
                                    )}
                                    <span className="font-bold text-gray-700 group-hover:text-gray-900">{link.label}</span>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                            </Link>
                        );
                    })}
                </div>
            </div>

            {quickLinks.length === 0 && (
                <Card className="border-dashed border-border shadow-none bg-muted/10">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-center font-medium text-muted-foreground">Aucun accès rapide disponible pour votre profil.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
    ],
};