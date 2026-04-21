import { Link } from '@inertiajs/react';

export default function Pagination({ links }: { links: any[] }) {
    if (links.length <= 3) return null; // Pas besoin de pagination si 1 seule page

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-6">
            {links.map((link, index) => {
                const isActive = link.active;
                const isNull = link.url === null;

                if (isNull) {
                    return (
                        <div key={index} className="px-4 py-2 text-sm text-gray-400 border border-transparent rounded-lg" dangerouslySetInnerHTML={{ __html: link.label }} />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-4 py-2 text-sm font-bold border rounded-lg transition-colors ${
                            isActive 
                                ? 'bg-primary text-white border-primary shadow-md' 
                                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}