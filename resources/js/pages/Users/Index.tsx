import { useState, useMemo, useCallback } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { 
    Search, Shield, Building2, X, Check, UserCog, Trash2, Mail, Filter
} from 'lucide-react';
import { usersIndex, usersUpdate, usersDestroy, usersCreate } from '@/routes';
import SettingsLayout from '@/layouts/settings/layout';

interface Role { id: number; name: string; }
interface Site { id: number; nom_site: string; }
interface User {
    id: number; name: string; username: string; email: string;
    site_id: number | null; roles: Role[]; sites: Site[];
}

export default function Index() {
    const { users, allRoles, allSites } = usePage<{
        users: { data: User[] }; allRoles: Role[]; allSites: Site[];
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', username: '', roles: [] as number[], sites: [] as number[] });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);
    const [roleFilter, setRoleFilter] = useState('');
    const [siteFilter, setSiteFilter] = useState('');

    const filteredUsers = useMemo(() => {
        return users.data.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.username.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = !roleFilter || user.roles.some(r => r.name === roleFilter);
            const matchesSite = !siteFilter || user.sites.some(s => s.nom_site === siteFilter);
            return matchesSearch && matchesRole && matchesSite;
        });
    }, [users.data, searchTerm, roleFilter, siteFilter]);

    const openEditPanel = (user: User) => {
        setSelectedUser(user);
        setFormData({
            name: user.name, email: user.email, username: user.username,
            roles: user.roles.map(r => r.id), sites: user.sites.map(s => s.id),
        });
        setEditMode(true);
    };

    const closePanel = () => { setSelectedUser(null); setEditMode(false); };

    const handleSave = () => {
        if (!selectedUser) return;
        setSaving(true);
        
        router.put(usersUpdate.url({ user: selectedUser.id }), formData, {
            preserveScroll: true,
            onSuccess: () => closePanel(),
            onFinish: () => setSaving(false)
        });
    };

    const handleDelete = useCallback((id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
        setDeleting(id);
        router.delete(usersDestroy.url({ user: id }), {
            preserveScroll: true,
            onFinish: () => setDeleting(null)
        });
    }, []);

    return (
        <>
            <div className="p-6 h-full flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
                    <Link href={usersCreate.url()} className="bg-primary text-white font-bold px-4 py-2 rounded-lg">
                        Nouveau utilisateur
                    </Link>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Tous les rôles</option>
                        {allRoles.map(role => <option key={role.id} value={role.name}>{role.name}</option>)}
                    </select>
                    <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Tous les sites</option>
                        {allSites.map(site => <option key={site.id} value={site.nom_site}>{site.nom_site}</option>)}
                    </select>
                    {(roleFilter || siteFilter) && (
                        <button onClick={() => { setRoleFilter(''); setSiteFilter(''); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                            <Filter size={16} /> Effacer
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden flex-1">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border text-xs font-bold text-primary uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Utilisateur</th>
                                <th className="px-6 py-4 text-left">Contact</th>
                                <th className="px-6 py-4 text-left">Rôles</th>
                                <th className="px-6 py-4 text-left">Sites</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-accent/5 transition">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600"><div className="flex items-center gap-2"><Mail size={14}/>{user.email}</div></td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map(role => <span key={role.id} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-primary/10 text-primary uppercase"><Shield size={10} className="mr-1" />{role.name}</span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.sites.map(site => <span key={site.id} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold bg-secondary/10 text-secondary uppercase"><Building2 size={10} className="mr-1" />{site.nom_site}</span>)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openEditPanel(user)} className="p-2 text-primary hover:bg-primary/10 rounded-lg"><UserCog size={18} /></button>
                                        <button onClick={() => handleDelete(user.id)} disabled={deleting === user.id} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {editMode && selectedUser && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePanel} />
                        <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="flex items-center justify-between p-6 border-b bg-primary text-white">
                                <h2 className="text-lg font-bold">Modifier {selectedUser.name}</h2>
                                <button onClick={closePanel} className="p-1 hover:bg-white/20 rounded-md transition"><X size={20} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div><label className="block text-sm font-bold text-primary mb-1">Nom complet</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-secondary" /></div>
                                <div><label className="block text-sm font-bold text-primary mb-1">Username</label><input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-secondary" /></div>
                                <div><label className="block text-sm font-bold text-primary mb-1">Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-secondary" /></div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2"><Shield size={16} /> Rôles</label>
                                    <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                                        {allRoles.map(role => (
                                            <label key={role.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                                                <input type="checkbox" checked={formData.roles.includes(role.id)} onChange={(e) => setFormData({...formData, roles: e.target.checked ? [...formData.roles, role.id] : formData.roles.filter(id => id !== role.id)})} className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-3 flex items-center gap-2"><Building2 size={16} /> Sites autorisés</label>
                                    <div className="space-y-2 border rounded-lg p-3 bg-muted/30">
                                        {allSites.map(site => (
                                            <label key={site.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer">
                                                <input type="checkbox" checked={formData.sites.includes(site.id)} onChange={(e) => setFormData({...formData, sites: e.target.checked ? [...formData.sites, site.id] : formData.sites.filter(id => id !== site.id)})} className="w-4 h-4 text-secondary" />
                                                <span className="font-medium">{site.nom_site}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t flex gap-3 bg-gray-50">
                                <button onClick={closePanel} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100 font-medium text-gray-700">Annuler</button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary/90 flex items-center justify-center gap-2">
                                    {saving ? 'Enregistrement...' : <><Check size={18} /> Enregistrer</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}