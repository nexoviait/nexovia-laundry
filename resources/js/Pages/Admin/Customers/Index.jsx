import { Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

export default function Index({ users, filters, summary }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [role, setRole] = useState(filters?.role || 'all');
    const [activeDropdownUserId, setActiveDropdownUserId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        language: 'en',
        branch: '',
        password: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        role: 'customer',
        language: 'en',
        branch: '',
        password: '',
    });

    function handleSearchSubmit(e) {
        e.preventDefault();
        router.get('/admin/customers', { search, role }, { preserveState: true });
    }

    function handleRoleChange(newRole) {
        setRole(newRole);
        router.get('/admin/customers', { search, role: newRole }, { preserveState: true });
    }

    function submitCreate(e) {
        e.preventDefault();
        createForm.post('/admin/customers', {
            onSuccess: () => {
                createForm.reset();
                setShowCreateModal(false);
            }
        });
    }

    function openEdit(user) {
        setSelectedUser(user);
        editForm.setData({
            name: user.name,
            email: user.email || '',
            phone: user.phone || '',
            role: user.role,
            language: user.language || 'en',
            branch: user.branch || '',
            password: '',
        });
        setShowEditModal(true);
        setActiveDropdownUserId(null);
    }

    function submitEdit(e) {
        e.preventDefault();
        editForm.put(`/admin/customers/${selectedUser.id}`, {
            onSuccess: () => {
                editForm.reset();
                setShowEditModal(false);
                setSelectedUser(null);
            }
        });
    }

    function handleDelete(user) {
        if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
            router.delete(`/admin/customers/${user.id}`, { preserveScroll: true });
            setActiveDropdownUserId(null);
        }
    }

    const userList = Array.isArray(users) ? users : (users.data || []);

    // Helper for initials
    function getInitials(name) {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
            : 'US';
    }

    // Role colors mapping
    const ROLE_THEMES = {
        super_admin: 'bg-rose-50 text-rose-700 border-rose-100',
        admin: 'bg-orange-50 text-orange-700 border-orange-100',
        shop: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        driver: 'bg-sky-50 text-sky-700 border-sky-100',
        customer: 'bg-slate-100 text-slate-600 border-slate-200',
        business_client: 'bg-amber-50 text-amber-700 border-amber-100',
    };

    // Helper for last active label
    function getLastActive(user) {
        if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'shop') {
            return 'Just now';
        }
        if (user.role === 'driver') {
            return '2 mins ago';
        }
        return '3 days ago';
    }

    const activeRoleFilter = filters?.role || 'all';

    const pageMeta = {
        customer: {
            title: 'Customer Management',
            subtitle: 'View registered customer profiles, track booking activity, and manage contact details.',
            buttonText: 'Add New Customer',
            modalTitle: 'Create New Customer',
            defaultRole: 'customer',
        },
        driver: {
            title: 'Driver Fleet & Logistics',
            subtitle: 'Manage driver accounts, vehicle assignments, active routes, and duty statuses.',
            buttonText: 'Add New Driver',
            modalTitle: 'Create New Driver',
            defaultRole: 'driver',
        },
        all: {
            title: 'User Management',
            subtitle: 'Control access levels, branch assignments, and user statuses across the platform.',
            buttonText: 'Add New User',
            modalTitle: 'Create New User Profile',
            defaultRole: 'customer',
        }
    }[activeRoleFilter] || {
        title: 'User Management',
        subtitle: 'Control access levels, branch assignments, and user statuses across the platform.',
        buttonText: 'Add New User',
        modalTitle: 'Create New User Profile',
        defaultRole: 'customer',
    };

    return (
        <div className="space-y-8 animate-fade-in">
            
            {/* Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{pageMeta.title}</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        {pageMeta.subtitle}
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={() => {
                        createForm.setData('role', pageMeta.defaultRole);
                        setShowCreateModal(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-200 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                    <span>👤+</span>
                    <span>{pageMeta.buttonText}</span>
                </button>
            </div>

            {/* Top 4 Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Total Users */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Users</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900">{summary.total_users}</span>
                        <span className="text-xs font-bold text-emerald-600">▲ 12%</span>
                    </div>
                </div>

                {/* Active Drivers */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Drivers</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900">{summary.active_drivers}</span>
                        <span className="text-xs font-bold text-orange-600">8 On duty</span>
                    </div>
                </div>

                {/* Customer Growth */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Customer Growth</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900">{summary.customer_count}</span>
                        <span className="text-xs font-bold text-emerald-600">▲ +24</span>
                    </div>
                </div>

                {/* Service Staff */}
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Service Staff</span>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900">{summary.staff_count}</span>
                        <span className="text-xs font-bold text-slate-500">3 Branches</span>
                    </div>
                </div>
            </div>

            {/* Filter controls row */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                
                {/* Search Form */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, email, or user ID..."
                        className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                </form>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <select
                        value={role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="bg-white border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-all"
                    >
                        <option value="all">All Roles</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin</option>
                        <option value="shop">Shop Staff</option>
                        <option value="driver">Driver</option>
                        <option value="customer">Customer</option>
                        <option value="business_client">Business Client</option>
                    </select>

                    {/* Branch select stub */}
                    <select
                        className="bg-white border border-slate-200 focus:border-orange-500 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition-all"
                    >
                        <option value="all">All Branches</option>
                        <option value="downtown">Downtown Central</option>
                        <option value="westside">Westside Hub</option>
                        <option value="eastside">Eastside Depot</option>
                    </select>

                    {/* More Filters button */}
                    <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors"
                    >
                        <span>⚙️</span>
                        <span>More Filters</span>
                    </button>
                </div>
            </div>

            {/* Users list table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-500">
                        <thead className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="py-4 px-6">User</th>
                                <th className="py-4 px-6 text-center">Role</th>
                                <th className="py-4 px-6">Branch</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6">Last Active</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {userList.map((u) => {
                                const roleTheme = ROLE_THEMES[u.role] || ROLE_THEMES.customer;
                                const initials = getInitials(u.name);
                                const lastActive = getLastActive(u);

                                // Colors for initials circle
                                const avatarColor = u.role === 'super_admin'
                                    ? 'bg-rose-100 text-rose-700'
                                    : u.role === 'admin' 
                                    ? 'bg-orange-100 text-orange-700' 
                                    : u.role === 'shop'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : u.role === 'driver'
                                    ? 'bg-sky-100 text-sky-700'
                                    : u.role === 'business_client'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-slate-100 text-slate-700';

                                return (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        
                                        {/* USER Details */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`h-9 w-9 rounded-full ${avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}>
                                                    {initials}
                                                </span>
                                                <div>
                                                    <Link 
                                                        href={['customer', 'business_client'].includes(u.role) ? `/admin/customers/${u.id}` : '#'} 
                                                        className="font-bold text-slate-950 hover:text-orange-600 transition-colors"
                                                    >
                                                        {u.name}
                                                    </Link>
                                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{u.email || u.phone}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ROLE */}
                                        <td className="py-4 px-6 text-center">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold border capitalize ${roleTheme}`}>
                                                {u.role}
                                            </span>
                                        </td>

                                        {/* BRANCH */}
                                        <td className="py-4 px-6 text-slate-800">
                                            {u.branch || '—'}
                                        </td>

                                        {/* STATUS */}
                                        <td className="py-4 px-6 text-center">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                <span>Active</span>
                                            </span>
                                        </td>

                                        {/* LAST ACTIVE */}
                                        <td className="py-4 px-6 text-slate-500 font-medium">
                                            {lastActive}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2.5 relative">
                                                <button 
                                                    type="button" 
                                                    onClick={() => openEdit(u)}
                                                    className="h-7 w-7 rounded-lg border border-slate-200 hover:border-orange-200 text-slate-400 hover:text-orange-600 bg-white flex items-center justify-center transition-colors"
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(u)}
                                                    className="h-7 w-7 rounded-lg border border-red-200 hover:border-red-400 text-red-400 hover:text-red-600 bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                                                    title="Delete User"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                        <path d="M10 11v6M14 11v6" />
                                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {userList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-slate-400 font-bold">
                                        No users registered under this role or search filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table pagination footer */}
                {users.links && users.links.length > 3 && (
                    <div className="bg-slate-50/75 border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Showing 1 to {userList.length} of {users.total} users</span>
                        
                        <div className="flex items-center gap-1">
                            {users.links.map((link, idx) => {
                                const active = link.active;
                                return (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-lg border transition-all ${
                                            active 
                                                ? 'bg-orange-600 border-orange-600 text-white font-extrabold'
                                                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 md:p-8 animate-slide-up relative">
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-4 right-4 h-8 w-8 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">{pageMeta.modalTitle}</h3>
                        <p className="text-slate-500 text-xs font-semibold mb-6">Create a new credentials profile to grant access to the laundry system.</p>
                        
                        <form onSubmit={submitCreate} noValidate className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={createForm.data.name}
                                        onChange={e => createForm.setData('name', e.target.value)}
                                        placeholder="e.g. Alice Smith"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {createForm.errors.name && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <input 
                                        type="text"
                                        required
                                        value={createForm.data.phone}
                                        onChange={e => createForm.setData('phone', e.target.value)}
                                        placeholder="e.g. +447700900000"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {createForm.errors.phone && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.phone}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input 
                                        type="email"
                                        required
                                        value={createForm.data.email}
                                        onChange={e => createForm.setData('email', e.target.value)}
                                        placeholder="e.g. alice@cleanquicklaundry.com"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {createForm.errors.email && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Default Language</label>
                                    <select 
                                        value={createForm.data.language}
                                        onChange={e => createForm.setData('language', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-750 focus:outline-none"
                                    >
                                        <option value="en">English (en)</option>
                                        <option value="es">Español (es)</option>
                                    </select>
                                    {createForm.errors.language && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.language}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Access Role</label>
                                    <select 
                                        value={createForm.data.role}
                                        onChange={e => {
                                            const r = e.target.value;
                                            createForm.setData(d => ({
                                                ...d,
                                                role: r,
                                                branch: ['driver', 'shop'].includes(r) ? d.branch : ''
                                            }));
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-750 focus:outline-none"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="business_client">Business Client</option>
                                        <option value="driver">Driver</option>
                                        <option value="shop">Shop Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                    {createForm.errors.role && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.role}</p>}
                                </div>
                                {['driver', 'shop'].includes(createForm.data.role) && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Branch</label>
                                        <select 
                                            value={createForm.data.branch}
                                            onChange={e => createForm.setData('branch', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-750 focus:outline-none"
                                        >
                                            <option value="">None (—)</option>
                                            <option value="Downtown Central">Downtown Central</option>
                                            <option value="Westside Hub">Westside Hub</option>
                                            <option value="Eastside Depot">Eastside Depot</option>
                                        </select>
                                        {createForm.errors.branch && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.branch}</p>}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Password</label>
                                    <input 
                                        type="password"
                                        required
                                        value={createForm.data.password}
                                        onChange={e => createForm.setData('password', e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {createForm.errors.password && <p className="text-[10px] text-red-600 font-semibold">{createForm.errors.password}</p>}
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2.5 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setShowCreateModal(false)}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={createForm.processing}
                                    className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-orange-200 transition-all"
                                >
                                    {createForm.processing ? 'Saving...' : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 md:p-8 animate-slide-up relative">
                        <button 
                            onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                            className="absolute top-4 right-4 h-8 w-8 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">Edit User Profile</h3>
                        <p className="text-slate-500 text-xs font-semibold mb-6">Modify account settings and access roles for "{selectedUser?.name}".</p>
                        
                        <form onSubmit={submitEdit} noValidate className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text"
                                        required
                                        value={editForm.data.name}
                                        onChange={e => editForm.setData('name', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {editForm.errors.name && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <input 
                                        type="text"
                                        required
                                        value={editForm.data.phone}
                                        onChange={e => editForm.setData('phone', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {editForm.errors.phone && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.phone}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input 
                                        type="email"
                                        required
                                        value={editForm.data.email}
                                        onChange={e => editForm.setData('email', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {editForm.errors.email && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.email}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Default Language</label>
                                    <select 
                                        value={editForm.data.language}
                                        onChange={e => editForm.setData('language', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-750 focus:outline-none"
                                    >
                                        <option value="en">English (en)</option>
                                        <option value="es">Español (es)</option>
                                    </select>
                                    {editForm.errors.language && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.language}</p>}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Access Role</label>
                                    <select 
                                        value={editForm.data.role}
                                        onChange={e => {
                                            const r = e.target.value;
                                            editForm.setData(d => ({
                                                ...d,
                                                role: r,
                                                branch: ['driver', 'shop'].includes(r) ? d.branch : ''
                                            }));
                                        }}
                                        disabled={['admin', 'super_admin'].includes(selectedUser?.role)}
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-750 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="business_client">Business Client</option>
                                        <option value="driver">Driver</option>
                                        <option value="shop">Shop Staff</option>
                                        <option value="admin">Admin</option>
                                        <option value="super_admin">Super Admin</option>
                                    </select>
                                    {editForm.errors.role && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.role}</p>}
                                </div>
                                {['driver', 'shop'].includes(editForm.data.role) && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Branch</label>
                                        <select 
                                            value={editForm.data.branch}
                                            onChange={e => editForm.setData('branch', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-750 focus:outline-none"
                                        >
                                            <option value="">None (—)</option>
                                            <option value="Downtown Central">Downtown Central</option>
                                            <option value="Westside Hub">Westside Hub</option>
                                            <option value="Eastside Depot">Eastside Depot</option>
                                        </select>
                                        {editForm.errors.branch && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.branch}</p>}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Password (Optional)</label>
                                    <input 
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={e => editForm.setData('password', e.target.value)}
                                        placeholder="Leave blank to keep current"
                                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-500 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none"
                                    />
                                    {editForm.errors.password && <p className="text-[10px] text-red-600 font-semibold">{editForm.errors.password}</p>}
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2.5 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                                    className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={editForm.processing}
                                    className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-orange-200 transition-all"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Standard Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-[10px] font-bold text-slate-400 pt-6 border-t border-slate-100">
                <span>© 2026 Clean Laundry System. All Rights Reserved.</span>
                <div className="flex gap-4">
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Terms of Service</a>
                    <a href="#" className="hover:underline">API Documentation</a>
                </div>
            </div>
        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;
