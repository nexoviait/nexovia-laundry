import { client } from './client';

/** FR-RID-002: today's task list, already sorted by slot then area server-side. */
export async function fetchTodaysTasks() {
    const response = await client.get('/driver/tasks');
    return response.data.data;
}

/** FR-RID-003: task detail, including the order's address for map-pin handoff. */
export async function fetchTask(taskId) {
    const response = await client.get(`/driver/tasks/${taskId}`);
    return response.data.data;
}

/** FR-RID-004: pickup — item count, weight, 1-4 photos. */
export async function submitPickup(taskId, { itemCount, weight, photos }) {
    const form = new FormData();
    form.append('item_count', String(itemCount));
    if (weight) form.append('weight', String(weight));
    photos.forEach((photo, index) => {
        form.append('photos[]', {
            uri: photo.uri,
            name: photo.fileName || `pickup-${index}.jpg`,
            type: photo.mimeType || 'image/jpeg',
        });
    });

    const response = await client.post(`/driver/tasks/${taskId}/pickup`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
}

/** FR-RID-005: start the delivery run — generates and SMS's the customer's handover OTP. */
export async function startDelivery(taskId) {
    const response = await client.post(`/driver/tasks/${taskId}/start-delivery`);
    return response.data.data;
}

/** FR-RID-006/007: confirm delivery with the customer's OTP + cash-on-delivery recording. */
export async function submitDelivery(taskId, { otp, paymentMethod, codAmount }) {
    const response = await client.post(`/driver/tasks/${taskId}/deliver`, {
        otp,
        payment_method: paymentMethod,
        cod_amount: codAmount,
    });
    return response.data.data;
}

/** FR-RID-008: failed pickup/delivery reporting with a reason. */
export async function reportFailure(taskId, reason) {
    const response = await client.post(`/driver/tasks/${taskId}/fail`, { reason });
    return response.data.data;
}
