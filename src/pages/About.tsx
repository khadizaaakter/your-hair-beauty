import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
    ArrowRight,
    Mail,
    MapPin,
    Phone,
    Scissors,
    Sparkles,
    Droplets,
    Store,
    Package,
    Shapes
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface AboutImageProps {
    src: string;
    alt: string;
    fallbackTitle: string;
    fallbackSubtitle: string;
    className?: string;
    imageClassName?: string;
}

function AboutImage({
    src,
    alt,
    fallbackTitle,
    fallbackSubtitle,
    className = '',
    imageClassName = 'object-cover',
}: AboutImageProps) {
    const [isError, setIsError] = useState(false);

    return (
        <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 ${className}`}>
            {!isError ? (
                <img
                    src={src}
                    alt={alt}
                    className={`h-full w-full ${imageClassName}`}
                    onError={() => setIsError(true)}
                    loading="lazy"
                />
            ) : (
                <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center">
                    <div>
                        <p className="text-lg font-bold text-slate-800">{fallbackTitle}</p>
                        <p className="mt-1 text-sm text-slate-500">{fallbackSubtitle}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function AnimatedCount({ target, suffix }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement | null>(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });

    useEffect(() => {
        if (!inView) return;

        const durationMs = 1400;
        const start = performance.now();

        const tick = (timestamp: number) => {
            const progress = Math.min((timestamp - start) / durationMs, 1);
            setCount(Math.floor(target * progress));
            if (progress < 1) window.requestAnimationFrame(tick);
        };

        const raf = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(raf);
    }, [inView, target]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}
            {suffix || ''}
        </span>
    );
}

function FloatingClipart() {
    return (
        <div className="relative h-[320px] lg:h-[380px]">
            <motion.div
                className="absolute top-6 left-2 w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ y: [0, -10, 0], rotate: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <Scissors className="w-9 h-9 text-neon-pink" />
            </motion.div>

            <motion.div
                className="absolute top-20 right-4 w-24 h-24 rounded-[1.75rem] bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
                <Droplets className="w-10 h-10 text-sky-200" />
            </motion.div>

            <motion.div
                className="absolute bottom-10 left-10 w-24 h-24 rounded-[1.75rem] bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
                <Sparkles className="w-10 h-10 text-amber-200" />
            </motion.div>

            <motion.div
                className="absolute bottom-6 right-12 w-20 h-20 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center"
                animate={{ y: [0, -9, 0], rotate: [0, -7, 0] }}
                transition={{ duration: 5.4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            >
                <Shapes className="w-8 h-8 text-fuchsia-200" />
            </motion.div>

            <motion.div
                className="absolute inset-0 m-auto w-44 h-44 rounded-full bg-neon-pink/20 blur-2xl"
                animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute inset-0 m-auto w-60 h-60 rounded-full border border-white/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}

const storyParagraphs = [
    'Your Hair & Beauty was founded to fill a gap in the market. We noticed a lack of Afro and Caribbean hair and cosmetics shops in the area, and we wanted to provide a place where everyone could find the products they needed.',
    'At Your Hair and Beauty, we understand the importance of finding the perfect products to enhance your natural beauty. That is why we stock a wide range of Afro and Caribbean hair and cosmetic products, as well as European hair products, all sourced from reliable UK-based suppliers.',
    'Whether you are looking for the latest hair extensions, styling tools, or skincare essentials, we have everything you need to look and feel your best.',
    'Our commitment to excellence extends beyond our products. Our knowledgeable and friendly team is always on hand to offer expert advice and personalized recommendations to help you achieve your desired look. Visit us today and experience the Your Hair and Beauty difference.',
];

const ourValues = [
    {
        title: 'Quality',
        description:
            'We partner with reputable vendors who share our commitment to quality. Every product is carefully selected to ensure it meets our high standards.',
    },
    {
        title: 'Inclusivity',
        description:
            'We celebrate all hair types and textures. Our product range is designed to cater to the diverse needs of our customers.',
    },
    {
        title: 'Transparency',
        description:
            "We believe in honest and clear communication. You'll find detailed information about each product, including ingredients and usage tips, so you can make the best choice for your hair.",
    },
    {
        title: 'Sustainability',
        description:
            'We are committed to promoting eco-friendly practices. Many of our vendors use sustainable ingredients and packaging to help reduce our environmental impact.',
    },
];

const getSiteUrl = (): string => {
    const configured = import.meta.env.VITE_SITE_URL as string | undefined;
    return (configured || 'https://yourhairbeauty.co.uk').replace(/\/+$/, '');
};

export function About() {
    const { getSetting } = useSettings();

    const contactPhone = getSetting('contact_phone', '02083180999');
    const secondaryPhone = getSetting('contact_phone_secondary', '');
    const contactEmail = getSetting('contact_email', 'info@yourhairbeauty.co.uk');
    const address = getSetting('address', '37 Lewis Grove, Lewisham, London SE13 6BG');
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/about`;
    const aboutImage = `${siteUrl}/images/about/shop-front.jpeg`;
    const aboutDescription =
        'Learn about Your Hair and Beauty, a family-led Lewisham destination with 26+ years of experience in Afro, Caribbean and European hair and beauty.';
    const aboutSchema = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About Your Hair and Beauty',
        description: aboutDescription,
        url: canonicalUrl,
        image: aboutImage,
        inLanguage: 'en-GB',
    };
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteUrl,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'About',
                item: canonicalUrl,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-slate-50 overflow-x-hidden">
            <Helmet>
                <title>About Us | Your Hair and Beauty</title>
                <meta name="description" content={aboutDescription} />
                <meta
                    name="keywords"
                    content="about your hair and beauty, lewisham hair store, afro caribbean beauty specialist, hair and beauty london"
                />
                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-IE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-DE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-FR" href={canonicalUrl} />
                <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content="About Us | Your Hair and Beauty" />
                <meta property="og:description" content={aboutDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={aboutImage} />
                <meta property="og:image:alt" content="Your Hair and Beauty shop front in Lewisham" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="About Us | Your Hair and Beauty" />
                <meta name="twitter:description" content={aboutDescription} />
                <meta name="twitter:image" content={aboutImage} />
                <script type="application/ld+json">{JSON.stringify(aboutSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 lg:py-20 text-white">
                <div className="absolute -top-28 -left-28 h-72 w-72 rounded-full bg-neon-pink/30 blur-[100px]" />
                <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-sky-400/20 blur-[100px]" />

                <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2 lg:items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-neon-pink">About Us</p>
                        <h1 className="mb-4 text-4xl font-display font-bold lg:text-6xl">About Your Hair and Beauty</h1>
                        <p className="max-w-2xl text-base leading-relaxed text-slate-200 lg:text-lg">
                            Welcome to Your Hair and Beauty, your trusted destination in Lewisham for all your hair and
                            beauty needs. With over 26 years of experience in the industry, we pride ourselves on
                            providing top-quality products and exceptional service to our diverse clientele.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                                Shop Now
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-2.5 font-semibold text-white hover:bg-white hover:text-slate-900 transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </motion.div>

                    <div className="hidden lg:block">
                        <FloatingClipart />
                    </div>
                </div>
            </section>

            <section className="border-b border-slate-200 bg-white py-10">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 grid-cols-2 sm:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
                    >
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neon-pink/10 text-neon-pink">
                            <Package className="h-5 w-5" />
                        </div>
                        <p className="text-3xl font-display font-bold text-slate-900">
                            <AnimatedCount target={45000} suffix="+" />
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500 uppercase tracking-wider">Products</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 }}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
                    >
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neon-pink/10 text-neon-pink">
                            <Store className="h-5 w-5" />
                        </div>
                        <p className="text-3xl font-display font-bold text-slate-900">
                            <AnimatedCount target={400} suffix="+" />
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500 uppercase tracking-wider">Brands</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.16 }}
                        className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
                    >
                        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-neon-pink/10 text-neon-pink">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <p className="text-3xl font-display font-bold text-slate-900">
                            <AnimatedCount target={26} suffix="+" />
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500 uppercase tracking-wider">Years Experience</p>
                    </motion.div>
                </div>
            </section>

            <section className="py-16 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.3fr_1fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-10"
                    >
                        <h2 className="mb-5 text-3xl font-display font-bold text-slate-900">Our Story</h2>
                        <div className="space-y-4">
                            {storyParagraphs.map((text) => (
                                <p key={text} className="leading-relaxed text-slate-600">
                                    {text}
                                </p>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 }}
                    >
                        <AboutImage
                            src="/images/about/shop-front.jpeg"
                            alt="Your Hair and Beauty shop front in Lewisham"
                            fallbackTitle="Shop Front Image"
                            fallbackSubtitle="Add image at public/images/about/shop-front.jpeg"
                            className="h-full min-h-[280px]"
                        />
                    </motion.div>
                </div>
            </section>

            <section className="pb-16 lg:pb-20">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-8">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-neon-pink">Leadership</p>
                        <h2 className="text-3xl font-display font-bold text-slate-900 lg:text-4xl">Meet the Team</h2>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <motion.article
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >
                            <AboutImage
                                src="/images/about/abdul-zahin.jpeg"
                                alt="Abdul Zahin, Owner, Founder and CEO"
                                fallbackTitle="Founder Photo"
                                fallbackSubtitle="Add image at public/images/about/abdul-zahin.jpeg"
                                className="h-[360px]"
                                imageClassName="object-cover object-top"
                            />
                            <div className="p-6">
                                <h3 className="text-2xl font-display font-bold text-slate-900">Abdul Zahin</h3>
                                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-neon-pink">
                                    Owner, Founder and CEO
                                </p>
                            </div>
                        </motion.article>

                        <motion.article
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.08 }}
                            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                        >
                            <AboutImage
                                src="/images/about/arbaaz-aziz-zahin.jpeg"
                                alt="Arbaaz Aziz Zahin, business leadership team"
                                fallbackTitle="Leadership Photo"
                                fallbackSubtitle="Add image at public/images/about/arbaaz-aziz-zahin.jpeg"
                                className="h-[360px]"
                                imageClassName="object-cover object-top"
                            />
                            <div className="p-6">
                                <h3 className="text-2xl font-display font-bold text-slate-900">Arbaaz Aziz Zahin</h3>
                                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-neon-pink">
                                    Business Development Lead
                                </p>
                            </div>
                        </motion.article>
                    </div>
                </div>
            </section>

            <section className="pb-16 lg:pb-20">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mb-8">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-neon-pink">Our Values</p>
                        <h2 className="text-3xl font-display font-bold text-slate-900 lg:text-4xl">What We Stand For</h2>
                        <p className="mt-3 max-w-3xl text-slate-600">
                            At Your Hair &amp; Beauty our values guide everything we do. We are committed to:
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        {ourValues.map((value, index) => (
                            <motion.article
                                key={value.title}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <h3 className="text-xl font-display font-bold text-slate-900">{value.title}</h3>
                                <p className="mt-3 text-slate-600 leading-relaxed">{value.description}</p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="pb-16 lg:pb-20">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
                        <h2 className="mb-8 text-3xl font-display font-bold text-slate-900">Visit Us in Lewisham</h2>

                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 rounded-xl bg-neon-pink/10 p-3 text-neon-pink">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Address</p>
                                    <p className="text-slate-600">{address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 rounded-xl bg-neon-pink/10 p-3 text-neon-pink">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Phone</p>
                                    <a href={`tel:${contactPhone}`} className="text-slate-600 hover:text-neon-pink block">
                                        {contactPhone}
                                    </a>
                                    {secondaryPhone && (
                                        <a href={`tel:${secondaryPhone}`} className="text-slate-600 hover:text-neon-pink block">
                                            {secondaryPhone}
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="mt-0.5 rounded-xl bg-neon-pink/10 p-3 text-neon-pink">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Email</p>
                                    <a href={`mailto:${contactEmail}`} className="text-slate-600 hover:text-neon-pink break-all">
                                        {contactEmail}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-sm lg:p-10">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-neon-pink">Explore</p>
                        <h3 className="mb-4 text-3xl font-display font-bold">Find Your Next Favourite</h3>
                        <p className="mb-8 text-slate-200">
                            Browse trusted brands, discover new arrivals, and shop essentials built for every hair and
                            beauty routine.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Link to="/brands" className="btn-primary inline-flex items-center justify-center gap-2">
                                Shop by Brand
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                to="/sale"
                                className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-2.5 font-semibold text-white hover:bg-white hover:text-slate-900 transition-colors"
                            >
                                View Sale
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default About;
