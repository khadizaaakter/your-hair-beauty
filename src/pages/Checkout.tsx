import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import {
    ArrowLeft,
    BadgeCheck,
    Gift,
    Loader2,
    Lock,
    ShoppingBag,
    TicketPercent,
    Truck,
    X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useSettings } from '../context/SettingsContext';
import { api, type OrderPricingPreview } from '../lib/api';

const shippingSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(7, 'Valid phone number is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    postcode: z.string().min(3, 'Postcode is required'),
    country: z.string().min(2, 'Country is required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

function splitCustomerName(fullName: string | undefined): { firstName: string; lastName: string } {
    const normalized = String(fullName || '').trim();
    if (!normalized) return { firstName: '', lastName: '' };
    const parts = normalized.split(/\s+/);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
    };
}

function extractPostcode(value: string): string {
    const input = String(value || '');
    const uk = input.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/i);
    if (uk) return uk[1].toUpperCase();
    const us = input.match(/\b(\d{5}(?:-\d{4})?)\b/);
    if (us) return us[1];
    const ca = input.match(/\b([A-Z]\d[A-Z][ -]?\d[A-Z]\d)\b/i);
    if (ca) return ca[1].toUpperCase();
    return '';
}

function inferCountry(value: string): string {
    const input = String(value || '').toLowerCase();
    if (/united states|\busa\b/.test(input)) return 'United States';
    if (/\bcanada\b/.test(input)) return 'Canada';
    return 'United Kingdom';
}

function inferCityFromAddress(value: string, postcode: string): string {
    const segments = String(value || '')
        .split(',')
        .map((segment) => segment.trim())
        .filter(Boolean);
    if (segments.length < 2) return '';

    const postcodeNormalized = postcode.trim().toLowerCase();
    const blacklisted = /^(united kingdom|uk|england|scotland|wales|northern ireland|united states|usa|canada)$/i;
    const candidates = segments.filter((segment) => {
        const lower = segment.toLowerCase();
        if (blacklisted.test(segment)) return false;
        if (!postcodeNormalized) return true;
        return !lower.includes(postcodeNormalized);
    });

    return candidates.length > 1 ? candidates[candidates.length - 1] : '';
}

function parseNumericSetting(value: string, fallback: number): number {
    const cleaned = String(value || '')
        .trim()
        .replace(/[^0-9,.-]/g, '')
        .replace(/,/g, '.');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
}

