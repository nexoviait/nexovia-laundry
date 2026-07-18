import { client } from './client';

export async function estimatePrice(items) {
    const response = await client.post('/pricing/estimate', { items });
    return response.data;
}

export async function fetchOrders() {
    const response = await client.get('/orders');
    return response.data.data;
}

export async function fetchOrder(orderId) {
    const response = await client.get(`/orders/${orderId}`);
    return response.data.data;
}

export async function createOrder({ addressId, timeSlotId, note, items }) {
    const response = await client.post('/orders', {
        address_id: addressId,
        time_slot_id: timeSlotId,
        note,
        items,
    });
    return response.data.data;
}

export async function cancelOrder(orderId, reason) {
    const response = await client.post(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
}

export async function fetchInvoice(orderId) {
    const response = await client.get(`/orders/${orderId}/invoice`);
    return response.data.data;
}

/** REQ-CUST-11: star rating after delivery. */
export async function rateOrder(orderId, { stars, comment }) {
    const response = await client.post(`/orders/${orderId}/rating`, { stars, comment });
    return response.data.data;
}
