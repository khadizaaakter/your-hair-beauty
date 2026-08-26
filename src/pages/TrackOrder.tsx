import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
    Search,
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowLeft,
    Loader2,
    Mail,
    MapPin,
    CreditCard,
} from 'lucide-react';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';

interface TrackedOrder {
    orderCode: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    shippingAddress: any;
    items: any[];
    createdAt: string;
    updatedAt: string;
}

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export function TrackOrder() {
    const [orderCode, setOrderCode] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<TrackedOrder | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { formatPrice } = useCurrency();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderCode.trim() || !email.trim()) {
            toast.error('Please enter both order code and email');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOrder(null);

        try {
            const response = await api.orders.track(orderCode.trim(), email.trim());
            if (response.success) {
                setOrder(response.data);
            } else {
                setError(response.message || 'Order not found');
            }
        } catch (err: any) {
            setError(err.message || 'Unable to find your order. Please check your details and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        const normalizedStatus = status === 'pending_payment'
            ? 'pending'
            : status === 'paid'
                ? 'processing'
                : status === 'payment_failed'
                    ? 'pending'
                    : status;
        const index = statusSteps.findIndex(s => s.key === normalizedStatus);
        return index >= 0 ? index : 0;
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'paid':
            case 'SUCCESS':
                return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' };
            case 'pending':
            case 'pending_payment':
                return { label: 'Pending', className: 'bg-amber-100 text-amber-700' };
            case 'failed':
            case 'payment_failed':
                return { label: 'Failed', className: 'bg-red-100 text-red-700' };
            case 'cancelled':
                return { label: 'Cancelled', className: 'bg-slate-200 text-slate-700' };
            default:
                return { label: status, className: 'bg-slate-100 text-slate-600' };
        }
    };

    return (
        <>
            <Helmet>
                <title>Track Your Order | Your Hair and Beauty</title>
                <meta name="description" content="Track your guest order status at Your Hair and Beauty" />
            </Helmet>

            <main className="min-h-screen bg-slate-50 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-neon-pink mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                        <h1 className="text-3xl font-display font-bold text-slate-900">Track Your Order</h1>
                        <p className="text-slate-600 mt-2">Enter your order code and email to check your order status.</p>
                    </div>

                    {/* Search Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8"
                    >
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Order Code</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={orderCode}
                                        onChange={(e) => setOrderCode(e.target.value)}
                                        placeholder="e.g. ORD-171..."
                                        className="input-field pl-10"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="The email used during checkout"
                                        className="input-field pl-10"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <Search className="w-5 h-5" />
                                        Track Order
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Order Result */}
                    <AnimatePresence mode="wait">
                        {order && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-6"
                            >
                                {/* Order Header */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-slate-500">Order Reference</p>
                                            <p className="font-mono font-bold text-lg text-slate-900">{order.orderCode}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Total</p>
                                            <p className="font-bold text-lg text-slate-900">{formatPrice(Number(order.totalAmount || 0))}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPaymentBadge(order.paymentStatus).className}`}>
                                            <CreditCard className="w-3 h-3 inline mr-1" />
                                            {getPaymentBadge(order.paymentStatus).label}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Progress Tracker */}
                                    <div className="relative">
                                        <div className="flex items-center justify-between">
                                            {statusSteps.map((step, index) => {
                                                const currentIndex = getStatusIndex(order.status);
                                                const isActive = index <= currentIndex;
                                                const isCurrent = index === currentIndex;

                                                return (
                                                    <div key={step.key} className="flex flex-col items-center relative z-10">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive
                                                                ? 'bg-neon-pink border-neon-pink text-white'
                                                                : 'bg-white border-slate-200 text-slate-400'
                                                            } ${isCurrent ? 'ring-4 ring-neon-pink/20' : ''}`}>
                                                            <step.icon className="w-5 h-5" />
                                                        </div>
                                                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-neon-pink' : 'text-slate-400'}`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {/* Connecting line */}
                                        <div className="absolute top-5 left-5 right-5 h-0.5 bg-slate-200 -z-0">
                                            <div
                                                className="h-full bg-neon-pink transition-all duration-500"
                                                style={{ width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="font-semibold text-slate-900 mb-4">Order Items</h3>
                                    <div className="space-y-3">
                                        {order.items.map((item: any, index: number) => (
                                            <div key={index} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-slate-900 text-sm truncate">{item.name}</p>
                                                    {Array.isArray(item.selected_variants) && item.selected_variants.length > 0 && (
                                                        <p className="text-xs text-slate-500">
                                                            {item.selected_variants.map((variant: any) => `${variant.name}: ${variant.value}`).join(' | ')}
                                                        </p>
                                                    )}
                                                    {(!Array.isArray(item.selected_variants) || item.selected_variants.length === 0) && item.variant_name && item.variant_value && (
                                                        <p className="text-xs text-slate-500">{item.variant_name}: {item.variant_value}</p>
                                                    )}
                                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-semibold text-sm text-slate-900">
                                                    {formatPrice(Number(item.price || 0) * item.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {order.shippingAddress && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MapPin className="w-5 h-5 text-neon-pink" />
                                            <h3 className="font-semibold text-slate-900">Shipping Address</h3>
                                        </div>
                                        <div className="text-sm text-slate-600 space-y-1">
                                            <p className="font-medium text-slate-900">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                            <p>{order.shippingAddress.address}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
                                            <p>{order.shippingAddress.country}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Need Help */}
                                <div className="text-center py-4">
                                    <p className="text-sm text-slate-500">
                                        Need help with your order?{' '}
                                        <Link to="/contact" className="text-neon-pink font-semibold hover:underline">
                                            Contact Us
                                        </Link>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </>
    );
}

export default TrackOrder;
