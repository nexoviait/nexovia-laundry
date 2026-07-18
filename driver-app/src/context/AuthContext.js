import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getToken } from '../api/client';
import { login as apiLogin, logout as apiLogout, fetchMe } from '../api/auth';

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

    const login = useCallback(async (email, password) => {
        const loggedInUser = await apiLogin(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    }, []);

    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, booting, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
