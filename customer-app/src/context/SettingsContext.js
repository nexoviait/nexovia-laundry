import { createContext, useContext, useEffect, useState } from 'react';
import { fetchPublicSettings } from '../api/catalogue';

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

const SettingsContext = createContext({ currency: 'GBP', businessName: null });

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({ currency: 'GBP', businessName: null });

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchPublicSettings();
                setSettings({ currency: data.currency || 'GBP', businessName: data.business_name });
            } catch {
                // Keep the GBP default — the app still works without this.
            }
        })();
    }, []);

    return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
    return useContext(SettingsContext);
}

/** FR-CUS-027: every amount in the app is formatted through this, honoring the configured currency. */
export function useCurrencyFormatter() {
    const { currency } = useSettings();
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;

    return (amount) => `${symbol}${Number(amount ?? 0).toFixed(2)}`;
}
