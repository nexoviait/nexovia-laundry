import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config';

const TOKEN_KEY = 'driver_api_token';

export const client = axios.create({
    baseURL: API_BASE_URL,
    headers: { Accept: 'application/json' },
});

client.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function saveToken(token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/** Pulls the first validation message (or a generic fallback) out of a Laravel error response. */
export function apiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    const data = error?.response?.data;
    if (data?.errors) {
        const first = Object.values(data.errors)[0];
        if (Array.isArray(first) && first[0]) return first[0];
    }
    if (data?.message) return data.message;
    return fallback;
}
