import { client, saveToken, clearToken } from './client';

/** FR-RID-001: driver login with admin-created credentials (same endpoint staff/admin use). */
export async function login(email, password) {
    const response = await client.post('/login', { email, password });
    const { user, token } = response.data;

    if (user.role !== 'driver') {
        throw new Error('This account is not a driver account.');
    }

    await saveToken(token);
    return user;
}

export async function fetchMe() {
    const response = await client.get('/me');
    return response.data.data ?? response.data;
}

export async function logout() {
    try {
        await client.post('/logout');
    } finally {
        await clearToken();
    }
}
