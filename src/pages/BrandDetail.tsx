import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Loader2, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { api, type Product } from '../lib/api';
import { ProductCard } from '../components/ui/ProductCard';

interface BrandInfo {
    id: number;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    totalProducts: number;
}

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const getSiteUrl = (): string => {
    const configured = import.meta.env.VITE_SITE_URL as string | undefined;
    return (configured || 'https://yourhairbeauty.co.uk').replace(/\/+$/, '');
};

const toAbsoluteUrl = (siteUrl: string, value?: string): string => {
    if (!value) return `${siteUrl}/images/about/shop-front.jpeg`;
    if (value.startsWith('http')) return value;
    return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

export function BrandDetail() {
    const { slug } = useParams<{ slug: string }>();
    const siteUrl = getSiteUrl();
    const [brand, setBrand] = useState<BrandInfo | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('default');

    // Fetch brand info
    useEffect(() => {
        const fetchBrand = async () => {
            if (!slug) return;
            try {
                setIsLoading(true);
                const response = await api.brands.get(slug);
                if (response.success && response.data) {
                    setBrand(response.data);
                } else {
                    setError('Brand not found');
                }
            } catch (err) {
                console.error('Failed to fetch brand:', err);
                setError('Failed to load brand');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrand();
    }, [slug]);

    // Fetch products for this brand
    useEffect(() => {
        const fetchProducts = async () => {
            if (!brand?.name) return;
            try {
                setProductsLoading(true);
                const response = await api.products.list({ brand: brand.name, limit: 200 });
                if (response.success && response.data) {
                    const data = response.data;
                    setProducts(Array.isArray(data) ? data : (data as any).products || []);
                }
            } catch (err) {
                console.error('Failed to fetch brand products:', err);
            } finally {
                setProductsLoading(false);
            }
        };
        fetchProducts();
    }, [brand?.name]);

    // Sort products
    const sortedProducts = [...products].sort((a, b) => {
        switch (sortBy) {
            case 'price-asc': return (a.sale_price || a.price) - (b.sale_price || b.price);
            case 'price-desc': return (b.sale_price || b.price) - (a.sale_price || a.price);
            case 'name-asc': return (a.name || '').localeCompare(b.name || '');
            case 'name-desc': return (b.name || '').localeCompare(a.name || '');
            default: return 0;
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Loader2 className="w-10 h-10 animate-spin text-neon-pink" />
            </div>
        );
    }

    if (error || !brand) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
                <ShoppingBag className="w-16 h-16 text-slate-300" />
                <h2 className="text-2xl font-bold text-slate-900">{error || 'Brand not found'}</h2>
                <Link to="/brands" className="text-neon-pink hover:underline font-medium">
                    ← Back to Brands Directory
                </Link>
            </div>
        );
    }

    const canonicalUrl = `${siteUrl}/brands/${brand.slug}`;
    const brandLogo = toAbsoluteUrl(siteUrl, brand.logo);
    const brandDescription =
        brand.description ||
        `Shop ${brand.name} products at Your Hair & Beauty with delivery options across the UK, USA and Europe.`;
    const brandKeywords = `${brand.name}, ${brand.name} products, hair brands uk, afro hair brands, beauty brands`;
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
                name: 'Shop by Brand',
                item: `${siteUrl}/brands`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: brand.name,
                item: canonicalUrl,
            },
        ],
    };
    const brandSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${brand.name} Products`,
        description: brandDescription,
        url: canonicalUrl,
        inLanguage: 'en-GB',
        about: {
            '@type': 'Brand',
            name: brand.name,
            logo: brandLogo,
        },
    };
    const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: sortedProducts.length,
        itemListElement: sortedProducts.slice(0, 24).map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/product/${product.id}`,
            name: product.name,
        })),
    };

    return (
        <main className="min-h-screen bg-white">
            <Helmet>
                <title>{brand.name} | Your Hair and Beauty</title>
                <meta name="description" content={brandDescription} />
                <meta name="keywords" content={brandKeywords} />
                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-IE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-DE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-FR" href={canonicalUrl} />
                <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={`${brand.name} | Your Hair and Beauty`} />
                <meta property="og:description" content={brandDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={brandLogo} />
                <meta property="og:image:alt" content={`${brand.name} logo`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${brand.name} | Your Hair and Beauty`} />
                <meta name="twitter:description" content={brandDescription} />
                <meta name="twitter:image" content={brandLogo} />
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(brandSchema)}</script>
                {sortedProducts.length > 0 && (
                    <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
                )}
            </Helmet>

            {/* ── Brand Hero ── */}
            <section className="pt-32 pb-12 bg-slate-50 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-neon-pink/5 to-transparent pointer-events-none" />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-64 h-64 border border-dashed border-neon-pink/10 rounded-full pointer-events-none"
                />

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    {/* Breadcrumb */}
                    <Link
                        to="/brands"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-neon-pink transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Brands Directory
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8"
                    >
                        {/* Logo */}
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain p-3" />
                            ) : (
                                <span className="text-5xl font-display font-bold text-neon-pink/30">
                                    {brand.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-2">
                                {brand.name}
                            </h1>
                            <p className="text-slate-500 text-lg">
                                {brand.totalProducts} product{brand.totalProducts !== 1 ? 's' : ''} available
                            </p>
                            {brand.description && (
                                <p className="text-slate-600 mt-3 max-w-xl leading-relaxed">{brand.description}</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Products Section ── */}
            <section className="py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Sort Bar */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-900">{sortedProducts.length}</span> product{sortedProducts.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink bg-white cursor-pointer"
                            >
                                <option value="default">Sort by: Default</option>
                                <option value="name-asc">Name: A → Z</option>
                                <option value="name-desc">Name: Z → A</option>
                                <option value="price-asc">Price: Low → High</option>
                                <option value="price-desc">Price: High → Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {productsLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-neon-pink mb-4" />
                            <p className="text-slate-500">Loading products...</p>
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl">
                            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
                            <p className="text-slate-500 mb-6">
                                We don't have any {brand.name} products listed at the moment.
                            </p>
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-neon-pink text-white rounded-xl font-semibold hover:bg-neon-pink/90 transition-colors"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                            {sortedProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default BrandDetail;
