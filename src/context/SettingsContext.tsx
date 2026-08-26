import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface Settings {
    header_text: string;
    free_shipping_threshold: string;
    delivery_charge: string;
    contact_phone: string;
    contact_phone_secondary: string;
    contact_email: string;
    admin_email: string;
    instagram_url: string;
    tiktok_url: string;
    google_review_url: string;
    store_name: string;
    currency: string;
    currency_symbol: string;
    address: string;
    vat_number: string;
    [key: string]: string;
}

interface SettingsContextType {
    settings: Settings;
    isLoading: boolean;
    getSetting: (key: string, defaultValue?: string) => string;
}

const defaultSettings: Settings = {
    header_text: 'FREE UK DELIVERY ON ORDERS OVER £50',
    free_shipping_threshold: '50',
    delivery_charge: '3.99',
    contact_phone: '02083180999',
    contact_phone_secondary: '',
    contact_email: 'info@yourhairbeauty.co.uk',
    admin_email: 'yourhairandbeautyuk@gmail.com',
    instagram_url: 'https://www.instagram.com/yourhairandbeauty1',
    tiktok_url: 'https://www.tiktok.com/@yourhairandbeauty1?_r=1&_t=ZN-94DcnGT6U7D',
    google_review_url: 'https://g.page/r/CTlrynC6OrBbEBM/review',
    store_name: 'Your Hair & Beauty',
    currency: 'GBP',
    currency_symbol: '£',
    address: '123 Beauty Lane, London, UK',
    vat_number: '',
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: false,
    getSetting: (key, defaultValue = '') => defaultSettings[key] || defaultValue,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
    const { data, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.settings.get();
            return res.success ? res.data : {};
        },
        // Keep settings in sync with admin updates across open sessions.
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
    });

    // Merge API settings with defaults
    const settings: Settings = { ...defaultSettings, ...data };

    const getSetting = (key: string, defaultValue = ''): string => {
        if (Object.prototype.hasOwnProperty.call(settings, key)) {
            const value = settings[key];
            if (value !== undefined && value !== null) {
                return String(value);
            }
        }
        return defaultValue;
    };

    return (
        <SettingsContext.Provider value={{ settings, isLoading, getSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export default SettingsContext;
