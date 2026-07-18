import { client } from './client';

export async function fetchAddresses() {
    const response = await client.get('/addresses');
    return response.data.data;
}

/** Area-gated on the backend (ServiceAreaGate) — throws with `blocked: true` payload when out of area. */
export async function createAddress({ label, postcode, directions, mapLat, mapLng }) {
    const response = await client.post('/addresses', {
        label,
        postcode,
        directions,
        map_lat: mapLat,
        map_lng: mapLng,
    });
    return response.data.data;
}

export async function deleteAddress(addressId) {
    await client.delete(`/addresses/${addressId}`);
}
