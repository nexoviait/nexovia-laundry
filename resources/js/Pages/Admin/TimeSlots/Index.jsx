import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Layout from '@/Layouts/AdminLayout';

function formatHumanDate(dateStr) {
    if (!dateStr) return '—';
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }
    return dateStr;
}

export default function Index({ timeSlots, serviceAreas = [], availableTimeWindows = [], filters = {} }) {
    const { props } = usePage();
    const [showNew, setShowNew] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [isCustomWindow, setIsCustomWindow] = useState(false);
    const [customStartTime, setCustomStartTime] = useState('07:30');
    const [customEndTime, setCustomEndTime] = useState('09:30');

    const [isEditCustomWindow, setIsEditCustomWindow] = useState(false);
    const [editCustomStartTime, setEditCustomStartTime] = useState('08:00');
    const [editCustomEndTime, setEditCustomEndTime] = useState('10:00');

    const defaultWindows = [
        '08:00 - 10:00',
        '09:00 - 12:00',
        '10:00 - 12:00',
        '12:00 - 14:00',
        '12:00 - 15:00',
        '14:00 - 16:00',
        '15:00 - 18:00',
        '16:00 - 18:00',
        '18:00 - 20:00',
    ];

    const windowList = availableTimeWindows.length > 0 ? availableTimeWindows : defaultWindows;

    const newForm = useForm({
        service_area_id: serviceAreas[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        window: windowList[0] || '08:00 - 10:00',
        capacity: 10,
    });

    const editForm = useForm({
        window: '',
        capacity: 10,
    });

    function submitNew(e) {
        e.preventDefault();
        newForm.post('/admin/time-slots', {
            preserveScroll: true,
            onSuccess: () => {
                newForm.reset();
                setShowNew(false);
                setIsCustomWindow(false);
            },
        });
    }

    function startEdit(slot) {
        setEditingSlot(slot);
        const isPredefined = windowList.includes(slot.window);
        setIsEditCustomWindow(!isPredefined);
        if (slot.window && slot.window.includes('-')) {
            const parts = slot.window.split('-').map(s => s.trim());
            if (parts[0]) setEditCustomStartTime(parts[0]);
            if (parts[1]) setEditCustomEndTime(parts[1]);
        }
        editForm.setData({
            window: slot.window,
            capacity: slot.capacity,
        });
    }

    function submitEdit(e) {
        e.preventDefault();
        if (!editingSlot) return;
        editForm.put(`/admin/time-slots/${editingSlot.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSlot(null);
            },
        });
    }

    function updateCapacityInline(slot, capacity) {
        const val = parseInt(capacity, 10);
        if (isNaN(val) || val < 0) return;
        router.put(`/admin/time-slots/${slot.id}`, { capacity: val }, { preserveScroll: true });
    }

    function remove(slot) {
        if (confirm(`Are you sure you want to delete time slot "${slot.window}" on ${formatHumanDate(slot.date)}?`)) {
            router.delete(`/admin/time-slots/${slot.id}`, { preserveScroll: true });
        }
    }

    function filterByArea(areaId) {
        router.get('/admin/time-slots', areaId ? { service_area_id: areaId } : {}, { preserveState: true });
    }

    const slotList = timeSlots?.data || (Array.isArray(timeSlots) ? timeSlots : []);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            
            {/* Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Time Slots Management</h1>
                    <p className="mt-1 text-slate-500 text-sm font-semibold">
                        Configure daily pickup & delivery time windows, area availability, and shift capacity quotas.
                    </p>
                </div>
                
                <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="flex items-center gap-2 rounded-xl bg-[#f95700] hover:bg-[#e04f00] text-white font-extrabold text-xs px-4 py-2.5 shadow-md shadow-orange-500/20 transition-all"
                >
                    <span>{showNew ? '✕ Close Form' : '＋ Add Time Slot'}</span>
                </button>
            </div>

            {/* Create New Time Slot Form */}
            {showNew && (
                <form onSubmit={submitNew} noValidate className="rounded-2xl border border-orange-200 bg-orange-50/40 p-6 space-y-4 shadow-2xs">
                    <h3 className="text-xs font-extrabold text-[#f95700] uppercase tracking-wider">Create New Time Slot</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Service Area</label>
                            <select
                                required
                                value={newForm.data.service_area_id}
                                onChange={(e) => newForm.setData('service_area_id', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#f95700]"
                            >
                                <option value="">Select Service Area</option>
                                {serviceAreas.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} {!a.active ? '(inactive)' : ''}
                                    </option>
                                ))}
                            </select>
                            {newForm.errors.service_area_id && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.service_area_id}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                            <input
                                type="date"
                                required
                                value={newForm.data.date}
                                onChange={(e) => newForm.setData('date', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#f95700]"
                            />
                            {newForm.errors.date && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.date}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Time Window</label>
                            {!isCustomWindow ? (
                                <select
                                    required
                                    value={newForm.data.window}
                                    onChange={(e) => {
                                        if (e.target.value === '__custom__') {
                                            setIsCustomWindow(true);
                                            newForm.setData('window', `${customStartTime} - ${customEndTime}`);
                                        } else {
                                            newForm.setData('window', e.target.value);
                                        }
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#f95700]"
                                >
                                    <option value="">Select Time Window</option>
                                    {windowList.map(w => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                    <option value="__custom__">＋ Enter Custom Time Window...</option>
                                </select>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
                                        <input
                                            type="time"
                                            required
                                            value={customStartTime}
                                            onChange={(e) => {
                                                const start = e.target.value;
                                                setCustomStartTime(start);
                                                if (start && customEndTime) {
                                                    newForm.setData('window', `${start} - ${customEndTime}`);
                                                }
                                            }}
                                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-[#f95700]"
                                        />
                                        <span className="text-[10px] font-bold text-slate-400">to</span>
                                        <input
                                            type="time"
                                            required
                                            value={customEndTime}
                                            onChange={(e) => {
                                                const end = e.target.value;
                                                setCustomEndTime(end);
                                                if (customStartTime && end) {
                                                    newForm.setData('window', `${customStartTime} - ${end}`);
                                                }
                                            }}
                                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-[#f95700]"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCustomWindow(false);
                                            newForm.setData('window', windowList[0] || '08:00 - 10:00');
                                        }}
                                        className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-800 font-extrabold shrink-0 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                        title="Switch back to dropdown list"
                                    >
                                        ✕ List
                                    </button>
                                </div>
                            )}
                            {newForm.errors.window && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.window}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Shift Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={newForm.data.capacity}
                                onChange={(e) => newForm.setData('capacity', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#f95700]"
                            />
                            {newForm.errors.capacity && <p className="text-[10px] text-rose-600 font-bold">{newForm.errors.capacity}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowNew(false)}
                            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={newForm.processing}
                            className="px-5 py-2 rounded-xl bg-[#f95700] text-white font-extrabold text-xs hover:bg-[#e04f00] shadow-sm disabled:opacity-50"
                        >
                            Save Time Slot
                        </button>
                    </div>
                </form>
            )}

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter by Area:</span>
                    <select
                        value={filters?.service_area_id || ''}
                        onChange={(e) => filterByArea(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#f95700]"
                    >
                        <option value="">All Service Areas</option>
                        {serviceAreas.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name} {!a.active ? '(inactive)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="text-xs font-bold text-slate-500">
                    Total Slots: <span className="text-slate-900 font-extrabold">{timeSlots?.total || slotList.length}</span>
                </div>
            </div>

            {/* Time Slots Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-700">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="py-3.5 px-4">Service Area</th>
                                <th className="py-3.5 px-4">Date</th>
                                <th className="py-3.5 px-4">Time Window</th>
                                <th className="py-3.5 px-4">Shift Capacity</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {slotList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                                        No time slots created yet for this area.
                                    </td>
                                </tr>
                            ) : (
                                slotList.map((slot) => (
                                    <tr key={slot.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                            {slot.service_area?.name || 'All Areas'}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-600 font-bold whitespace-nowrap">
                                            {formatHumanDate(slot.date)}
                                        </td>
                                        <td className="py-3.5 px-4 text-slate-800 font-extrabold whitespace-nowrap">
                                            ⏰ {slot.window}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    defaultValue={slot.capacity}
                                                    onBlur={(e) => updateCapacityInline(slot, e.target.value)}
                                                    className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-extrabold text-slate-900 focus:border-[#f95700] outline-none"
                                                />
                                                <span className="text-[10px] text-slate-400 font-bold">orders</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                                slot.service_area?.active !== false
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {slot.service_area?.active !== false ? 'Active Area' : 'Inactive Area'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(slot)}
                                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(slot)}
                                                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {timeSlots?.links && Array.isArray(timeSlots.links) && (
                    <div className="p-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                        <span className="text-xs text-slate-500 font-semibold">
                            Showing {timeSlots.from || 0} to {timeSlots.to || 0} of {timeSlots.total || 0} time slots
                        </span>
                        <div className="flex gap-1">
                            {timeSlots.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                                        link.active ? 'bg-[#f95700] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    } disabled:opacity-40`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingSlot && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <form onSubmit={submitEdit} noValidate className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
                        <h3 className="text-base font-extrabold text-slate-900">
                            Edit Time Slot ({editingSlot.service_area?.name} • {formatHumanDate(editingSlot.date)})
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Time Window</label>
                                {!isEditCustomWindow ? (
                                    <select
                                        required
                                        value={editForm.data.window}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                setIsEditCustomWindow(true);
                                                editForm.setData('window', `${editCustomStartTime} - ${editCustomEndTime}`);
                                            } else {
                                                editForm.setData('window', e.target.value);
                                            }
                                        }}
                                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#f95700]"
                                    >
                                        <option value="">Select Time Window</option>
                                        {windowList.map(w => (
                                            <option key={w} value={w}>{w}</option>
                                        ))}
                                        {!windowList.includes(editForm.data.window) && editForm.data.window && (
                                            <option value={editForm.data.window}>{editForm.data.window}</option>
                                        )}
                                        <option value="__custom__">＋ Enter Custom Time Window...</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl p-1 shadow-2xs flex-1">
                                            <input
                                                type="time"
                                                required
                                                value={editCustomStartTime}
                                                onChange={(e) => {
                                                    const start = e.target.value;
                                                    setEditCustomStartTime(start);
                                                    if (start && editCustomEndTime) {
                                                        editForm.setData('window', `${start} - ${editCustomEndTime}`);
                                                    }
                                                }}
                                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-[#f95700] w-full"
                                            />
                                            <span className="text-[10px] font-bold text-slate-400">to</span>
                                            <input
                                                type="time"
                                                required
                                                value={editCustomEndTime}
                                                onChange={(e) => {
                                                    const end = e.target.value;
                                                    setEditCustomEndTime(end);
                                                    if (editCustomStartTime && end) {
                                                        editForm.setData('window', `${editCustomStartTime} - ${end}`);
                                                    }
                                                }}
                                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-[#f95700] w-full"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditCustomWindow(false);
                                                editForm.setData('window', windowList[0] || '08:00 - 10:00');
                                            }}
                                            className="px-2.5 py-2 text-[10px] text-slate-600 hover:text-slate-900 font-extrabold shrink-0 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                            title="Switch back to dropdown list"
                                        >
                                            ✕ List
                                        </button>
                                    </div>
                                )}
                                {editForm.errors.window && <p className="text-[10px] text-rose-600 font-bold mt-1">{editForm.errors.window}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700">Capacity Quota</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={editForm.data.capacity}
                                    onChange={(e) => editForm.setData('capacity', parseInt(e.target.value, 10))}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 outline-none focus:border-[#f95700]"
                                />
                                {editForm.errors.capacity && <p className="text-[10px] text-rose-600 font-bold mt-1">{editForm.errors.capacity}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setEditingSlot(null)}
                                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="px-5 py-2 rounded-xl bg-[#f95700] text-white font-extrabold text-xs hover:bg-[#e04f00] shadow-sm disabled:opacity-50"
                            >
                                Update Slot
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

Index.layout = (page) => <Layout children={page} />;

