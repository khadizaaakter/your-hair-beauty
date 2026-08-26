import { motion } from 'framer-motion';
import { Truck, Shield, CreditCard, Headphones } from 'lucide-react';

const features = [
    {
        icon: Truck,
        title: 'Free Shipping',
        description: 'On orders over £70',
    },
    {
        icon: Shield,
        title: '100% Authentic',
        description: 'Genuine products only',
    },
    {
        icon: CreditCard,
        title: 'Secure Payment',
        description: 'SSL encrypted checkout',
    },
    {
        icon: Headphones,
        title: 'Customer Support',
        description: 'Mon-Sat 9am-7:30pm, Sun 10am-6pm',
    },
];

export function FeaturesBanner() {
    return (
        <section className="py-8 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 sm:bg-transparent sm:p-0"
                        >
                            <div className="w-12 h-12 rounded-xl bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                                <feature.icon className="w-6 h-6 text-neon-pink" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm">{feature.title}</h3>
                                <p className="text-xs text-slate-500">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeaturesBanner;
