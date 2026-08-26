import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Instagram, Music2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../context/SettingsContext';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const getSiteUrl = (): string => {
    const configured = import.meta.env.VITE_SITE_URL as string | undefined;
    return (configured || 'https://yourhairbeauty.co.uk').replace(/\/+$/, '');
};

export function Contact() {
    const { getSetting } = useSettings();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic settings
    const contactPhone = getSetting('contact_phone', '02083180999');
    const secondaryPhone = getSetting('contact_phone_secondary', '');
    const contactEmail = getSetting('contact_email', 'hello@yourhairandbeauty.com');
    const address = getSetting('address', '37 Lewis Grove, Lewisham, London SE13 6BG');
    const instagramUrl = getSetting('instagram_url');
    const tiktokUrl = getSetting('tiktok_url');
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/contact`;
    const contactDescription =
        "Get in touch with Your Hair and Beauty for order support, product advice, and store queries in Lewisham, London.";
    const contactPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Contact Your Hair and Beauty',
        description: contactDescription,
        url: canonicalUrl,
        inLanguage: 'en-GB',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await api.contact.submit(formData);
            if (response.success) {
                toast.success('Message sent! We will get back to you soon.');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                toast.error('Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error('An error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | Your Hair and Beauty</title>
                <meta name="description" content={contactDescription} />
                <meta
                    name="keywords"
                    content="contact your hair and beauty, lewisham beauty shop phone number, order support, hair product customer service"
                />
                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-IE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Contact Us | Your Hair and Beauty" />
                <meta property="og:description" content={contactDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={`${siteUrl}/images/about/shop-front.jpeg`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Contact Us | Your Hair and Beauty" />
                <meta name="twitter:description" content={contactDescription} />
                <meta name="twitter:image" content={`${siteUrl}/images/about/shop-front.jpeg`} />
                <script type="application/ld+json">{JSON.stringify(contactPageSchema)}</script>
            </Helmet>

            <main className="min-h-screen bg-slate-50">
                {/* Hero Section */}
                <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
                    <div className="absolute inset-0">
                        {/* Abstract Background */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>

                    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-neon-pink text-sm font-bold mb-6"
                        >
                            We'd love to hear from you
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 tracking-tight"
                        >
                            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-400">Touch</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed"
                        >
                            Have a question about a product, your order, or just want to say hello? Our team is always here to help.
                        </motion.p>
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Info Cards Column */}
                        <div className="space-y-6">
                            {/* Contact Details Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-neon-pink" />
                                    Contact Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4 group">
                                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-neon-pink group-hover:text-white transition-colors duration-300">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium mb-1">Phone</p>
                                            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="text-lg font-bold text-slate-900 hover:text-neon-pink transition-colors">
                                                {contactPhone}
                                            </a>
                                            {secondaryPhone && (
                                                <a href={`tel:${secondaryPhone.replace(/\s/g, '')}`} className="mt-1 block text-base font-semibold text-slate-700 hover:text-neon-pink transition-colors">
                                                    {secondaryPhone}
                                                </a>
                                            )}
                                            <p className="text-xs text-slate-400 mt-1">Mon-Sat 9am-7:30pm</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-neon-pink group-hover:text-white transition-colors duration-300">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium mb-1">Email</p>
                                            <a href={`mailto:${contactEmail}`} className="text-lg font-bold text-slate-900 hover:text-neon-pink transition-colors break-all">
                                                {contactEmail}
                                            </a>
                                            <p className="text-xs text-slate-400 mt-1">We reply within 24 hours</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 group">
                                        <div className="p-3 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-neon-pink group-hover:text-white transition-colors duration-300">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500 font-medium mb-1">Store</p>
                                            <p className="text-lg font-bold text-slate-900 leading-tight">
                                                {address}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <p className="text-sm font-medium text-slate-500 mb-4">Follow us on social media</p>
                                    <div className="flex gap-3">
                                        {instagramUrl && (
                                            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-neon-pink hover:text-white transition-all hover:scale-110">
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {tiktokUrl && (
                                            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-neon-pink hover:text-white transition-all hover:scale-110">
                                                <Music2 className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Hours Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/20 rounded-full blur-3xl -mr-10 -mt-10" />

                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                                    <Clock className="w-5 h-5 text-neon-pink" />
                                    Opening Hours
                                </h3>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                        <span className="text-slate-300">Monday - Saturday</span>
                                        <span className="font-bold">9:00 AM - 7:30 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center text-neon-pink/90">
                                        <span>Sunday</span>
                                        <span className="font-bold">10:00 AM - 6:00 PM</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Form Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
                        >
                            <div className="mb-10">
                                <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Send us a message</h2>
                                <p className="text-slate-500">Fill out the form below and we'll get back to you as soon as possible.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="peer w-full bg-slate-50 border-transparent rounded-xl px-4 py-4 pt-6 text-slate-900 font-medium placeholder-transparent focus:bg-white focus:border-neon-pink focus:ring-0 transition-all outline-none"
                                            placeholder="John Doe"
                                            required
                                        />
                                        <label htmlFor="name" className="absolute left-4 top-4 text-xs font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500 peer-focus:text-xs peer-focus:top-1.5 peer-focus:font-bold peer-focus:text-neon-pink transition-all pointer-events-none">
                                            Your Name
                                        </label>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="peer w-full bg-slate-50 border-transparent rounded-xl px-4 py-4 pt-6 text-slate-900 font-medium placeholder-transparent focus:bg-white focus:border-neon-pink focus:ring-0 transition-all outline-none"
                                            placeholder="john@example.com"
                                            required
                                        />
                                        <label htmlFor="email" className="absolute left-4 top-4 text-xs font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500 peer-focus:text-xs peer-focus:top-1.5 peer-focus:font-bold peer-focus:text-neon-pink transition-all pointer-events-none">
                                            Email Address
                                        </label>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <select
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="peer w-full bg-slate-50 border-transparent rounded-xl px-4 py-4 pt-6 text-slate-900 font-medium focus:bg-white focus:border-neon-pink focus:ring-0 transition-all outline-none appearance-none"
                                        required
                                    >
                                        <option value="" disabled></option>
                                        <option value="order">Order Inquiry</option>
                                        <option value="returns">Returns & Refunds</option>
                                        <option value="product">Product Info</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <label htmlFor="subject" className="absolute left-4 top-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider pointer-events-none">
                                        Reason for Contact
                                    </label>
                                </div>

                                <div className="relative group">
                                    <textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="peer w-full bg-slate-50 border-transparent rounded-xl px-4 py-4 pt-6 text-slate-900 font-medium placeholder-transparent focus:bg-white focus:border-neon-pink focus:ring-0 transition-all outline-none min-h-[160px] resize-none"
                                        placeholder="How can we help?"
                                        required
                                    />
                                    <label htmlFor="message" className="absolute left-4 top-4 text-xs font-bold text-slate-400 uppercase tracking-wider peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:font-normal peer-placeholder-shown:text-slate-500 peer-focus:text-xs peer-focus:top-1.5 peer-focus:font-bold peer-focus:text-neon-pink transition-all pointer-events-none">
                                        Your Message
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-slate-900 text-white font-bold py-5 rounded-xl hover:bg-neon-pink transition-all transform hover:-translate-y-1 shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Sending...</span>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-8 bg-white rounded-3xl p-3 shadow-xl shadow-slate-200/50 border border-slate-100"
                    >
                        <div className="rounded-2xl overflow-hidden h-[400px] w-full bg-slate-100 relative grayscale hover:grayscale-0 transition-all duration-700">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2486.3217277803697!2d-0.015091923145942442!3d51.45229677180214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487602e1c3132717%3A0x8ac7f849319e7e5!2sYour%20Hair%20and%20Beauty!5e0!3m2!1sen!2suk!4v1709400000000!5m2!1sen!2suk"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </motion.div>
                </div>
            </main>
        </>
    );
}

export default Contact;
