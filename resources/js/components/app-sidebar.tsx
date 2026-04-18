import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    ClipboardList,
    Calculator,
    Coins,
    Receipt,
    Building2,
    Wrench,
    Package,
    MapPin,
    Database,
    Shield,
    Landmark,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain, type NavGroup } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import * as routes from '@/routes';

const safeRoute = (name: string, fallback: string = '#') => {
    if (routes && typeof (routes as any)[name] === 'function') {
        return (routes as any)[name]();
    }
    return fallback;
};

export function AppSidebar() {
    const { auth } = usePage().props;
    const user = auth?.user;

    const can = (permission?: string) => {
        if (!permission) return true;
        if (!user || !user.permissions) return false;
        if (user.permissions.includes('*')) return true;
        return user.permissions.includes(permission);
    };

    if (!user) return null;

    // Structure optimisée par domaine métier
    const sections = [
        {
            label: 'Tableau de Bord',
            items: [
                { title: 'Vue d\'ensemble', href: safeRoute('dashboard', '/dashboard'), icon: LayoutDashboard },
            ],
        },
        {
            label: 'Ressources Humaines',
            items: [
                { title: 'Liste du personnel', href: safeRoute('personnelIndex', '/personnel'), icon: Users },
                { title: 'Nouveau recrutement', href: safeRoute('personnelCreate', '/personnel/create'), icon: UserPlus },
                { title: 'Importation de masse', href: safeRoute('personnelImportIndex', '/personnel/import'), icon: Database, permission: 'importer_personnel' },
            ],
        },
        {
            label: 'Opérations & Pointage',
            items: [
                { title: 'Suivi des Pointages', href: safeRoute('pointageIndex', '/pointages'), icon: ClipboardList },
                { title: 'Saisie Journalière', href: safeRoute('pointageCreate', '/pointages/create'), icon: Calculator },
            ],
        },
        {
            label: 'Finances & Paie',
            items: [
                { title: 'Avances sur Salaire', href: safeRoute('financeAvancesIndex', '/finance/avances'), icon: Coins, permission: 'voir_ticket_valide' },
                { title: 'États de Paiement', href: safeRoute('financeEtatsIndex', '/finance/etats'), icon: Receipt, permission: 'voir_ticket_valide' },
            ],
        },
        {
            label: 'Données de Base',
            permission: 'gerer_referentiels',
            items: [
                { title: 'Sites SINTF', href: safeRoute('referentielsSitesIndex', '/referentiels/sites'), icon: Building2 },
                { title: 'Sections', href: safeRoute('referentielsSectionsIndex', '/referentiels/sections'), icon: Wrench },
                { title: 'Produits', href: safeRoute('referentielsProduitsIndex', '/referentiels/produits'), icon: Package },
                { title: 'Localités / Villages', href: safeRoute('referentielsLocalitesIndex', '/referentiels/localites'), icon: MapPin },
            ],
        },
        {
            label: 'Administration',
            permission: 'gerer_utilisateurs',
            items: [
                { title: 'Utilisateurs', href: safeRoute('usersIndex', '/users'), icon: Shield },
                { title: 'Rôles & Accès', href: safeRoute('rolesIndex', '/roles'), icon: Shield },
                { title: 'Paramètres Société', href: safeRoute('societeEdit', '/societe/edit'), icon: Landmark, permission: 'gerer_referentiels' },
            ],
        },
    ];

    const filteredSections = sections
        .map(section => ({
            ...section,
            items: section.items.filter(item => can((item as any).permission)),
        }))
        .filter(section => section.items.length > 0 && can((section as any).permission));

    const groups: NavGroup[] = filteredSections.map(section => ({
        label: section.label,
        items: section.items as NavItem[],
    }));

    const footerItems: NavItem[] = [
        { title: 'Mon Profil', href: safeRoute('profile.edit', '/settings/profile'), icon: Settings },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-sidebar border-r border-sidebar-border">
            <SidebarHeader className="bg-primary/5 pb-4 pt-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="hover:bg-primary/10 transition-colors" asChild>
                            <Link href={safeRoute('dashboard', '/dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-sidebar">
                <NavMain groups={groups} />
            </SidebarContent>

            <SidebarFooter className="bg-sidebar">
                <NavFooter items={footerItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}