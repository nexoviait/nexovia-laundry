import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken } from '../api/client';
import { fetchMe, logout as apiLogout } from '../api/auth';
import { setUpPushNotifications } from '../notifications';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);

    useEffect(() => {
        (async () => {
            const token = await getToken();
            if (token) {
                try {
                    setUser(await fetchMe());
                } catch {
                    setUser(null);
                }
            }
            setBooting(false);
        })();
    }, []);

    useEffect(() => {
        if (user) {
            setUpPushNotifications();
        }
    }, [user]);

    const signIn = useCallback((loggedInUser) => {
        setUser(loggedInUser);
    }, []);

    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, booting, signIn, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
