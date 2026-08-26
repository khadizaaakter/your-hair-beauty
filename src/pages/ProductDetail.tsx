import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    Heart,
    ShoppingBag,
    Minus,
    Plus,
    Truck,
    Shield,
    RotateCcw,
    ChevronRight,
    Share2,
    Loader2
} from 'lucide-react';
import { api, type Product } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { ProductCard } from '../components/ui/ProductCard';
import toast from 'react-hot-toast';
import { richTextToPlainText, sanitizeRichTextHtml } from '../utils/richText';

const formatGbpValue = (price: string | number | null | undefined): string => {
    return Number(price || 0).toFixed(2);
};

const getSiteUrl = (): string => {
    const configured = import.meta.env.VITE_SITE_URL as string | undefined;
    return (configured || 'https://yourhairbeauty.co.uk').replace(/\/+$/, '');
};

const toAbsoluteUrl = (siteUrl: string, value: string): string => {
    if (!value) return `${siteUrl}/images/about/shop-front.jpeg`;
    if (value.startsWith('http')) return value;
    return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
};

export function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, number>>({});
    const [quantity, setQuantity] = useState(1);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const { addItem } = useCart();
    const { isInWishlist, toggleItem } = useWishlist();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyBar(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        const button = document.getElementById('main-add-to-cart-btn');
        if (button) {
            observer.observe(button);
        }

        return () => {
            if (button) observer.unobserve(button);
        };
    }, [product, isLoading]);

    useEffect(() => {
        if (!id) return;

        setIsLoading(true);
        // Fetch product details
        const productId = parseInt(id);
        if (isNaN(productId)) {
            setIsLoading(false);
            return;
        }

        api.products.get(productId)
            .then(response => {
                if (response.success && response.data) {
                    setProduct(response.data);
                    setSelectedVariantIds({});

                    // Fetch related products based on category
                    if (response.data.category_id) {
                        // We don't have direct category API search by ID, so filtering by category slug if available or just list generic
                        // For now, let's fetch generic list and filter locally or if API supports it later
                        api.products.list({ limit: 4, category: String(response.data.category_id) }) // Assuming backend supports category_id or we filter later
                            .then(relatedRes => {
                                if (relatedRes.success && relatedRes.data) {
                                    setRelatedProducts(relatedRes.data.filter(p => p.id !== response.data!.id).slice(0, 4));
                                }
                            })
                            .catch(console.error);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [id]);

    const variantGroups = useMemo(() => {
        if (!product?.variants || product.variants.length === 0) return [] as Array<{ name: string; options: NonNullable<Product['variants']> }>;

        const grouped = new Map<string, NonNullable<Product['variants']>>();
        for (const variant of product.variants) {
            const groupName = String(variant.name || 'Option').trim() || 'Option';
            const existing = grouped.get(groupName) || [];
            existing.push(variant);
            grouped.set(groupName, existing);
        }

        return Array.from(grouped.entries()).map(([name, options]) => ({ name, options }));
    }, [product?.variants]);

    useEffect(() => {
        if (variantGroups.length === 0) {
            setSelectedVariantIds({});
            return;
        }

        setSelectedVariantIds((prev) => {
            const next: Record<string, number> = { ...prev };
            let changed = false;

            for (const group of variantGroups) {
                const currentId = next[group.name];
                const hasCurrent = group.options.some((option) => option.id === currentId);
                if (!hasCurrent) {
                    const defaultOptionId = group.options[0]?.id;
                    if (defaultOptionId) {
                        next[group.name] = defaultOptionId;
                        changed = true;
                    }
                }
            }

            for (const key of Object.keys(next)) {
                if (!variantGroups.some((group) => group.name === key)) {
                    delete next[key];
                    changed = true;
                }
            }

            return changed ? next : prev;
        });
    }, [variantGroups]);

    const galleryImages = useMemo(() => {
        const baseImages = Array.isArray(product?.images)
            ? product.images.filter(Boolean)
            : [];
        const variantImages = (product?.variants || [])
            .map((variant) => variant.image || '')
            .filter((image): image is string => Boolean(image));
        const ordered = Array.from(new Set([...baseImages, ...variantImages]));
        return ordered.length > 0 ? ordered : ['https://via.placeholder.com/400'];
    }, [product?.images, product?.variants]);

    useEffect(() => {
        setSelectedImage((prev) => (prev >= galleryImages.length ? 0 : prev));
    }, [galleryImages.length]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-neon-pink animate-spin" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h1>
                    <p className="text-slate-600 mb-4">The product you're looking for doesn't exist.</p>
                    <Link to="/shop" className="btn-primary">
                        Back to Shop
                    </Link>
                </div>
            </div>
        );
    }

    const inWishlist = product ? isInWishlist(Number(product.id)) : false;
    const selectedVariants = variantGroups
        .map((group) => group.options.find((option) => option.id === selectedVariantIds[group.name]))
        .filter(Boolean) as NonNullable<Product['variants']>;
    const allVariantGroupsSelected = variantGroups.length === 0 || selectedVariants.length === variantGroups.length;
    const variantAdjustment = selectedVariants.reduce(
        (sum, variant) => sum + Number(variant.price_adjustment || 0),
        0
    );

    // Prices
    const displayPrice = Number(product?.sale_price || product?.price) + variantAdjustment;
    const displayOriginalPrice = Number(product?.price) + variantAdjustment;
    const isInStock = variantGroups.length > 0
        ? allVariantGroupsSelected && selectedVariants.every((variant) => Number(variant.stock_quantity || 0) > 0)
        : product?.inStock;
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}/product/${product.id}`;
    const productImages = galleryImages.map((imageUrl) => toAbsoluteUrl(siteUrl, imageUrl));
    const primaryImage = productImages[0] || `${siteUrl}/images/about/shop-front.jpeg`;
    const sanitizedLongDescription = sanitizeRichTextHtml(product.description);
    const productDescription =
        product.short_description ||
        richTextToPlainText(sanitizedLongDescription) ||
        `${product.name} at Your Hair and Beauty`;
    const brandName = product.brand_name || 'Your Hair and Beauty';
    const productKeywords = `${product.name}, ${brandName}, afro hair products, beauty products, uk usa europe delivery`;
    const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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
                name: 'Shop',
                item: `${siteUrl}/shop`,
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: product.category_name || 'Category',
                item: `${siteUrl}/shop${product.category_slug ? `/${product.category_slug}` : ''}`,
            },
            {
                '@type': 'ListItem',
                position: 4,
                name: product.name,
                item: canonicalUrl,
            },
        ],
    };
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: productImages,
        description: productDescription,
        brand: {
            '@type': 'Brand',
            name: brandName,
        },
        sku: String(product.id),
        offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'GBP',
            price: formatGbpValue(displayPrice),
            availability: isInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            priceValidUntil,
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingDestination: [
                    { '@type': 'DefinedRegion', addressCountry: 'GB' },
                    { '@type': 'DefinedRegion', addressCountry: 'US' },
                    { '@type': 'DefinedRegion', addressCountry: 'IE' },
                    { '@type': 'DefinedRegion', addressCountry: 'DE' },
                    { '@type': 'DefinedRegion', addressCountry: 'FR' },
                    { '@type': 'DefinedRegion', addressCountry: 'ES' },
                    { '@type': 'DefinedRegion', addressCountry: 'IT' },
                    { '@type': 'DefinedRegion', addressCountry: 'NL' },
                ],
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: ['GB', 'US', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL'],
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 30,
            },
        },
    };

    const handleAddToCart = () => {
        if (!product) return;
        if (variantGroups.length > 0 && !allVariantGroupsSelected) {
            toast.error('Please select all variant options');
            return;
        }
        if (!isInStock) {
            toast.error('Selected options are out of stock');
            return;
        }
        // Add quantity times
        for (let i = 0; i < quantity; i++) {
            addItem(product, 1, selectedVariants);
        }
    };

    const handleToggleWishlist = () => {
        if (!product) return;
        toggleItem(product);
    };

    const handleShare = async () => {
        if (!product) return;

        const shareUrl = `${getSiteUrl()}/product/${product.id}`;
        const sharePayload = {
            title: product.name,
            text: `Check out ${product.name} on Your Hair and Beauty`,
            url: shareUrl,
        };

        try {
            if (navigator.share) {
                await navigator.share(sharePayload);
                return;
            }

            await navigator.clipboard.writeText(shareUrl);
            toast.success('Product link copied');
        } catch (error) {
            if ((error as Error)?.name !== 'AbortError') {
                toast.error('Unable to share this product right now');
            }
        }
    };



    return (
        <>
            <Helmet>
                <title>{product.name} | Your Hair and Beauty</title>
                <meta name="description" content={`Shop ${product.name} by ${product.brand_name || 'Brand'} at Your Hair and Beauty. ${product.badge ? product.badge.toUpperCase() + ' - ' : ''}GBP ${formatGbpValue(product.sale_price || product.price)}`} />
                <meta name="keywords" content={productKeywords} />
                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-GB" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-US" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-IE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-DE" href={canonicalUrl} />
                <link rel="alternate" hrefLang="en-FR" href={canonicalUrl} />
                <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
                <meta property="og:type" content="product" />
                <meta property="og:title" content={`${product.name} | Your Hair and Beauty`} />
                <meta property="og:description" content={productDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={primaryImage} />
                <meta property="og:image:alt" content={`${product.name} product image`} />
                <meta property="product:price:currency" content="GBP" />
                <meta property="product:price:amount" content={formatGbpValue(displayPrice)} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${product.name} | Your Hair and Beauty`} />
                <meta name="twitter:description" content={productDescription} />
                <meta name="twitter:image" content={primaryImage} />
                <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <main className="bg-white">
                {/* Breadcrumb */}
                <div className="bg-slate-50 py-4">
                    <div className="max-w-7xl mx-auto px-4">
                        <nav className="flex items-center gap-2 text-sm text-slate-600">
                            <Link to="/" className="hover:text-neon-pink">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link to="/shop" className="hover:text-neon-pink">Shop</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link to={`/shop?category=${product.category_slug || ''}`} className="hover:text-neon-pink capitalize">
                                {product.category_name || 'Product'}
                            </Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-slate-900 font-medium truncate max-w-[200px]">{product.name}</span>
                        </nav>
                    </div>
                </div>

                {/* Product Section */}
                <section className="py-8 lg:py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="aspect-square rounded-2xl overflow-hidden bg-slate-100"
                                >
                                    <img
                                        src={galleryImages[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                                {galleryImages.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {galleryImages.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-neon-pink' : 'border-transparent'
                                                    }`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Brand & Badge */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-500 uppercase tracking-wide">{product.brand_name || 'Brand'}</span>
                                    {product.badge && (
                                        <span className={`badge ${product.badge === 'sale' ? 'badge-sale' :
                                            product.badge === 'new' ? 'badge-new' : 'badge-pink'
                                            }`}>
                                            {product.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
                                        {product.name}
                                    </h1>
                                    {product.short_description && (
                                        <p className="text-lg text-slate-500 font-medium">
                                            {product.short_description}
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-slate-900">
                                        {formatPrice(displayPrice)}
                                    </span>
                                    {product.sale_price && (
                                        <span className="text-xl text-slate-400 line-through">
                                            {formatPrice(displayOriginalPrice)}
                                        </span>
                                    )}
                                    {product.sale_price && (
                                        <span className="text-sm font-medium text-red-500">
                                            Save {formatPrice(displayOriginalPrice - displayPrice)}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {sanitizedLongDescription && (
                                    <div
                                        className="text-slate-600 leading-relaxed [&_b]:font-semibold [&_em]:italic [&_i]:italic [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
                                        dangerouslySetInnerHTML={{ __html: sanitizedLongDescription }}
                                    />
                                )}

                                {product.how_to_use && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-2">
                                            How to Use
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                            {product.how_to_use}
                                        </p>
                                    </div>
                                )}

                                {product.ingredients && (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-700 mb-2">
                                            Ingredients
                                        </h3>
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                            {product.ingredients}
                                        </p>
                                    </div>
                                )}

                                {/* Variants */}
                                {variantGroups.length > 0 && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="space-y-5">
                                            {variantGroups.map((group) => {
                                                const selectedId = selectedVariantIds[group.name];
                                                const selectedOption = group.options.find((option) => option.id === selectedId);
                                                const isColorGroup = group.name.toLowerCase().includes('color') || group.name.toLowerCase().includes('colour');
                                                const isImageGroup = group.name.toLowerCase().includes('image');

                                                return (
                                                    <div key={group.name}>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h3 className="text-sm font-semibold text-slate-900">{group.name}</h3>
                                                            <span className="text-sm font-medium text-neon-pink">{selectedOption?.value || 'Select'}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {group.options.map((variant) => (
                                                                <button
                                                                    key={variant.id}
                                                                    onClick={() => {
                                                                        if (!variant.id) return;
                                                                        setSelectedVariantIds((prev) => ({ ...prev, [group.name]: variant.id as number }));
                                                                        if (variant.image) {
                                                                            const imageIndex = galleryImages.findIndex((image) => image === variant.image);
                                                                            if (imageIndex >= 0) {
                                                                                setSelectedImage(imageIndex);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className={`
                                                                        relative rounded-xl border-2 overflow-hidden transition-all bg-white
                                                                        ${selectedId === variant.id ? 'border-neon-pink shadow-md hover:border-neon-pink' : 'border-slate-200 hover:border-slate-300'}
                                                                    `}
                                                                    title={variant.value}
                                                                >
                                                                    {isImageGroup ? (
                                                                        <div className="w-24">
                                                                            <div className="w-24 h-24 bg-slate-100">
                                                                                <img src={variant.image || '/images/about/shop-front.jpeg'} alt={variant.value} className="w-full h-full object-cover" />
                                                                            </div>
                                                                            <div className="px-2 py-1.5 text-xs font-medium text-slate-700 truncate">
                                                                                {variant.value}
                                                                            </div>
                                                                        </div>
                                                                    ) : variant.image ? (
                                                                        <div className="w-14 h-14 bg-slate-100">
                                                                            <img src={variant.image} alt={variant.value} className="w-full h-full object-cover" />
                                                                        </div>
                                                                    ) : isColorGroup || variant.color_code ? (
                                                                        <div className="w-10 h-10 rounded-full mx-2 my-2 border border-slate-200" style={{ backgroundColor: variant.color_code || variant.value }} />
                                                                    ) : (
                                                                        <div className="px-4 py-2 font-medium text-slate-700">{variant.value}</div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity & Add to Cart */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-slate-200 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 hover:bg-slate-50 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="p-3 hover:bg-slate-50 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <motion.button
                                        id="main-add-to-cart-btn"
                                        onClick={handleAddToCart}
                                        disabled={!isInStock}
                                        className={`flex-1 flex items-center justify-center gap-2 btn-primary ${!isInStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        whileHover={isInStock ? { scale: 1.02 } : {}}
                                        whileTap={isInStock ? { scale: 0.98 } : {}}
                                    >
                                        <ShoppingBag className="w-5 h-5" />
                                        {isInStock ? 'Add to Cart' : 'Out of Stock'}
                                    </motion.button>
                                    <motion.button
                                        onClick={handleToggleWishlist}
                                        className={`p-3 rounded-lg border transition-colors ${inWishlist
                                            ? 'bg-neon-pink/10 border-neon-pink text-neon-pink'
                                            : 'border-slate-200 text-slate-600 hover:border-neon-pink hover:text-neon-pink'
                                            }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                    </motion.button>
                                    <button
                                        onClick={handleShare}
                                        className="p-3 rounded-lg border border-slate-200 text-slate-600 hover:border-neon-pink hover:text-neon-pink transition-colors"
                                        aria-label="Share product"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Features */}
                                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                                    <div className="text-center">
                                        <Truck className="w-6 h-6 text-neon-pink mx-auto mb-2" />
                                        <p className="text-xs text-slate-600">Free Delivery</p>
                                    </div>
                                    <div className="text-center">
                                        <Shield className="w-6 h-6 text-neon-pink mx-auto mb-2" />
                                        <p className="text-xs text-slate-600">Authentic Product</p>
                                    </div>
                                    <div className="text-center">
                                        <RotateCcw className="w-6 h-6 text-neon-pink mx-auto mb-2" />
                                        <p className="text-xs text-slate-600">Easy Returns</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="py-12 mb-20 lg:mb-0">
                        <div className="max-w-7xl mx-auto px-4">
                            <h2 className="text-2xl font-display font-bold text-slate-900 mb-8">You May Also Like</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {relatedProducts.map((p, index) => (
                                    <ProductCard key={p.id} product={p} index={index} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Sticky Mobile Add to Cart Bar */}
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: showStickyBar ? 0 : 100 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed bottom-[84px] left-0 right-0 bg-white border-t border-slate-100 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 lg:hidden flex items-center gap-3"
                >
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                        <img src={galleryImages[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                        <p className="text-sm font-bold text-neon-pink">
                            {formatPrice(displayPrice)}
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={!isInStock}
                        className={`btn-primary py-2 px-4 text-sm whitespace-nowrap ${!isInStock ? 'opacity-50' : ''}`}
                    >
                        {isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </motion.div>
            </main>
        </>
    );
}

export default ProductDetail;
