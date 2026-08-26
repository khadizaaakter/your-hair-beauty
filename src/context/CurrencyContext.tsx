import React, { createContext, useContext, useState, useEffect } from 'react';

type CurrencyType = 'GBP' | 'USD' | 'EUR';

interface CurrencyRates {
    GBP: number;
    USD: number;
    EUR: number;
    [key: string]: number;
}

interface CurrencyContextType {
    currency: CurrencyType;
    setCurrency: (c: CurrencyType) => void;
    rates: CurrencyRates;
    formatPrice: (amountInGbp: number | string) => string;
    getSymbol: (c?: CurrencyType) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize from localStorage or default to GBP
    const [currency, setCurrencyState] = useState<CurrencyType>(() => {
        const saved = localStorage.getItem('yhb_currency');
        if (saved === 'USD' || saved === 'EUR' || saved === 'GBP') {
            return saved;
        }
        return 'GBP';
    });

    const [rates, setRates] = useState<CurrencyRates>({
        GBP: 1.0,
        USD: 1.25, // Fallback safe defaults until API loads
        EUR: 1.15
    });

    // Fetch live rates
    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Using API_URL from env or hardcoded relative if proxied
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${apiUrl}/currency/rates`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data && data.success && data.data) {
                    setRates((prev) => ({
                        ...prev,
                        ...data.data
                    }));
                }
            } catch (error) {
                console.error("Using fallback exchange rates:", error);
            }
        };

        fetchRates();

        // Refresh rates every hour
        const interval = setInterval(fetchRates, 1000 * 60 * 60);
        return () => clearInterval(interval);
    }, []);

    const setCurrency = (newCurrency: CurrencyType) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('yhb_currency', newCurrency);
    };

    const getSymbol = (c: CurrencyType = currency) => {
        switch (c) {
            case 'USD': return '$';
            case 'EUR': return '€';
            case 'GBP': default: return '£';
        }
    };

    /**
     * Takes an amount natively stored in GBP, checks the current active currency, 
     * applies the live multiplier, and returns a formatted string with the correct symbol.
     */
    const formatPrice = (amountInGbp: number | string) => {
        const amount = typeof amountInGbp === 'string' ? parseFloat(amountInGbp) : amountInGbp;
        if (isNaN(amount)) return `${getSymbol()}0.00`;

        if (currency === 'GBP') {
            return `£${amount.toFixed(2)}`;
        }

        const multiplier = rates[currency] || 1.0;
        const converted = amount * multiplier;

        return `${getSymbol()}${converted.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatPrice, getSymbol }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
