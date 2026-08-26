import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
    HelpCircle,
    Truck,
    RotateCcw,
    Phone,
    Mail,
    MapPin,
    Clock,
    ChevronDown,
    Send
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

// FAQ Data
const faqData = [
    {
        question: 'How long does delivery take?',
        answer: 'Standard UK delivery takes 3-5 working days. Express delivery (1-2 days) is available for orders placed before 2pm. Free delivery on orders over £50.',
    },
    {
        question: 'What is your returns policy?',
        answer: 'We accept returns within 30 days of purchase. Items must be unopened and in original packaging. Wigs and hair extensions cannot be returned for hygiene reasons once opened.',
    },
    {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship to Europe (5-7 days) and worldwide (7-14 days). International shipping rates are calculated at checkout based on destination and weight.',
    },
    {
        question: 'Are your products authentic?',
        answer: 'Absolutely. We are an authorized retailer for all brands we stock. Every product is 100% genuine and sourced directly from manufacturers or official distributors.',
    },
    {
        question: 'How do I track my order?',
        answer: 'Once your order ships, you\'ll receive an email with tracking information. You can also track your order in your account dashboard under "Order History".',
    },
    {
        question: 'Do you offer professional discounts?',
        answer: 'Yes, we have a trade program for salon professionals and stylists. Contact us with your salon/business credentials to apply for wholesale pricing.',
    },
];

// Shipping Timeline
const shippingSteps = [
    { title: 'Order Placed', description: 'We receive your order', icon: HelpCircle },
    { title: 'Processing', description: 'Items picked and packed', icon: Clock },
    { title: 'Shipped', description: 'On its way to you', icon: Truck },
    { title: 'Delivered', description: 'Enjoy your products!', icon: RotateCcw },
];

// FAQ Accordion Item
function AccordionItem({ item, isOpen, onToggle }: {
    item: typeof faqData[0];
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-slate-200">
            <button
                onClick={onToggle}
                className="w-full py-5 flex items-center justify-between text-left group"
            >
                <span className="font-medium text-slate-900 group-hover:text-neon-pink transition-colors">
                    {item.question}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 ml-4 p-1 rounded-full transition-colors ${isOpen ? 'bg-neon-pink text-white' : 'text-slate-400'}`}
                >
                    <ChevronDown className="w-5 h-5" />
                </motion.div>
            </button>
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
            >
                <p className="pb-5 text-slate-600 leading-relaxed">
                    {item.answer}
                </p>
            </motion.div>
        </div>
    );
}

export function Help() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const faqRef = useRef(null);
    const shippingRef = useRef(null);
    const contactRef = useRef(null);

    const faqInView = useInView(faqRef, { once: true, margin: '-100px' });
    const shippingInView = useInView(shippingRef, { once: true, margin: '-100px' });
    const contactInView = useInView(contactRef, { once: true, margin: '-100px' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        const loadingToast = toast.loading('Sending message...');

        setTimeout(() => {
            toast.dismiss(loadingToast);
            toast.success('Message sent successfully! We\'ll get back to you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-white">
            <Helmet>
                <title>Help Center | Your Hair & Beauty</title>
                <meta name="description" content="Find answers to frequently asked questions, track your order, and contact our support team." />
            </Helmet>

            {/* Header */}
            <div className="bg-slate-50 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
                            Help & Information
                        </h1>
                        <p className="text-slate-600 max-w-xl mx-auto">
                            Find answers to common questions or get in touch with our team
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* FAQ Section */}
            <section id="faq" ref={faqRef} className="py-16 px-4">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={faqInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-10"
                    >
                        <h2 className="section-title mb-3">Frequently Asked Questions</h2>
                        <p className="text-slate-600">Quick answers to common queries</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={faqInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl border border-slate-200"
                    >
                        {faqData.map((item, index) => (
                            <AccordionItem
                                key={index}
                                item={item}
                                isOpen={openFaq === index}
                                onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                            />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Shipping Timeline */}
            <section id="shipping" ref={shippingRef} className="py-16 px-4 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={shippingInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title mb-3">Shipping Process</h2>
                        <p className="text-slate-600">Track your order from purchase to delivery</p>
                    </motion.div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-200 hidden md:block" />
                        <div className="absolute top-8 left-0 w-1/2 h-0.5 bg-neon-pink hidden md:block" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {shippingSteps.map((step, index) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={shippingInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ delay: 0.1 * index }}
                                    className="text-center"
                                >
                                    <div className={`
                    w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center relative z-10
                    ${index < 2 ? 'bg-neon-pink text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}
                  `}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                                    <p className="text-sm text-slate-600">{step.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" ref={contactRef} className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : {}}
                        className="text-center mb-12"
                    >
                        <h2 className="section-title mb-3">Contact Us</h2>
                        <p className="text-slate-600">Get in touch with our customer service team</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={contactInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-50 rounded-2xl p-8"
                        >
                            <h3 className="text-xl font-semibold text-slate-900 mb-6">Get in Touch</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-neon-pink" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Phone</p>
                                        <a href="tel:02083180999" className="text-slate-600 hover:text-neon-pink">
                                            02083180999
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-neon-pink" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Email</p>
                                        <a href="mailto:hello@yourhairandbeauty.com" className="text-slate-600 hover:text-neon-pink">
                                            hello@yourhairandbeauty.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-neon-pink" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Address</p>
                                        <p className="text-slate-600">37 Lewis Grove, Lewisham, SE13 6BG</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center flex-shrink-0">
                                        <Clock className="w-5 h-5 text-neon-pink" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Opening Hours</p>
                                        <p className="text-slate-600">Mon-Sat: 9am - 7:30pm</p>
                                        <p className="text-slate-600">Sun: 10am - 6pm</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="mt-8 rounded-xl overflow-hidden border border-slate-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.1234567890!2d-0.0123456!3d51.4567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s37%20Lewis%20Grove%2C%20Lewisham!5e0!3m2!1sen!2suk!4v1234567890"
                                    width="100%"
                                    height="200"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={contactInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.2 }}
                        >
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-8">
                                <h3 className="text-xl font-semibold text-slate-900 mb-6">Send a Message</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input-field"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input-field"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="input-field"
                                            required
                                        >
                                            <option value="">Select a topic</option>
                                            <option value="order">Order Inquiry</option>
                                            <option value="returns">Returns & Refunds</option>
                                            <option value="product">Product Question</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                                        <textarea
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="input-field min-h-[120px] resize-none"
                                            placeholder="How can we help?"
                                            required
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Help;
