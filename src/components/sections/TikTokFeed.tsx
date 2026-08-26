
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';

export function TikTokFeed() {
    return (
        <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
            <div className="max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white p-10 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f2fe] via-black to-[#fe0979]" />

                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Video className="w-10 h-10 text-black" />
                    </div>

                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Trending on TikTok</h2>
                    <p className="text-slate-600 mb-8 max-w-xl mx-auto text-lg">
                        Watch our latest videos, styling tutorials, and viral hair trends. Don't miss out on our TikTok-exclusive flash sales!
                    </p>

                    <a
                        href="https://www.tiktok.com/@yourhairandbeauty1?_r=1&_t=ZN-94DcnGT6U7D"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg hover:shadow-black/20 hover:-translate-y-1"
                    >
                        <Video className="w-5 h-5" />
                        Follow on TikTok
                    </a>
                </motion.div>
            </div>
        </section>
    );
}

export default TikTokFeed;
