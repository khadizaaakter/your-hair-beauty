import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribeToNewsletter } from '../../lib/newsletter';

export function NewsletterCTA() {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubscribing) return;

        setIsSubscribing(true);
        const result = await subscribeToNewsletter(email, 'newsletter-cta');
        if (result.success) {
            toast.success(result.message);
            setEmail('');
        } else {
            toast.error(result.message);
        }
        setIsSubscribing(false);
    };

    return (
        <section className="py-20 px-4 bg-neon-pink" style={{ background: 'linear-gradient(135deg, #ff1493 0%, #d10058 50%, #ad0049 100%)' }}>
            <div className="max-w-4xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white mb-4">

                        Get 10% Off Your First Order
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Subscribe to our newsletter for exclusive deals, new arrivals, and beauty tips delivered straight to your inbox.
                    </p>

                    {/* Email Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 px-5 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:border-white focus:outline-none backdrop-blur-sm"
                        />
                        <motion.button
                            type="submit"
                            disabled={isSubscribing}
                            className="px-6 py-3 bg-white text-neon-pink font-semibold rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </form>

                    <p className="text-white/60 text-sm">
                        By subscribing, you agree to our{' '}
                        <Link to="/privacy" className="underline hover:text-white">
                            Privacy Policy
                        </Link>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

export default NewsletterCTA;
