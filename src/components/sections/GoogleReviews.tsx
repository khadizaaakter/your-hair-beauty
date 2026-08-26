
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export function GoogleReviews() {
    const { getSetting } = useSettings();
    const reviewUrl = getSetting('google_review_url', 'https://g.page/r/CTlrynC6OrBbEBM/review');

    // Curated reviews from client
    const reviews = [
        {
            id: 1,
            name: "Sunny Oh",
            rating: 5,
            text: "Fantastic shop. I can't wait to visit again. Polite and helpful staff and welcoming atmosphere. I hope they have more EBIN products though, they are no.1 now in the market.",
            date: "Google Review"
        },
        {
            id: 2,
            name: "Jodelee Owusu",
            rating: 5,
            text: "Good customer service",
            date: "Google Review"
        },
        {
            id: 3,
            name: "Asma Jutt",
            rating: 5,
            text: "Staff services are very nice 👌",
            date: "Google Review"
        }
    ];

    return (
        <section className="py-16 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Star className="w-6 h-6 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-slate-600 uppercase tracking-widest">
                            Customer Reviews
                        </span>
                    </div>
                    <h2 className="section-title">What Our Clients Say</h2>
                    <p className="text-slate-600 mt-2 mb-6">Trusted by thousands of happy customers</p>
                    <a
                        href={reviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 font-medium rounded-full hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                        Leave a Review
                    </a>
                </motion.div>

                {/* Custom Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((review, i) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, idx) => (
                                    <Star
                                        key={idx}
                                        className={`w-4 h-4 ${idx < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-slate-700 mb-4 line-clamp-4">"{review.text}"</p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                <span className="font-semibold text-slate-900">{review.name}</span>
                                <span className="text-sm text-slate-400">{review.date}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default GoogleReviews;
