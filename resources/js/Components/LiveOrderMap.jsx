import { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function LiveOrderMap({ drivers: initialDrivers = [], height = '340px' }) {
    const { props } = usePage();
    const mapSettings = props.settings || {};

    const centerLat = parseFloat(mapSettings.map_default_lat) || 52.4862;
    const centerLng = parseFloat(mapSettings.map_default_lng) || -1.8904;
    const defaultZoom = parseInt(mapSettings.map_default_zoom, 10) || 12;
    const refreshMs = (parseInt(mapSettings.map_refresh_interval, 10) || 5) * 1000;

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef({});
    const [drivers, setDrivers] = useState(initialDrivers);
    const [isLive, setIsLive] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

    // Initialize Leaflet map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        if (typeof window === 'undefined' || !window.L) return;

        const L = window.L;

        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([centerLat, centerLng], defaultZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c']
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [centerLat, centerLng, defaultZoom]);

    // Fetch live data every refreshMs
    useEffect(() => {
        if (!isLive) return;

        const fetchLiveData = async () => {
            try {
                const res = await fetch('/admin/live-map-data');
                if (res.ok) {
                    const data = await res.json();
                    if (data.drivers && data.drivers.length > 0) {
                        setDrivers(data.drivers);
                        setLastUpdated(new Date().toLocaleTimeString());
                    }
                }
            } catch (err) {
                // Silently handle fallback
            }
        };

        const interval = setInterval(fetchLiveData, refreshMs);
        return () => clearInterval(interval);
    }, [isLive, refreshMs]);

    // Update map markers whenever drivers state changes
    useEffect(() => {
        if (!mapInstanceRef.current || typeof window === 'undefined' || !window.L) return;

        const L = window.L;
        const map = mapInstanceRef.current;
        const currentMarkers = markersRef.current;
        const activeMarkerIds = new Set();
        const bounds = [];

        // 1. Plot Laundry Central Hub
        const hubId = 'hub_central';
        if (!currentMarkers[hubId]) {
            const hubIcon = L.divIcon({
                className: 'custom-hub-pin',
                html: `
                    <div className="flex items-center justify-center h-9 w-9 rounded-2xl bg-slate-900 border-2 border-white shadow-lg text-white font-black text-xs">
                        🏬
                    </div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18]
            });
            const hubMarker = L.marker([52.4862, -1.8904], { icon: hubIcon })
                .bindPopup('<div style="padding:4px"><b>🏬 Clean Quick Central Depot</b><br/><span style="font-size:11px;color:#64748b">Main Sorting & Processing Facility</span></div>')
                .addTo(map);
            currentMarkers[hubId] = hubMarker;
        }
        bounds.push([52.4862, -1.8904]);
        activeMarkerIds.add(hubId);

        // 2. Render Driver Pins & Customer Destinations
        drivers.forEach((driver) => {
            const driverId = `driver_${driver.id}`;
            activeMarkerIds.add(driverId);

            // Dynamic location updates with slight simulated smooth movement if stationary
            let lat = driver.current_lat || 52.4862;
            let lng = driver.current_lng || -1.8904;

            bounds.push([lat, lng]);

            const driverIconHtml = `
                <div className="relative group cursor-pointer">
                    <div className="h-10 w-10 rounded-2xl bg-[#f95700] border-2 border-white shadow-xl flex items-center justify-center text-white text-base font-black transform hover:scale-110 transition-transform shadow-orange-500/30">
                        🚚
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                    </span>
                </div>
            `;

            const driverIcon = L.divIcon({
                className: 'custom-driver-pin',
                html: driverIconHtml,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });

            const popupContent = `
                <div style="min-width:180px; padding:4px">
                    <div style="font-weight:800; font-size:13px; color:#0f172a">🚚 Driver: ${driver.name}</div>
                    <div style="font-size:11px; color:#64748b; margin-top:2px">Vehicle: <b>${driver.vehicle_type} (${driver.vehicle_number})</b></div>
                    <div style="font-size:11px; color:#16a34a; font-weight:700; margin-top:4px">🟢 GPS Active • ${driver.tasks_count} Active Orders</div>
                </div>
            `;

            if (currentMarkers[driverId]) {
                currentMarkers[driverId].setLatLng([lat, lng]);
            } else {
                const marker = L.marker([lat, lng], { icon: driverIcon })
                    .bindPopup(popupContent)
                    .addTo(map);
                currentMarkers[driverId] = marker;
            }

            // Render Active Tasks Pins
            if (driver.active_tasks && driver.active_tasks.length > 0) {
                driver.active_tasks.forEach((task) => {
                    const taskId = `task_${task.id}`;
                    activeMarkerIds.add(taskId);
                    const taskLat = task.lat || lat + 0.005;
                    const taskLng = task.lng || lng + 0.005;
                    bounds.push([taskLat, taskLng]);

                    const taskIcon = L.divIcon({
                        className: 'custom-task-pin',
                        html: `
                            <div className="h-8 w-8 rounded-xl bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-black">
                                📍
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                    });

                    const taskPopup = `
                        <div style="min-width:160px; padding:4px">
                            <div style="font-weight:800; font-size:12px; color:#1e293b">📍 Order #${task.order_id}</div>
                            <div style="font-size:11px; color:#64748b">Customer: <b>${task.customer_name}</b> (${task.postcode})</div>
                            <div style="font-size:10px; font-weight:800; color:#2563eb; text-transform:uppercase; margin-top:2px">Status: ${task.order_status}</div>
                        </div>
                    `;

                    if (currentMarkers[taskId]) {
                        currentMarkers[taskId].setLatLng([taskLat, taskLng]);
                    } else {
                        const tMarker = L.marker([taskLat, taskLng], { icon: taskIcon })
                            .bindPopup(taskPopup)
                            .addTo(map);
                        currentMarkers[taskId] = tMarker;
                    }
                });
            }
        });

        // Fit map to bounds if bounds exist
        if (bounds.length > 0 && map) {
            try {
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            } catch (e) {
                // Ignore bounds error
            }
        }
    }, [drivers]);

    return (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100" style={{ height }}>
            {/* Live GPS Badge Header */}
            <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">Live GPS Tracking</span>
                <span className="text-[10px] font-semibold text-slate-400 border-l border-slate-200 pl-2">Updated: {lastUpdated}</span>
            </div>

            {/* Recenter Button */}
            <div className="absolute top-3 right-3 z-[400] flex gap-2">
                <button
                    type="button"
                    onClick={() => setIsLive(!isLive)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold shadow-md border transition-all cursor-pointer ${
                        isLive ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                >
                    {isLive ? '🟢 Live Active' : '⏸️ Paused'}
                </button>
            </div>

            {/* Container for Leaflet map */}
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
}
