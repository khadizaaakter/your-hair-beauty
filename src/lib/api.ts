// Production API - Connects to real backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer';
    phone?: string;
    address?: string;
}

export interface Variant {
    id?: number;
    product_id?: number;
    name: string;
    value: string;
    color_code?: string;
    image?: string;
    price_adjustment?: number;
    stock_quantity: number;
    sku?: string;
}

export interface Product {
    id: number;
    name: string;
    short_description?: string;
    description?: string;
    how_to_use?: string;
    ingredients?: string;
    price: number;
    sale_price?: number;
    stock_quantity: number;
    images: string[];
    is_featured: number;
    badge?: 'new' | 'sale' | 'bestseller';
    category_id?: number;
    subcategory_id?: number;
    category_name?: string;
    category_slug?: string;
    brand_id?: number;
    brand_name?: string;
    inStock: boolean;
    has_variants?: boolean;
    variants?: Variant[];
}

export interface ProductDetail extends Product {
    relatedProducts: Product[];
}

export interface ProductInput {
    name: string;
    short_description?: string;
    description?: string;
    how_to_use?: string;
    ingredients?: string;
    category_id?: number;
    subcategory_id?: number;
    brand_id?: number;
    price: number;
    sale_price?: number | null;
    stock_quantity: number;
    images: string[];
    is_featured?: boolean;
    badge?: 'new' | 'sale' | 'bestseller' | null;
    variants?: Variant[];
}


export interface Category {
    id: number;
    name: string;
    slug: string;
    image?: string;
    description?: string;
    product_count?: number;
    subcategories?: {
        id: number;
        name: string;
        slug: string;
        itemTypes?: { id: number; name: string; slug: string }[];
    }[];
}


export interface Brand {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    is_active: boolean; // Added is_active
}

export interface OrderInput {
    items: {
        productId: number;
        variantId?: number;
        variantIds?: number[];
        quantity: number;
    }[];
    shippingAddress: string;
}

export interface Order {
    id: number;
    user_id: number;
    subtotal_amount?: number;
    shipping_amount?: number;
    discount_amount?: number;
    first_order_discount_amount?: number;
    coupon_discount_amount?: number;
    coupon_code?: string | null;
    total_amount: number;
    status: string;
    payment_status: string;
    worldpay_order_code?: string;
    shipping_address?: any;
    created_at: string;
    updated_at?: string;
    user_name?: string;
    user_email?: string;
    items?: OrderItem[];
}

export interface Coupon {
    id: number;
    code: string;
    discount_type: 'percentage' | 'percent' | 'fixed';
    discount_value: number;
    min_order_amount: number;
    max_uses?: number | null;
    used_count: number;
    valid_until?: string | null;
    is_active: boolean | number;
}

export interface OrderPricingPreview {
    subtotal: number;
    deliveryFee: number;
    firstOrderDiscount: number;
    couponDiscount: number;
    totalDiscount: number;
    total: number;
    firstOrderEligible: boolean;
    freeShippingThreshold?: number;
    coupon?: {
        code: string | null;
        valid: boolean;
        message?: string;
    };
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id?: number | null;
    quantity: number;
    price: number;
    name?: string;
    images?: string[];
    variant_name?: string;
    variant_value?: string;
    selected_variants?: Array<{
        id?: number;
        name: string;
        value: string;
        color_code?: string | null;
        image?: string | null;
        price_adjustment?: number;
    }>;
}

export interface HeroSlider {
    id: number;
    image: string;
    title?: string;
    description?: string;
    button_text?: string;
    button_link?: string;
    order_index: number;
    is_active: boolean;
}

export interface CustomerDetail {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at: string;
    order_count?: number;
    total_spent?: number;
    last_order_date?: string;
    status?: 'active' | 'blocked';
    address?: string;
    role: 'admin' | 'customer';
    orders?: Order[];
}

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
    trends: {
        revenue: number;
        orders: number;
        customers: number;
        products: number;
    };
    charts: {
        name: string;
        month_num: number;
        year_num: number;
        sales: number;
        orders: number;
    }[];
    stats?: any; // For backward compatibility if needed, or remove
}



// Token storage
const TOKEN_KEY = 'yhb_token';
const USER_KEY = 'yhb_user';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch {
            return null;
        }
    }
    return null;
}

export function setStoredUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// Fetch helper with auth
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; message?: string }> {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, message: data.message || 'API Error' };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error instanceof Error ? error.message : 'Network error' };
    }
}

