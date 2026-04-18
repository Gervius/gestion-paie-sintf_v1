import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { usersIndex } from '@/routes';
import { rolesIndex } from '@/routes';
import { permissionsIndex } from '@/routes';
import { societeEdit } from '@/routes';
import type { NavItem } from '@/types';
import { Users, Shield, Key, Building2 } from 'lucide-react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props;
    const user = auth.user;
    const { isCurrentOrParentUrl } = useCurrentUrl();

    const can = (permission: string) => user?.can?.(permission) || user?.can?.('*');

    // Construction dynamique de la navigation
    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: editProfile(),
            icon: null,
        },
        {
            title: 'Security',
            href: editSecurity(),
            icon: null,
        },
        {
            title: 'Appearance',
            href: editAppearance(),
            icon: null,
        },
    ];

    // Modules d'administration (conditionnels)
    if (can('gerer_utilisateurs')) {
        sidebarNavItems.push({
            title: 'Users',
            href: usersIndex.url(),
            icon: Users,
        });
        sidebarNavItems.push({
            title: 'Roles',
            href: rolesIndex.url(),
            icon: Shield,
        });
        sidebarNavItems.push({
            title: 'Permissions',
            href: permissionsIndex.url(),
            icon: Key,
        });
    }

    if (can('gerer_referentiels')) {
        sidebarNavItems.push({
            title: 'Company',
            href: societeEdit.url(),
            icon: Building2,
        });
    }

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile, account settings and application preferences"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-56">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.icon && (
                                        <item.icon className="mr-2 h-4 w-4" />
                                    )}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}