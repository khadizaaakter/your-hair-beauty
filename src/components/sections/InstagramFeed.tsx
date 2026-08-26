
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

export function InstagramFeed() {
    return (
        <section className="py-16 px-4 bg-white border-t border-slate-100">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-pink-50 to-purple-50 p-10 rounded-3xl border border-pink-100 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-purple-500 to-neon-pink" />

                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md shadow-pink-200/50">
                        <Instagram className="w-10 h-10 text-neon-pink" />
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Join Our Community</h2>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto text-lg">
                        Follow <span className="font-semibold text-neon-pink">@yourhairandbeauty1</span> on Instagram for daily styling inspiration, exclusive offers, and behind-the-scenes looks. Tag us to get featured!
                    </p>

                    <a
                        href="https://www.instagram.com/yourhairandbeauty1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-pink to-pink-500 text-white font-bold rounded-full hover:from-pink-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-pink-500/40 hover:-translate-y-1"
                    >
                        <Instagram className="w-5 h-5" />
                        Follow Us on Instagram
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

export default InstagramFeed;
