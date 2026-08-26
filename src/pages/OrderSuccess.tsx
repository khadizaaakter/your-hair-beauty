import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, UserPlus, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../context/CurrencyContext';

export function OrderSuccess() {
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get('orderCode');
    const { clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { formatPrice } = useCurrency();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
    const [orderDetails, setOrderDetails] = useState<any>(null);

    // Guest account creation state
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [guestPassword, setGuestPassword] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [guestAddress, setGuestAddress] = useState('');
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    useEffect(() => {
        if (orderCode) {
            checkStatus();
            clearCart();

            // Pre-fill from localStorage shipping data
            if (!isAuthenticated) {
                try {
                    const saved = localStorage.getItem('yhb_last_shipping');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        setGuestName(`${parsed.firstName || ''} ${parsed.lastName || ''}`.trim());
                        setGuestEmail(parsed.email || '');
                        setGuestPhone(parsed.phone || '');
                        const addressParts = [
                            parsed.address1,
                            parsed.address2,
                            parsed.city,
                            parsed.postcode,
                            parsed.country,
                        ].filter(Boolean);
                        setGuestAddress(addressParts.join(', '));
                    }
                } catch { /* ignore */ }
            }
        } else {
            setStatus('failed');
        }
    }, [orderCode]);

    const checkStatus = async () => {
        try {
            if (!orderCode) return;
            const res = await api.payments.checkStatus(orderCode);
            if (res.success) {
                setOrderDetails(res.data);
                if (res.data?.paymentStatus === 'paid' || res.data?.paymentStatus === 'SUCCESS') {
                    setStatus('success');
                } else {
                    setStatus('pending');
                }
            }
        } catch (error) {
            console.error('Failed to check status:', error);
            setStatus('pending');
        }
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guestName || !guestEmail || !guestPassword || !guestPhone || !guestAddress) {
            toast.error('Please fill in all fields');
            return;
        }
        if (guestPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsCreatingAccount(true);
        try {
            const res = await api.auth.register({
                name: guestName,
                email: guestEmail,
                phone: guestPhone,
                address: guestAddress,
                password: guestPassword,
            });

            if (res.success) {
                toast.success('Account created! Please check your email to verify.');
                setShowCreateAccount(false);

                // After verification, the user can link the order via /orders/link-account
                // Store orderCode for potential linking after login
                localStorage.setItem('yhb_guest_order_link', orderCode || '');

                navigate(`/login?email=${encodeURIComponent(guestEmail)}`);
            } else {
                toast.error(res.message || 'Failed to create account');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to create account');
        } finally {
            setIsCreatingAccount(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">
                        Order Placed Successfully!
                    </h1>

                    <p className="text-slate-600 mb-8">
                        Thank you for your purchase. Your order has been received and is being processed.
                    </p>

                    <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500">Order Reference</span>
                            <span className="font-mono font-medium text-slate-900">{orderCode}</span>
                        </div>
                        {orderDetails && (
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-500">Amount</span>
                                <span className="font-medium text-slate-900">{formatPrice(Number(orderDetails.total || 0))}</span>
                            </div>
                        )}
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-500">Status</span>
                            <span className={`font-medium ${status === 'success' ? 'text-emerald-600' : 'text-amber-600'
                                }`}>
                                {status === 'success' ? 'Payment Confirmed' : 'Payment Pending Confirmation'}
                            </span>
                        </div>
                        {status === 'pending' && (
                            <div className="mt-4 text-xs text-slate-500 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                Note: Payment is being verified. You will receive a confirmation email shortly.
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/shop" className="btn-primary flex items-center justify-center gap-2">
                            <ShoppingBag className="w-4 h-4" />
                            Continue Shopping
                        </Link>
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="btn-outline flex items-center justify-center gap-2">
                                View Orders
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <Link to="/track-order" className="btn-outline flex items-center justify-center gap-2">
                                <Search className="w-4 h-4" />
                                Track Your Order
                            </Link>
                        )}
                    </div>
                </motion.div>

                {/* Guest Account Creation Card */}
                {!isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6"
                    >
                        {!showCreateAccount ? (
                            <div className="text-center">
                                <div className="w-12 h-12 bg-neon-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserPlus className="w-6 h-6 text-neon-pink" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-2">Save your details for next time?</h3>
                                <p className="text-sm text-slate-600 mb-4">
                                    Create an account to track orders, get faster checkout, and receive exclusive member offers.
                                </p>
                                <button
                                    onClick={() => setShowCreateAccount(true)}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Create My Account
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-4 text-center">Create Your Account</h3>
                                <form onSubmit={handleCreateAccount} className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={guestPhone}
                                            onChange={(e) => setGuestPhone(e.target.value)}
                                            className="input-field"
                                            placeholder="+44 20 8318 0999"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                        <textarea
                                            value={guestAddress}
                                            onChange={(e) => setGuestAddress(e.target.value)}
                                            className="input-field min-h-[88px]"
                                            placeholder="Street, city, postcode"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Choose a Password</label>
                                        <input
                                            type="password"
                                            value={guestPassword}
                                            onChange={(e) => setGuestPassword(e.target.value)}
                                            className="input-field"
                                            placeholder="Min. 6 characters"
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateAccount(false)}
                                            className="btn-outline flex-1"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isCreatingAccount}
                                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                                        >
                                            {isCreatingAccount ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Creating...
                                                </>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </main>
    );
}
