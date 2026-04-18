import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-sidebar-secondary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-10 fill-current text-white dark:text-white" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm text-green-900">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    SINTF
                </span>
            </div>
        </>
    );
}
