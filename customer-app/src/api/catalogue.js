import { client } from './client';

/** FR-CUS-026: dynamic services and prices from the backend. */
export async function fetchServices() {
    const response = await client.get('/services');
    return response.data.data;
}

export async function fetchTimeSlots({ serviceAreaId, from, to } = {}) {
    const response = await client.get('/time-slots', {
        params: { service_area_id: serviceAreaId, from, to },
    });
    return response.data.data;
}

/** FR-CUS-027: currency + basic business info, public (no auth required). */
export async function fetchPublicSettings() {
    const response = await client.get('/settings/public');
    return response.data;
}