// API Methods
export const api = {
    // Auth
    auth: {
        login: async (email: string, password: string) => {
            const response = await apiFetch<{ token: string; user: User }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            if (response.success && response.data) {
                setToken(response.data.token);
                setStoredUser(response.data.user);
            }

            return response;
        },

        register: async (data: { name: string; email: string; password: string; phone: string; address: string }) => {
            return apiFetch<{ userId: number; email: string }>('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        verifyEmail: async (data: { email: string; otp: string }) => {
            return apiFetch<{ token: string; user: User }>('/auth/verify-email', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        resendOtp: async (email: string) => {
            return apiFetch<{ message: string }>('/auth/resend-otp', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        },

        requestEmailChange: async (newEmail: string) => {
            return apiFetch<{ message: string }>('/auth/request-email-change', {
                method: 'POST',
                body: JSON.stringify({ newEmail }),
            });
        },

        verifyEmailChange: async (otp: string) => {
            return apiFetch<{ token: string; user: User }>('/auth/verify-email-change', {
                method: 'POST',
                body: JSON.stringify({ otp }),
            });
        },

        me: async () => {
            return apiFetch<User>('/auth/me');
        },

        updateProfile: async (data: { name?: string; email?: string; phone?: string; address?: string }) => {
            return apiFetch<User>('/auth/profile', {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },

        forgotPassword: async (email: string) => {
            return apiFetch<{ message: string }>('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        },

        resetPassword: async (data: { email: string; otp: string; password: string }) => {
            return apiFetch<{ message: string }>('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
    },

    // Products
    products: {
        list: async (params?: { category?: string; brand?: string; search?: string; sort?: string; limit?: number; offset?: number; badge?: string; min_price?: number; max_price?: number; subcategory?: string; page?: number }) => {
            const searchParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) searchParams.append(key, String(value));
                });
            }
            const query = searchParams.toString();
            return apiFetch<Product[]>(`/products${query ? `?${query}` : ''}`);
        },

        get: async (id: number) => {
            return apiFetch<ProductDetail>(`/products/${id}`);
        },

        create: async (data: ProductInput) => {
            return apiFetch<Product>('/admin/products', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        update: async (id: number, data: Partial<ProductInput>) => {
            return apiFetch<Product>(`/admin/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },

        delete: async (id: number) => {
            return apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
        },
    },

    // Hero Sliders (Public)
    heroSliders: {
        list: async () => apiFetch<HeroSlider[]>('/hero-sliders'),
    },

    // Categories
    categories: {
        list: async () => {
            return apiFetch<Category[]>('/categories');
        },

        get: async (slug: string) => {
            return apiFetch<Category>(`/categories/${slug}`);
        },
    },

    // Brands
    brands: {
        list: async () => {
            return apiFetch<Brand[]>('/brands');
        },
        get: async (slug: string) => {
            return apiFetch<any>(`/brands/${slug}`);
        },
    },

    // Collections
    collections: {
        listPublic: async () => {
            return apiFetch<any[]>('/collections');
        },
    },

    // Wishlist
    wishlist: {
        list: async () => {
            return apiFetch<Product[]>('/wishlist');
        },
        add: async (productId: number) => {
            return apiFetch('/wishlist', {
                method: 'POST',
                body: JSON.stringify({ productId }),
            });
        },
        remove: async (productId: number) => {
            return apiFetch(`/wishlist/${productId}`, { method: 'DELETE' });
        },
    },

    // Orders
    orders: {
        create: async (data: {
            items: { productId: number; variantId?: number; variantIds?: number[]; quantity: number }[];
            shippingAddress: any;
            couponCode?: string;
            currency?: string;
            exchangeRate?: number;
        }) => {
            return apiFetch<{
                orderId: number;
                orderCode: string;
                totalAmount: number;
                pricing?: OrderPricingPreview & { couponCode?: string | null };
            }>('/orders', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        preview: async (data: {
            items: { productId: number; variantId?: number; variantIds?: number[]; quantity: number }[];
            shippingAddress: any;
            couponCode?: string;
        }) => {
            return apiFetch<OrderPricingPreview>('/orders/preview', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        list: async () => {
            return apiFetch<Order[]>('/orders');
        },

        get: async (id: number) => {
            return apiFetch<Order>(`/orders/${id}`);
        },

        validateCoupon: async (code: string, subtotal?: number) => {
            const query = new URLSearchParams({ code });
            if (typeof subtotal === 'number') {
                query.set('subtotal', String(subtotal));
            }
            return apiFetch<{ valid: boolean; discount: number; message?: string }>(`/coupons/validate?${query.toString()}`);
        },

        track: async (code: string, email: string) => {
            return apiFetch<any>(`/orders/track?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`);
        },

        linkAccount: async (orderCode: string) => {
            return apiFetch<{ message: string }>('/orders/link-account', {
                method: 'POST',
                body: JSON.stringify({ orderCode }),
            });
        },
    },

    // Settings (public)
    settings: {
        get: async () => apiFetch<{ [key: string]: string }>('/settings'),
    },

    // Payments
    payments: {
        createSession: async (orderId: number) => {
            return apiFetch<{ url: string; transactionReference: string }>('/payments/worldpay/session', {
                method: 'POST',
                body: JSON.stringify({ orderId }),
            });
        },

        getStatus: async (ref: string) => {
            const ts = Date.now();
            return apiFetch<{
                status: 'PAID' | 'PROCESSING' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'ERROR' | 'UNKNOWN';
                orderId: number | null;
                reference: string;
                message?: string;
            }>(`/payments/status?ref=${encodeURIComponent(ref)}&t=${ts}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    Pragma: 'no-cache',
                },
            });
        },

        // Legacy/Compatibility
        processWorldpay: async (data: { orderId: number }) => {
            return apiFetch<{ redirectUrl: string }>('/payments/worldpay', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },

        checkStatus: async (orderCode: string) => {
            return apiFetch<{ status: string; paymentStatus: string; total: number }>(`/payments/worldpay/status/${orderCode}`);
        },

        getClientKey: async () => {
            return apiFetch<{ clientKey: string; env: string }>('/payments/worldpay/client-key');
        },
    },

    // File upload
    upload: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            const data = await response.json();
            return data.url || URL.createObjectURL(file);
        } catch {
            return URL.createObjectURL(file);
        }
    },

    contact: {
        subscribeNewsletter: async (data: { email: string; source?: string }) => {
            return apiFetch<{ message: string }>('/contact/newsletter', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        submit: async (data: { name: string; email: string; subject: string; message: string }) => {
            return apiFetch<{ message: string }>('/contact', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        },
        list: async () => {
            return apiFetch<any[]>('/contact/admin');
        },
        updateStatus: async (id: number | string, status: string) => {
            return apiFetch<{ message: string }>(`/contact/admin/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status }),
            });
        },
    },

    // Admin
    admin: {
        stats: async () => {
            return apiFetch<DashboardStats>('/admin/stats');
        },


        heroSliders: {
            list: async () => apiFetch<HeroSlider[]>('/hero-sliders'),
            create: async (data: any) => apiFetch('/admin/hero-sliders', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/hero-sliders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/hero-sliders/${id}`, { method: 'DELETE' }),
        },

        brands: {
            list: async () => apiFetch<Brand[]>('/admin/brands'),
            create: async (data: any) => apiFetch('/admin/brands', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/brands/${id}`, { method: 'DELETE' }),
        },

        collections: {
            list: async () => apiFetch('/admin/collections'),
            create: async (data: any) => apiFetch('/admin/collections', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/collections/${id}`, { method: 'DELETE' }),
        },


        categories: {
            list: async () => apiFetch<Category[]>('/admin/categories'),
            create: async (data: any) => apiFetch('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/categories/${id}`, { method: 'DELETE' }),
        },

        subcategories: {
            list: async (categoryId: number) => apiFetch<{ id: number; category_id: number; name: string; slug: string }[]>(`/admin/subcategories/${categoryId}`),
            create: async (data: any) => apiFetch('/admin/subcategories', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/subcategories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/subcategories/${id}`, { method: 'DELETE' }),
        },


        products: {
            list: async () => apiFetch<Product[]>('/admin/products'),
            create: async (data: any) => apiFetch('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/products/${id}`, { method: 'DELETE' }),
        },

        orders: {
            list: async () => apiFetch<Order[]>('/admin/orders'),
            updateStatus: async (id: number, status: string) =>
                apiFetch(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
            delete: async (id: number) => apiFetch(`/admin/orders/${id}`, { method: 'DELETE' }),
        },

        customers: {
            list: async () => apiFetch<CustomerDetail[]>('/admin/customers'),
            get: async (id: number) => apiFetch<CustomerDetail>(`/admin/customers/${id}`),
            update: async (id: number, data: any) => apiFetch(`/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/customers/${id}`, { method: 'DELETE' }),
        },

        coupons: {
            list: async () => apiFetch('/admin/coupons'),
            create: async (data: any) => apiFetch('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
            update: async (id: number, data: any) => apiFetch(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
            delete: async (id: number) => apiFetch(`/admin/coupons/${id}`, { method: 'DELETE' }),
        },

        settings: {
            get: async () => apiFetch<{ [key: string]: string }>('/admin/settings'),
            update: async (data: { [key: string]: string }) => apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
        },
    },
};

export default api;
