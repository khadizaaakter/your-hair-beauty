import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { api, type Product } from '../lib/api';
import { useAuth } from './AuthContext';

interface WishlistContextType {
    items: Product[];
    itemCount: number;
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    isInWishlist: (productId: number) => boolean;
    toggleItem: (product: Product) => void;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Product[]>([]);
    const { user } = useAuth();

    // Fetch wishlist on mount or user change
    useEffect(() => {
        if (user) {
            api.wishlist.list().then(response => {
                if (response.success && response.data) {
                    setItems(response.data);
                }
            });
        } else {
            setItems([]);
        }
    }, [user]);

    const addItem = useCallback(async (product: Product) => {
        if (!user) return; // Prompt login?

        // Optimistic update
        setItems(prev => [...prev, product]);

        const response = await api.wishlist.add(product.id);
        if (!response.success) {
            // Revert on failure
            setItems(prev => prev.filter(item => item.id !== product.id));
        }
    }, [user]);

    const removeItem = useCallback(async (productId: number) => {
        if (!user) return;

        // Optimistic update
        setItems(prev => prev.filter(item => item.id !== productId));

        const response = await api.wishlist.remove(productId);
        if (!response.success) {
            // Re-fetch or revert (complex to revert without product data)
            api.wishlist.list().then(res => res.data && setItems(res.data));
        }
    }, [user]);

    const isInWishlist = useCallback((productId: number) => {
        return items.some(item => item.id === productId);
    }, [items]);

    const toggleItem = useCallback((product: Product) => {
        if (isInWishlist(product.id)) {
            removeItem(product.id);
        } else {
            addItem(product);
        }
    }, [isInWishlist, removeItem, addItem]);

    const clearWishlist = useCallback(() => {
        setItems([]);
    }, []);

    const itemCount = items.length;

    return (
        <WishlistContext.Provider value={{ items, itemCount, addItem, removeItem, isInWishlist, toggleItem, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
