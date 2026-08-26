import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCcw, HelpCircle, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';

type Status =
    | 'PAID'
    | 'FAILED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'ERROR'
    | 'PROCESSING'
    | 'UNKNOWN';

export default function PaymentFailure() {
    const [searchParams] = useSearchParams();
    const ref = searchParams.get('ref');
    const [status, setStatus] = useState<Status>('FAILED');
    const [loading, setLoading] = useState<boolean>(Boolean(ref));

    useEffect(() => {
        let cancelled = false;

        const loadStatus = async () => {
            if (!ref) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.payments.getStatus(ref);
                if (!cancelled && response.success && response.data) {
                    setStatus(response.data.status);
                }
            } catch (error) {
                console.error('Failed to load payment status on failure page:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadStatus();

        return () => {
            cancelled = true;
        };
    }, [ref]);

    const isConfirmed = status === 'PAID';

    const message = (() => {
        switch (status) {
            case 'PAID':
                return 'Your payment is actually confirmed. You can continue safely.';
            case 'CANCELLED':
                return 'The payment session was cancelled. No charge was made.';
            case 'EXPIRED':
                return 'The payment session expired before completion. Please try again.';
            case 'ERROR':
                return 'We could not confirm payment completion from this redirect. Please retry or contact support if you were charged.';
            case 'PROCESSING':
                return 'Your payment is still processing. Please check status again shortly.';
            case 'UNKNOWN':
                return 'We could not find the payment status yet. Please retry checkout or contact support.';
            default:
                return 'Unfortunately, your payment could not be processed. Please try again with another method.';
        }
    })();

    return (
        <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isConfirmed ? 'bg-emerald-100' : 'bg-red-50'}`}>
                        {loading ? (
                            <Loader2 className="w-10 h-10 text-slate-500 animate-spin" />
                        ) : isConfirmed ? (
                            <CheckCircle className="w-10 h-10 text-emerald-600" />
                        ) : (
                            <XCircle className="w-10 h-10 text-red-600" />
                        )}
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 mb-4">
                        {isConfirmed ? 'Payment Confirmed' : 'Payment Not Confirmed'}
                    </h1>
                    <p className="text-slate-600 mb-8">{message}</p>

                    <div className="space-y-3">
                        {isConfirmed ? (
                            <Link to="/dashboard" className="btn-primary w-full flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                View My Order
                            </Link>
                        ) : (
                            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                Try Payment Again
                            </Link>
                        )}
                        <Link to="/help" className="btn-outline w-full flex items-center justify-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Need Help?
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
