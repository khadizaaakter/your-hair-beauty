import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export function OrderFailure() {
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get('orderCode');

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>

                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">
                        Payment Failed
                    </h1>

                    <p className="text-slate-600 mb-8">
                        We were unable to process your payment. This could be due to insufficient funds, an expired card, or a declined transaction.
                    </p>

                    {orderCode && (
                        <div className="bg-slate-50 rounded-xl p-4 mb-8">
                            <span className="text-slate-500 text-sm">Reference: </span>
                            <span className="font-mono font-medium text-slate-900">{orderCode}</span>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/checkout" className="btn-primary flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </Link>
                        <Link to="/contact" className="btn-outline flex items-center justify-center gap-2">
                            Contact Support
                        </Link>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