export function Checkout() {
    const { items, total } = useCart();
    const { isAuthenticated, user } = useAuth();
    const { formatPrice, currency, rates } = useCurrency();
    const { getSetting } = useSettings();

    const [isProcessing, setIsProcessing] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [couponInput, setCouponInput] = useState('');
    const [appliedCouponCode, setAppliedCouponCode] = useState<string>('');
    const [couponFeedback, setCouponFeedback] = useState<string>('');
    const [couponError, setCouponError] = useState<string>('');
    const [pricingPreview, setPricingPreview] = useState<OrderPricingPreview | null>(null);

    const freeShippingThreshold = Math.max(0, parseNumericSetting(getSetting('free_shipping_threshold', '70'), 70));
    const standardDeliveryPrice = Math.max(0, parseNumericSetting(getSetting('delivery_charge', '3.99'), 3.99));

    const {
        register,
        handleSubmit,
        watch,
        getValues,
        reset,
        formState: { errors },
    } = useForm<ShippingFormData>({
        resolver: zodResolver(shippingSchema),
        defaultValues: user
            ? {
                firstName: splitCustomerName(user.name).firstName,
                lastName: splitCustomerName(user.name).lastName,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                country: 'United Kingdom',
            }
            : {
                country: 'United Kingdom',
            },
    });

    const emailValue = watch('email');

    const buildCheckoutItems = useCallback(() => {
        return items.map((item) => {
            const selectedVariants = item.selectedVariants && item.selectedVariants.length > 0
                ? item.selectedVariants
                : (item.variant ? [item.variant] : []);
            const variantIds = selectedVariants
                .map((variant) => Number(variant.id))
                .filter((id) => Number.isInteger(id) && id > 0);

            return {
                productId: item.product.id,
                variantId: item.variant?.id,
                variantIds: variantIds.length > 0 ? variantIds : undefined,
                quantity: item.quantity,
            };
        });
    }, [items]);

    useEffect(() => {
        if (user) {
            const split = splitCustomerName(user.name);
            const accountAddress = String(user.address || '').trim();
            const inferredPostcode = extractPostcode(accountAddress);
            const inferredCountry = inferCountry(accountAddress);
            const inferredCity = inferCityFromAddress(accountAddress, inferredPostcode);

            reset({
                firstName: split.firstName,
                lastName: split.lastName,
                email: user.email || '',
                phone: user.phone || '',
                address: accountAddress,
                city: inferredCity,
                postcode: inferredPostcode,
                country: inferredCountry || 'United Kingdom',
            });
            return;
        }

        try {
            const saved = localStorage.getItem('yhb_last_shipping');
            if (!saved) return;
            const parsed = JSON.parse(saved);
            if (parsed && parsed.firstName && parsed.address && parsed.postcode) {
                reset({
                    firstName: parsed.firstName || '',
                    lastName: parsed.lastName || '',
                    email: parsed.email || user?.email || '',
                    phone: parsed.phone || '',
                    address: parsed.address || '',
                    city: parsed.city || '',
                    postcode: parsed.postcode || '',
                    country: parsed.country || 'United Kingdom',
                });
            }
        } catch (e) {
            console.error('Failed to load saved checkout address', e);
        }
    }, [reset, user]);

    const refreshPricingPreview = useCallback(
        async (couponCode?: string, showCouponFeedback = false) => {
            if (items.length === 0) return;

            setIsPreviewLoading(true);
            try {
                const response = await api.orders.preview({
                    items: buildCheckoutItems(),
                    shippingAddress: getValues(),
                    couponCode: couponCode || undefined,
                });

                if (!response.success || !response.data) {
                    throw new Error(response.message || 'Failed to calculate totals');
                }

                setPricingPreview(response.data);

                if (showCouponFeedback) {
                    if (couponCode) {
                        if (response.data.coupon?.valid) {
                            const normalizedCode = response.data.coupon.code || couponCode.toUpperCase();
                            setAppliedCouponCode(normalizedCode);
                            setCouponInput(normalizedCode);
                            setCouponFeedback(response.data.coupon?.message || 'Coupon applied');
                            setCouponError('');
                        } else {
                            setAppliedCouponCode('');
                            setCouponFeedback('');
                            setCouponError(response.data.coupon?.message || 'Invalid coupon code');
                        }
                    } else {
                        setCouponFeedback('');
                        setCouponError('');
                    }
                }
            } catch (previewError: any) {
                if (showCouponFeedback && couponCode) {
                    setAppliedCouponCode('');
                    setCouponFeedback('');
                    setCouponError(previewError?.message || 'Unable to validate coupon');
                }
            } finally {
                setIsPreviewLoading(false);
            }
        },
        [buildCheckoutItems, getValues]
    );

    useEffect(() => {
        if (items.length === 0) return;
        const timer = setTimeout(() => {
            void refreshPricingPreview(appliedCouponCode || undefined, false);
        }, 350);
        return () => clearTimeout(timer);
    }, [items, emailValue, appliedCouponCode, refreshPricingPreview]);

    const handleApplyCoupon = async () => {
        const code = couponInput.trim().toUpperCase();
        if (!code) {
            setCouponError('Enter a coupon code');
            setCouponFeedback('');
            return;
        }
        await refreshPricingPreview(code, true);
    };

    const handleRemoveCoupon = async () => {
        setCouponInput('');
        setAppliedCouponCode('');
        setCouponFeedback('');
        setCouponError('');
        await refreshPricingPreview(undefined, false);
    };

    const onSubmit = async (data: ShippingFormData) => {
        if (items.length === 0) return;

        setIsProcessing(true);
        setError(null);

        try {
            const split = splitCustomerName(user?.name);
            const shippingPayload: ShippingFormData = isAuthenticated
                ? {
                    ...data,
                    firstName: data.firstName || split.firstName || '',
                    lastName: data.lastName || split.lastName || '',
                    email: data.email || user?.email || '',
                    phone: data.phone || user?.phone || '',
                    address: data.address || user?.address || '',
                    country: data.country || 'United Kingdom',
                }
                : data;

            localStorage.setItem('yhb_last_shipping', JSON.stringify(shippingPayload));

            const previewResponse = await api.orders.preview({
                items: buildCheckoutItems(),
                shippingAddress: shippingPayload,
                couponCode: appliedCouponCode || undefined,
            });

            if (!previewResponse.success || !previewResponse.data) {
                throw new Error(previewResponse.message || 'Unable to calculate checkout total');
            }
            setPricingPreview(previewResponse.data);

            const orderResponse = await api.orders.create({
                items: buildCheckoutItems(),
                shippingAddress: shippingPayload,
                couponCode: appliedCouponCode || undefined,
                currency,
                exchangeRate: rates[currency] || 1.0,
            });

            if (!orderResponse.success || !orderResponse.data) {
                throw new Error(orderResponse.message || 'Failed to create order');
            }

            setOrderNumber(String(orderResponse.data.orderId));

            const sessionResponse = await api.payments.createSession(orderResponse.data.orderId);
            if (sessionResponse.success && sessionResponse.data?.url) {
                window.location.href = sessionResponse.data.url;
                return;
            }

            throw new Error(sessionResponse.message || 'Failed to initialize payment session');
        } catch (submitError: any) {
            setError(submitError?.message || 'Failed to process checkout. Please try again.');
            setIsProcessing(false);
        }
    };

    const fallbackDelivery = freeShippingThreshold > 0 && total >= freeShippingThreshold ? 0 : standardDeliveryPrice;
    const effectivePricing = useMemo(() => {
        if (pricingPreview) return pricingPreview;
        return {
            subtotal: total,
            deliveryFee: fallbackDelivery,
            firstOrderDiscount: 0,
            couponDiscount: 0,
            totalDiscount: 0,
            total: total + fallbackDelivery,
            firstOrderEligible: false,
            freeShippingThreshold,
            coupon: { code: null, valid: false },
        } as OrderPricingPreview;
    }, [fallbackDelivery, freeShippingThreshold, pricingPreview, total]);

    if (items.length === 0 && !orderNumber) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center px-4">
                    <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h1>
                    <p className="text-slate-600 mb-4">Add some items to continue to checkout.</p>
                    <Link to="/shop" className="btn-primary">
                        Shop Now
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <>
            <Helmet>
                <title>Checkout | Your Hair and Beauty</title>
                <meta name="description" content="Fast and secure checkout powered by Worldpay." />
            </Helmet>

            <main className="min-h-screen bg-slate-50 py-6 md:py-10">
                <div className="max-w-6xl mx-auto px-4">
                    <header className="mb-6 md:mb-8">
                        <Link to="/shop" className="inline-flex items-center gap-2 text-slate-600 hover:text-neon-pink mb-3">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Shop
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-slate-900">Checkout</h1>
                        <p className="text-slate-500 mt-1">Simple, secure payment powered by Worldpay</p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <section className="lg:col-span-2 space-y-5">
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            {!isAuthenticated && (
                                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold underline">
                                        Log in
                                    </Link>
                                </div>
                            )}

                            {isAuthenticated && (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    Shipping details auto-filled from your account. You can edit them before payment.
                                </div>
                            )}

                            {effectivePricing.firstOrderDiscount > 0 && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                                    <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                        <Gift className="w-4 h-4" />
                                        New customer 10% off applied
                                    </div>
                                    <p className="text-sm text-emerald-700/90 mt-1">
                                        You are getting {formatPrice(effectivePricing.firstOrderDiscount)} off your first order.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7 shadow-sm">
                                <div className="flex items-center justify-between mb-5">
                                    <h2 className="text-xl font-semibold text-slate-900">Shipping Details</h2>
                                    <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                                        <Lock className="w-4 h-4 text-neon-pink" />
                                        Secure
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                        <input {...register('firstName')} className="input-field" autoComplete="given-name" />
                                        {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                        <input {...register('lastName')} className="input-field" autoComplete="family-name" />
                                        {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input {...register('email')} type="email" className="input-field" autoComplete="email" />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                        <input {...register('phone')} type="tel" className="input-field" autoComplete="tel" />
                                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <input {...register('address')} className="input-field" autoComplete="shipping street-address" />
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                                        <input {...register('city')} className="input-field" autoComplete="shipping address-level2" />
                                        {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Postcode</label>
                                        <input {...register('postcode')} className="input-field" autoComplete="shipping postal-code" />
                                        {errors.postcode && <p className="mt-1 text-sm text-red-500">{errors.postcode.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                                        <select {...register('country')} className="input-field" autoComplete="shipping country">
                                            <option value="United Kingdom">United Kingdom</option>
                                            <option value="United States">United States</option>
                                            <option value="Canada">Canada</option>
                                        </select>
                                        {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>}
                                    </div>
                                </div>

                                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TicketPercent className="w-4 h-4 text-neon-pink" />
                                        <p className="font-semibold text-slate-900">Coupon Code</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code"
                                            className="input-field flex-1 uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyCoupon}
                                            disabled={isPreviewLoading}
                                            className="btn-outline whitespace-nowrap"
                                        >
                                            {isPreviewLoading ? 'Checking...' : 'Apply Coupon'}
                                        </button>
                                        {appliedCouponCode && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-4 py-3 font-semibold text-slate-700 hover:border-red-300 hover:text-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    {couponFeedback && <p className="mt-2 text-sm text-emerald-600">{couponFeedback}</p>}
                                    {couponError && <p className="mt-2 text-sm text-red-500">{couponError}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full mt-6 btn-primary inline-flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Redirecting to payment...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            Pay {formatPrice(effectivePricing.total)}
                                        </>
                                    )}
                                </button>
                            </form>
                        </section>

                        <aside className="space-y-4">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                                <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                    {items.map((item) => {
                                        const selectedVariants = item.selectedVariants && item.selectedVariants.length > 0
                                            ? item.selectedVariants
                                            : (item.variant ? [item.variant] : []);
                                        const adjustment = selectedVariants.reduce(
                                            (sum, variant) => sum + Number(variant.price_adjustment || 0),
                                            0
                                        );
                                        const variantImage = selectedVariants.find((variant) => variant.image)?.image;
                                        const unit = Number(item.product.sale_price || item.product.price) + adjustment;
                                        return (
                                            <div key={item.id} className="flex gap-3">
                                                <img
                                                    src={variantImage || item.variant?.image || item.product.images?.[0] || 'https://via.placeholder.com/400'}
                                                    alt={item.product.name}
                                                    className="w-14 h-14 rounded-lg object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.product.name}</p>
                                                    {selectedVariants.length > 0 && (
                                                        <p className="text-xs text-slate-500">
                                                            {selectedVariants.map((variant) => `${variant.name}: ${variant.value}`).join(' | ')}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                        <p className="text-sm font-semibold text-slate-900">{formatPrice(unit * item.quantity)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="text-slate-900">{formatPrice(effectivePricing.subtotal)}</span>
                                    </div>

                                    {effectivePricing.firstOrderDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>First-order discount (10%)</span>
                                            <span>-{formatPrice(effectivePricing.firstOrderDiscount)}</span>
                                        </div>
                                    )}

                                    {effectivePricing.couponDiscount > 0 && (
                                        <div className="flex justify-between text-emerald-600">
                                            <span>Coupon {effectivePricing.coupon?.code ? `(${effectivePricing.coupon.code})` : ''}</span>
                                            <span>-{formatPrice(effectivePricing.couponDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Delivery</span>
                                        <span className="text-slate-900">
                                            {effectivePricing.deliveryFee === 0 ? 'FREE' : formatPrice(effectivePricing.deliveryFee)}
                                        </span>
                                    </div>

                                    <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between text-lg font-bold text-slate-900">
                                        <span>Total</span>
                                        <span>{formatPrice(effectivePricing.total)}</span>
                                    </div>
                                </div>

                                {isPreviewLoading && (
                                    <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        Updating totals...
                                    </div>
                                )}
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold">
                                    <Truck className="w-4 h-4 text-neon-pink" />
                                    Delivery
                                </div>
                                <p className="text-sm text-slate-600">
                                    Free delivery on orders over {formatPrice(freeShippingThreshold)}.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-neon-pink/20 bg-neon-pink/5 p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-slate-900 font-semibold">
                                    <BadgeCheck className="w-4 h-4 text-neon-pink" />
                                    Secure Payment
                                </div>
                                <p className="text-sm text-slate-600">
                                    Your payment is processed on Worldpay's secure hosted page.
                                </p>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}

export default Checkout;
