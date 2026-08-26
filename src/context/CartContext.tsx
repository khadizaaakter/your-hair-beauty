import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { api, type Product, type Variant } from '../lib/api';

export interface CartItem {
    id: string;
    product: Product;
    variant?: Variant;
    selectedVariants?: Variant[];
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    itemCount: number;
    total: number;
    addItem: (product: Product, quantity?: number, variants?: Variant | Variant[]) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    validateCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const normalizeSelectedVariants = useCallback((variants?: Variant | Variant[]): Variant[] => {
        if (!variants) return [];
        const normalizedArray = Array.isArray(variants) ? variants : [variants];
        return normalizedArray.filter((variant): variant is Variant => {
            return Boolean(variant && (variant.id || variant.value));
        });
    }, []);

    // Load cart from local storage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('yhb_cart');
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error('Failed to load cart from local storage', error);
        }
    }, []);

    const getVariantKey = useCallback((variants: Variant[]) => {
        if (!variants.length) return '';
        const ids = variants
            .map((variant) => Number(variant.id))
            .filter((id) => Number.isInteger(id) && id > 0)
            .sort((a, b) => a - b);
        if (ids.length) return ids.join('-');

        return variants
            .map((variant) => `${variant.name || 'Option'}:${variant.value || ''}`.trim())
            .filter(Boolean)
            .sort()
            .join('|');
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('yhb_cart', JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product: Product, quantity = 1, variants?: Variant | Variant[]) => {
        const selectedVariants = normalizeSelectedVariants(variants);
        const variantKey = getVariantKey(selectedVariants);
        const uniqueId = variantKey ? `${product.id}-${variantKey}` : `${product.id}`;
        const primaryVariant = selectedVariants[0];

        setItems(prev => {
            const existing = prev.find(item => item.id === uniqueId);
            if (existing) {
                return prev.map(item =>
                    item.id === uniqueId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { id: uniqueId, product, variant: primaryVariant, selectedVariants, quantity }];
        });

        const variantLabel = selectedVariants.length
            ? ` (${selectedVariants.map((variant) => variant.value).join(' / ')})`
            : '';
        toast.success(`Added ${product.name}${variantLabel} to cart`);
    }, [getVariantKey, normalizeSelectedVariants]);

    const removeItem = useCallback((itemId: string) => {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast.success("Item removed from cart");
    }, []);

    const updateQuantity = useCallback((itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(itemId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    }, [removeItem]);

    const clearCart = useCallback(() => {
        setItems([]);
        localStorage.removeItem('yhb_cart');
    }, []);

    const validateCart = useCallback(async () => {
        if (items.length === 0) return;

        // Fetch fresh data for all items in parallel
        const updatedItems = await Promise.all(items.map(async (item) => {
            try {
                // Ensure product.id is used correctly (API expects number/string)
                const response = await api.products.get(item.product.id);
                if (response.success && response.data) {
                    return { ...item, product: response.data };
                }
                return item; // Keep old data if fetch fails
            } catch (error) {
                console.error(`Failed to validate product ${item.product.id}`, error);
                return item;
            }
        }));

        setItems(updatedItems);
    }, [items]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    const total = items.reduce((sum, item) => {
        const basePrice = item.product.sale_price ? Number(item.product.sale_price) : Number(item.product.price);
        const selectedVariants = item.selectedVariants && item.selectedVariants.length > 0
            ? item.selectedVariants
            : (item.variant ? [item.variant] : []);
        const adjustment = selectedVariants.reduce(
            (variantTotal, variant) => variantTotal + Number(variant.price_adjustment || 0),
            0
        );
        const finalPrice = basePrice + adjustment;
        return sum + finalPrice * item.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart, validateCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
