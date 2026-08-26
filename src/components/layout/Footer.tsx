import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Instagram,
    Mail,
    MapPin,
    Phone,
    Music2,
    Clock
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { subscribeToNewsletter } from '../../lib/newsletter';

export function Footer() {
    const { getSetting } = useSettings();
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);

    // Dynamic settings from backend
    const contactPhone = getSetting('contact_phone', '02083180999');
    const secondaryPhone = getSetting('contact_phone_secondary', '');
    const contactEmail = getSetting('contact_email', 'hello@yourhairandbeauty.com');
    const address = getSetting('address', '37 Lewis Grove, Lewisham, London SE13 6BG');
    const instagramUrl = getSetting('instagram_url');
    const tiktokUrl = getSetting('tiktok_url');

    const socials = [
        { name: 'Instagram', icon: Instagram, href: instagramUrl },
        { name: 'TikTok', icon: Music2, href: tiktokUrl },
    ].filter(social => social.href);

    const handleNewsletterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubscribing) return;

        setIsSubscribing(true);
        const result = await subscribeToNewsletter(newsletterEmail, 'footer');
        if (result.success) {
            toast.success(result.message);
            setNewsletterEmail('');
        } else {
            toast.error(result.message);
        }
        setIsSubscribing(false);
    };

    return (
        <footer className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white pt-20 pb-32 lg:pb-12 overflow-hidden">
            {/* Laser Top Border */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-pink/50 to-transparent shadow-[0_0_15px_rgba(255,20,147,0.5)]" />

            {/* Ambient Background Gradient - Enhanced */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[128px] pointer-events-none mix-blend-screen opacity-60" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-[128px] pointer-events-none mix-blend-screen opacity-60" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Top Section: Newsletter & Brand */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16 lg:mb-24">
                    <div className="text-center lg:text-left">
                        <Link to="/" className="flex items-center justify-center lg:justify-start gap-3 mb-6 lg:mb-8 hover:opacity-90 transition-opacity">
                            <img src="/logo.png" alt="Your Hair and Beauty" className="h-8 md:h-12 w-auto brightness-0 invert drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                            <span className="text-lg md:text-xl font-display font-bold text-white drop-shadow-md">
                                Your Hair <span className="text-neon-pink drop-shadow-[0_0_8px_rgba(255,20,147,0.8)]">&</span> Beauty
                            </span>
                        </Link>
                        <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-6 hidden md:block drop-shadow-lg">
                            Elevate your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-400 drop-shadow-[0_0_10px_rgba(255,20,147,0.3)]">beauty routine.</span>
                        </h2>
                        {/* Mobile simplified heading */}
                        <h2 className="text-2xl font-display font-bold leading-tight mb-4 md:hidden">
                            Elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-400">beauty routine.</span>
                        </h2>

                        <p className="text-slate-300 text-base md:text-lg max-w-md mx-auto lg:mx-0 font-light tracking-wide">
                            Join our community for exclusive access to new drops, expert tips, and members-only offers.
                        </p>
                    </div>
                    <div className="flex flex-col justify-center items-center lg:items-start">
                        <form onSubmit={handleNewsletterSubmit} className="relative w-full max-w-lg group">
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 to-purple-600/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                required
                                className="relative w-full bg-slate-900/80 border border-slate-700 backdrop-blur-xl rounded-2xl py-4 md:py-6 pl-6 md:pl-8 pr-28 md:pr-32 text-white placeholder-slate-500 focus:outline-none focus:border-neon-pink focus:ring-1 focus:ring-neon-pink transition-all text-sm md:text-base shadow-inner"
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-white to-slate-200 text-slate-950 px-4 md:px-8 rounded-xl font-bold hover:from-neon-pink hover:to-purple-500 hover:text-white transition-all shadow-lg shadow-white/5 hover:shadow-neon-pink/40 text-sm md:text-base z-10 disabled:opacity-60"
                            >
                                {isSubscribing ? 'Joining...' : 'Join'}
                            </button>
                        </form>
                        <p className="text-slate-500 text-xs md:text-sm mt-4 ml-2 text-center lg:text-left">
                            By subscribing, you agree to our Terms and Privacy Policy.
                        </p>
                    </div>
                </div>

                {/* Middle Section: Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-24 border-t border-white/5 pt-16 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Shop Column */}
                    <div>
                        <h4 className="font-bold text-white mb-8 tracking-wider uppercase text-sm border-b border-neon-pink/30 pb-2 inline-block">Shop</h4>
                        <ul className="space-y-4">
                            <li><Link to="/brands" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Shop by Brand</Link></li>
                            <li><Link to="/new-arrivals" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">New Arrivals</Link></li>
                            <li><Link to="/trending" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Trending</Link></li>
                            <li><Link to="/sale" className="text-slate-400 hover:text-neon-pink transition-colors font-medium hover:translate-x-1 inline-block duration-200">SALE</Link></li>
                        </ul>
                    </div>

                    {/* Help & Info Column */}
                    <div>
                        <h4 className="font-bold text-white mb-8 tracking-wider uppercase text-sm border-b border-neon-pink/30 pb-2 inline-block">Help & Info</h4>
                        <ul className="space-y-4">
                            <li><Link to="/about" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">About Us</Link></li>
                            <li><Link to="/help" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">FAQ</Link></li>
                            <li><Link to="/help" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Shipping & Delivery</Link></li>
                            <li><Link to="/returns-policy" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Return & Refunds</Link></li>
                            <li><Link to="/contact" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Policy Column */}
                    <div>
                        <h4 className="font-bold text-white mb-8 tracking-wider uppercase text-sm border-b border-neon-pink/30 pb-2 inline-block">Policy</h4>
                        <ul className="space-y-4">
                            <li><Link to="/terms" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Terms of Services</Link></li>
                            <li><Link to="/privacy" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Privacy policy</Link></li>
                            <li><Link to="/cookies" className="text-slate-400 hover:text-neon-pink transition-colors hover:translate-x-1 inline-block duration-200">Cookies policy</Link></li>
                        </ul>
                    </div>

                    {/* Get in Touch Column */}
                    <div>
                        <h4 className="font-bold text-white mb-8 tracking-wider uppercase text-sm border-b border-neon-pink/30 pb-2 inline-block">Get in Touch</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 group-hover:border-neon-pink/50 group-hover:bg-neon-pink/10 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,20,147,0.2)]">
                                    <MapPin className="w-5 h-5 text-slate-400 group-hover:text-neon-pink transition-colors" />
                                </div>
                                <p className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors pt-2">{address}</p>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 group-hover:border-neon-pink/50 group-hover:bg-neon-pink/10 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,20,147,0.2)]">
                                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-neon-pink transition-colors" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <a href={`tel:${contactPhone}`} className="text-slate-400 hover:text-white transition-colors">{contactPhone}</a>
                                    {secondaryPhone && (
                                        <a href={`tel:${secondaryPhone}`} className="text-slate-400 hover:text-white transition-colors">{secondaryPhone}</a>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-4 group min-w-0 overflow-hidden">
                                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 group-hover:border-neon-pink/50 group-hover:bg-neon-pink/10 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,20,147,0.2)]">
                                    <Mail className="w-5 h-5 text-slate-400 group-hover:text-neon-pink transition-colors" />
                                </div>
                                <a
                                    href={`mailto:${contactEmail}`}
                                    className="min-w-0 break-all text-slate-400 hover:text-white transition-colors leading-relaxed pt-2"
                                >
                                    {contactEmail}
                                </a>
                            </div>
                            <div className="flex items-start gap-4 group">
                                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 group-hover:border-neon-pink/50 group-hover:bg-neon-pink/10 transition-all duration-300 shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_15px_rgba(255,20,147,0.2)]">
                                    <Clock className="w-5 h-5 text-slate-400 group-hover:text-neon-pink transition-colors" />
                                </div>
                                <div className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors pt-1">
                                    <p>Mon-Sat: 9am - 7:30pm</p>
                                    <p>Sun: 10am - 6pm</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="flex items-center gap-4">
                        {socials.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-neon-pink hover:border-neon-pink hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/50 hover:shadow-[0_0_15px_rgba(255,20,147,0.4)]"
                            >
                                <social.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-sm text-slate-400 mb-2">
                        </div>
                        <p className="text-slate-500 text-xs mb-1">© {new Date().getFullYear()} Your Hair and Beauty. All rights reserved.</p>
                        <a
                            href="https://www.foundationf1rst.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium transition-colors hover:opacity-80 flex flex-wrap justify-center gap-1 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 hover:border-slate-600"
                        >
                            <span className="text-white">Developed by</span>
                            <span className="text-[#3DC4ED] font-bold">Foundation F1rst Ltd.</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
