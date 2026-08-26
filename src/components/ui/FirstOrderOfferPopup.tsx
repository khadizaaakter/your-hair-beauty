import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Gift, Loader2, Sparkles, X } from 'lucide-react';
import { subscribeToNewsletter } from '../../lib/newsletter';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'yhb_first_order_offer_dismissed_v1';

export function FirstOrderOfferPopup() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (location.pathname !== '/') {
            return;
        }

        try {
            const dismissed = localStorage.getItem(STORAGE_KEY);
            if (dismissed === '1') {
                return;
            }

            const timer = window.setTimeout(() => {
                setIsOpen(true);
            }, 700);

            return () => window.clearTimeout(timer);
        } catch {
            // Ignore storage access errors and continue silently.
        }
    }, [location.pathname]);

    const close = () => {
        setIsOpen(false);
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch {
            // Ignore storage access errors and continue silently.
        }
    };

    const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const result = await subscribeToNewsletter(email, 'first-order-popup');

        if (result.success) {
            toast.success(result.message);
            setEmail('');
            close();
        } else {
            toast.error(result.message);
        }

        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-slate-950/65 backdrop-blur-[2px]"
                        onClick={close}
                    />

                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                            className="relative w-full max-w-md max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl border border-neon-pink/25 bg-white shadow-2xl"
                        >
                            <button
                                type="button"
                                onClick={close}
                                className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                aria-label="Close offer popup"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="bg-gradient-to-r from-neon-pink to-fuchsia-500 px-5 sm:px-6 py-4 sm:py-5 text-white">
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Welcome Offer
                                </div>
                                <h3 className="mt-3 text-[1.9rem] leading-tight sm:text-2xl font-display font-bold">
                                    Get 10% Off Your First Order
                                </h3>
                            </div>

                            <div className="px-5 sm:px-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 pt-4 sm:pt-5">
                                <p className="text-sm leading-6 text-slate-600">
                                    Enter your email and we will send instructions to create your account.
                                    Your first order discount is then applied automatically at checkout.
                                </p>

                                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                                    <div className="inline-flex items-center gap-2 font-semibold">
                                        <Gift className="h-4 w-4" />
                                        No code needed
                                    </div>
                                </div>

                                <form onSubmit={handleSubscribe} className="mt-5 space-y-3">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="Enter your email address"
                                        required
                                        enterKeyHint="done"
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-neon-pink focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl bg-neon-pink px-4 py-3 font-semibold text-white hover:bg-neon-pink/90 disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Joining...
                                            </span>
                                        ) : (
                                            'Join & Save 10%'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export default FirstOrderOfferPopup;
