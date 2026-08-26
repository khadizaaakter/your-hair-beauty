import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ShoppingCart, HelpCircle, XCircle, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';

interface StatusPageProps {
    type: 'cancel' | 'error' | 'expiry';
}

type BackendStatus =
    | 'PAID'
    | 'PROCESSING'
    | 'FAILED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'ERROR'
    | 'UNKNOWN';

export default function PaymentStatus({ type }: StatusPageProps) {
    const [searchParams] = useSearchParams();
    const ref = searchParams.get('ref');
    const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(type === 'error' && Boolean(ref));

    useEffect(() => {
        if (!ref || type !== 'error') {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const check = async () => {
            try {
                const response = await api.payments.getStatus(ref);
                if (!cancelled && response.success && response.data) {
                    setBackendStatus(response.data.status);
                }
            } catch (error) {
                console.error('Failed to verify payment status on error page:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        check();

        return () => {
            cancelled = true;
        };
    }, [ref, type]);

    const resolved = useMemo(() => {
        if (backendStatus === 'PAID') {
            return {
                icon: <CheckCircle className="w-10 h-10 text-emerald-600" />,
                bg: 'bg-emerald-100',
                title: 'Payment Confirmed',
                description: 'The payment completed successfully. Your order is confirmed.',
                primaryHref: '/dashboard',
                primaryLabel: 'View Order',
                secondaryHref: '/shop',
                secondaryLabel: 'Continue Shopping',
            };
        }

        const content = {
            cancel: {
                icon: <XCircle className="w-10 h-10 text-slate-600" />,
                bg: 'bg-slate-50',
                title: 'Payment Cancelled',
                description: 'Your payment session was cancelled. No charge was made.',
            },
            error: {
                icon: <AlertCircle className="w-10 h-10 text-red-600" />,
                bg: 'bg-red-50',
                title: 'Could Not Confirm Payment',
                description: "We couldn't confirm completion from this redirect. If you were charged, we'll reconcile it from webhook updates.",
            },
            expiry: {
                icon: <Clock className="w-10 h-10 text-amber-600" />,
                bg: 'bg-amber-50',
                title: 'Session Expired',
                description: 'Your secure payment session expired. Please restart checkout.',
            },
        } as const;

        return {
            ...content[type],
            primaryHref: '/checkout',
            primaryLabel: 'Return to Checkout',
            secondaryHref: '/help',
            secondaryLabel: 'Need Help?',
        };
    }, [backendStatus, type]);

    return (
        <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className={`w-20 h-20 ${resolved.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {loading ? <Loader2 className="w-10 h-10 text-slate-500 animate-spin" /> : resolved.icon}
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-4">{resolved.title}</h1>
                    <p className="text-slate-600 mb-8">{resolved.description}</p>

                    {type === 'error' && backendStatus === 'PROCESSING' && (
                        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-100 p-3 text-sm text-amber-700">
                            Payment is still processing. Please check your order status shortly.
                        </div>
                    )}

                    <div className="space-y-3">
                        <Link to={resolved.primaryHref} className="btn-primary block w-full text-center hover:scale-100 active:scale-100 flex items-center justify-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            {resolved.primaryLabel}
                        </Link>
                        <Link to={resolved.secondaryHref} className="btn-outline block w-full text-center hover:scale-100 active:scale-100 flex items-center justify-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            {resolved.secondaryLabel}
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
