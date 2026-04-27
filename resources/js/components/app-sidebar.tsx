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
    Wallet,
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
        if (!user) return false;
        
        // La règle d'or universelle (Permissions ET Rôle)
        const isSuperAdmin = user.permissions?.includes('*') || user.roles?.includes('Super Admin');
        if (isSuperAdmin) return true;

        return user.permissions?.includes(permission);
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
                { 
                    title: 'Liste du personnel', 
                    href: safeRoute('personnelIndex', '/personnel'), 
                    icon: Users, 
                    permission: 'personnels.lire'   // au lieu de 'gerer_utilisateurs'
                },
                { 
                    title: 'Nouveau recrutement', 
                    href: safeRoute('personnelCreate', '/personnel/create'), 
                    icon: UserPlus, 
                    permission: 'personnels.creer'  // au lieu de 'gerer_utilisateurs'
                },
            ],
        },
        {
            label: 'Opérations & Pointage',
            items: [
                { title: 'Suivi des Pointages', href: safeRoute('pointageIndex', '/pointages'), icon: ClipboardList, permission: 'pointages.lire' },
                { title: 'Saisie Journalière', href: safeRoute('pointageCreate', '/pointages/create'), icon: Calculator, permission: 'pointages.creer' },
            ],
        },
        {
            label: 'Finances & Paie',
            items: [
                { 
                    title: 'Avances sur Salaire', 
                    href: safeRoute('financeAvancesIndex', '/finance/avances'), 
                    icon: Coins, 
                    permission: 'avances.lire'     
                },
                { 
                    title: 'États de Paiement', 
                    href: safeRoute('financeEtatsIndex', '/finance/etats'), 
                    icon: Receipt, 
                    permission: 'etats.lire'       
                },
            ],
        },
        {
            label: 'Données de Base',
            permission: undefined,  // on gère l'affichage via les items
            items: [
                { title: 'Sites SINTF', href: safeRoute('referentielsSitesIndex', '/referentiels/sites'), icon: Building2, permission: 'sites.lire' },
                { title: 'Sections', href: safeRoute('referentielsSectionsIndex', '/referentiels/sections'), icon: Wrench, permission: 'sections.lire' },
                { title: 'Produits', href: safeRoute('referentielsProduitsIndex', '/referentiels/produits'), icon: Package, permission: 'produits.lire' },
                { title: 'Localités / Villages', href: safeRoute('referentielsLocalitesIndex', '/referentiels/localites'), icon: MapPin, permission: 'localites.lire' },
            ],
        },
        {
            label: 'Administration',
            items: [
                { 
                    title: 'Utilisateurs', 
                    href: safeRoute('usersIndex', '/users'), 
                    icon: Shield, 
                    permission: 'utilisateurs.lire' 
                },
                { 
                    title: 'Rôles & Accès', 
                    href: safeRoute('rolesIndex', '/roles'), 
                    icon: Shield, 
                    permission: 'roles.lire' 
                },
                { 
                    title: 'Paramètres Société', 
                    href: safeRoute('societeEdit', '/societe/edit'), 
                    icon: Landmark, 
                    permission: 'societe.modifier'   // car le contrôleur utilise authorize('update', Societe) -> societe.modifier
                },
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