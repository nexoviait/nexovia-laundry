import { client, saveToken, clearToken } from './client';

/** FR-CUS-001: request an OTP for a phone number. */
export async function requestOtp(phone) {
    await client.post('/auth/otp/request', { phone });
}

/** FR-CUS-001: verify the OTP — creates the account on first use, logs in otherwise. */
export async function verifyOtp(phone, otp, name) {
    const response = await client.post('/auth/otp/verify', { phone, otp, name });
    const { user, token } = response.data;
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

export async function registerPushToken(pushToken) {
    await client.post('/me/push-token', { push_token: pushToken });
}
