import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Loader2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';

type PollState = 'polling' | 'PAID' | 'TIMEOUT' | 'UNKNOWN' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'ERROR';

interface PaymentSuccessProps {
    mode?: 'success' | 'pending';
}

export default function PaymentSuccess({ mode = 'success' }: PaymentSuccessProps) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const reference = searchParams.get('ref');
    const { clearCart } = useCart();

    const [state, setState] = useState<PollState>('polling');
    const [orderId, setOrderId] = useState<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const copy = useMemo(() => {
        if (mode === 'pending') {
            return {
                title: 'Payment pending - confirming status...',
                description: 'Your bank is still finalizing the response. We are checking for an update every few seconds.',
            };
        }

        return {
            title: 'Thanks - confirming your payment...',
            description: 'Please wait while we verify your transaction with Worldpay.',
        };
    }, [mode]);

    useEffect(() => {
        if (!reference) {
            setState('UNKNOWN');
            return;
        }

        let stopped = false;
        let inFlight = false;
        const startedAt = Date.now();
        const uiTimeoutMs = 60_000;
        const hardStopMs = 30 * 60_000;
        const fastPollMs = 1_000;
        const slowPollMs = 2_000;

        const clearPendingTimeout = () => {
            if (timeoutRef.current) {
                window.clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };

        const stopPolling = () => {
            stopped = true;
            clearPendingTimeout();
        };

        const scheduleNextPoll = (delayMs: number) => {
            clearPendingTimeout();
            timeoutRef.current = window.setTimeout(() => {
                void poll();
            }, delayMs);
        };

        const poll = async () => {
            if (stopped || inFlight) return;
            inFlight = true;

            try {
                const response = await api.payments.getStatus(reference);
                if (stopped) return;

                if (response.success && response.data) {
                    if (typeof response.data.orderId === 'number') {
                        setOrderId(response.data.orderId);
                    }

                    const backendStatus = response.data.status;
                    if (backendStatus === 'PAID') {
                        clearCart();
                        setState('PAID');
                        stopPolling();
                        return;
                    }

                    if (
                        backendStatus === 'FAILED' ||
                        backendStatus === 'CANCELLED' ||
                        backendStatus === 'EXPIRED' ||
                        backendStatus === 'ERROR'
                    ) {
                        setState(backendStatus);
                        stopPolling();
                        return;
                    }
                }
            } catch (error) {
                console.error('Payment status polling failed:', error);
            } finally {
                inFlight = false;
            }

            const elapsed = Date.now() - startedAt;

            if (elapsed >= hardStopMs) {
                setState('UNKNOWN');
                stopPolling();
                return;
            }

            if (elapsed >= uiTimeoutMs) {
                setState((prev) => (prev === 'PAID' ? prev : 'TIMEOUT'));
                scheduleNextPoll(slowPollMs);
                return;
            }

            scheduleNextPoll(fastPollMs);
        };

        const runImmediatePoll = () => {
            clearPendingTimeout();
            void poll();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                runImmediatePoll();
            }
        };

        window.addEventListener('focus', runImmediatePoll);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        void poll();

        return () => {
            stopPolling();
            window.removeEventListener('focus', runImmediatePoll);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [clearCart, reference]);

    useEffect(() => {
        if (!reference) return;

        if (state === 'FAILED') {
            navigate(`/pay/failure?ref=${encodeURIComponent(reference)}`, { replace: true });
        } else if (state === 'CANCELLED') {
            navigate(`/pay/cancel?ref=${encodeURIComponent(reference)}`, { replace: true });
        } else if (state === 'EXPIRED') {
            navigate(`/pay/expiry?ref=${encodeURIComponent(reference)}`, { replace: true });
        } else if (state === 'ERROR') {
            navigate(`/pay/error?ref=${encodeURIComponent(reference)}`, { replace: true });
        }
    }, [navigate, reference, state]);

    return (
        <main className="min-h-[70vh] flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <AnimatePresence mode="wait">
                    {state === 'polling' && (
                        <motion.div
                            key="polling"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-4">{copy.title}</h1>
                            <p className="text-slate-600 mb-6">{copy.description}</p>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span>Checking payment status...</span>
                            </div>
                        </motion.div>
                    )}

                    {state === 'PAID' && (
                        <motion.div
                            key="paid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-4">Payment confirmed</h1>
                            <p className="text-slate-600 mb-8">
                                Your order is now confirmed and being processed.
                            </p>
                            <div className="space-y-3">
                                <Link to="/shop" className="btn-primary block w-full text-center hover:scale-100 active:scale-100 flex items-center justify-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Continue Shopping
                                </Link>
                                <Link to={orderId ? '/dashboard' : '/track-order'} className="btn-outline block w-full text-center hover:scale-100 active:scale-100 flex items-center justify-center gap-2">
                                    View Order Status
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {(state === 'TIMEOUT' || state === 'UNKNOWN') && (
                        <motion.div
                            key="timeout"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10 text-amber-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-4">Still confirming</h1>
                            <p className="text-slate-600 mb-8">
                                We are still waiting for final confirmation. We will update your order shortly.
                            </p>
                            <div className="space-y-3">
                                <Link to={orderId ? '/dashboard' : '/track-order'} className="btn-primary block w-full text-center hover:scale-100 active:scale-100">
                                    Check Order Status
                                </Link>
                                <Link to="/help" className="btn-outline block w-full text-center hover:scale-100 active:scale-100">
                                    Contact Support
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
