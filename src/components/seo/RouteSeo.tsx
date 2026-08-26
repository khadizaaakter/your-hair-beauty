import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

type RouteMeta = {
    title: string;
    description: string;
    keywords: string;
};

const FALLBACK_SITE_URL = 'https://yourhairbeauty.co.uk';
const SITE_NAME = 'Your Hair & Beauty';
const DEFAULT_IMAGE_PATH = '/images/about/shop-front.jpeg';
const DEFAULT_KEYWORDS =
    'afro hair products, caribbean hair products, beauty shop uk, hair extensions, wigs, hair care, lewisham beauty store, uk beauty products';
const HREFLANGS = ['en-GB', 'en-US', 'en-IE', 'en-DE', 'en-FR', 'en-ES', 'en-IT', 'en-NL', 'x-default'] as const;

const SEGMENT_LABELS: Record<string, string> = {
    about: 'About',
    brands: 'Shop by Brand',
    categories: 'Categories',
    contact: 'Contact',
    help: 'Help',
    'best-sellers': 'Best Sellers',
    'new-arrivals': 'New Arrivals',
    product: 'Product',
    sale: 'Sale',
    shop: 'Shop',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    cookies: 'Cookie Policy',
    'returns-policy': 'Returns Policy',
    'track-order': 'Track Order',
    trending: 'Trending',
};

const ROUTE_META: Array<{ test: (pathname: string) => boolean; meta: RouteMeta }> = [
    {
        test: (pathname) => pathname === '/',
        meta: {
            title: 'Your Hair & Beauty | Afro, Caribbean & Beauty Products',
            description:
                'Shop Afro, Caribbean and beauty essentials from trusted UK brands. Fast delivery across the UK, USA and Europe from Your Hair & Beauty.',
            keywords:
                'afro hair products uk, caribbean beauty products, black hair care, hair and beauty shop lewisham',
        },
    },
    {
        test: (pathname) => pathname.startsWith('/shop'),
        meta: {
            title: 'Shop Hair & Beauty Products | Your Hair & Beauty',
            description:
                'Browse hair care, wigs, extensions, electrical tools and cosmetics from leading brands at Your Hair & Beauty.',
            keywords:
                'shop hair products, beauty products online, wigs and extensions uk, afro hair cosmetics',
        },
    },
    {
        test: (pathname) => pathname === '/about',
        meta: {
            title: 'About Us | Your Hair & Beauty Lewisham',
            description:
                'Learn about Your Hair & Beauty, a family-run Lewisham store with 26+ years serving Afro, Caribbean and European hair and beauty needs.',
            keywords:
                'about your hair and beauty, lewisham hair shop, family beauty business london',
        },
    },
    {
        test: (pathname) => pathname === '/brands',
        meta: {
            title: 'Shop by Brand | Your Hair & Beauty',
            description:
                'Explore top hair and beauty brands in one place. Discover trusted products for every routine at Your Hair & Beauty.',
            keywords:
                'shop by brand hair products, afro hair brands uk, beauty brands directory',
        },
    },
    {
        test: (pathname) => pathname.startsWith('/brands/'),
        meta: {
            title: 'Brand Products | Your Hair & Beauty',
            description:
                'Browse products from trusted hair and beauty brands with UK, USA and Europe delivery options.',
            keywords:
                'brand hair products, beauty brand collection, buy branded hair care products',
        },
    },
    {
        test: (pathname) => pathname === '/new-arrivals',
        meta: {
            title: 'New Arrivals | Your Hair & Beauty',
            description:
                'Discover the latest hair and beauty products added to Your Hair & Beauty this week.',
            keywords:
                'new hair products, latest beauty arrivals, newly added afro hair products',
        },
    },
    {
        test: (pathname) => pathname === '/trending',
        meta: {
            title: 'Trending Products | Your Hair & Beauty',
            description:
                'See what customers are buying now. Shop trending hair and beauty products at Your Hair & Beauty.',
            keywords:
                'trending hair products, popular beauty products, best selling afro hair care',
        },
    },
    {
        test: (pathname) => pathname === '/best-sellers',
        meta: {
            title: 'Best Sellers | Your Hair & Beauty',
            description:
                'Shop customer-favorite best sellers across hair care, styling, extensions and beauty essentials.',
            keywords:
                'best selling hair products, top beauty products uk, customer favorite hair care',
        },
    },
    {
        test: (pathname) => pathname === '/sale',
        meta: {
            title: 'Hair & Beauty Sale | Your Hair & Beauty',
            description:
                'Save on selected hair and beauty essentials. Browse current sale products and limited-time offers.',
            keywords:
                'hair sale uk, beauty sale products, discounted hair extensions, afro hair deals',
        },
    },
    {
        test: (pathname) => pathname === '/contact',
        meta: {
            title: 'Contact Us | Your Hair & Beauty',
            description:
                'Contact Your Hair & Beauty in Lewisham for product advice, delivery help, and store support.',
            keywords:
                'contact your hair and beauty, lewisham beauty store phone number, hair product support',
        },
    },
    {
        test: (pathname) => pathname === '/help',
        meta: {
            title: 'Help & Support | Your Hair & Beauty',
            description:
                'Get help with delivery, returns, payment and product questions for Your Hair & Beauty.',
            keywords:
                'hair beauty support, order help uk, return policy hair products',
        },
    },
];

const DEFAULT_META: RouteMeta = {
    title: 'Your Hair & Beauty',
    description:
        'Your Hair & Beauty offers Afro, Caribbean and European hair and beauty products from trusted brands.',
    keywords:
        'hair and beauty products, afro and caribbean hair care, your hair and beauty lewisham',
};

const NOINDEX_PREFIXES = [
    '/admin',
    '/dashboard',
    '/checkout',
    '/pay',
    '/login',
    '/register',
    '/forgot-password',
    '/track-order',
];

function getSiteUrl(): string {
    const configured = import.meta.env.VITE_SITE_URL as string | undefined;
    return (configured || FALLBACK_SITE_URL).replace(/\/+$/, '');
}

function normalizePath(pathname: string): string {
    if (!pathname || pathname === '/') return '/';
    return pathname.replace(/\/+$/, '');
}

function slugToLabel(slug: string): string {
    return slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildBreadcrumbs(pathname: string, siteUrl: string): Array<{ name: string; url: string }> {
    const breadcrumbs: Array<{ name: string; url: string }> = [{ name: 'Home', url: siteUrl }];
    if (pathname === '/') return breadcrumbs;

    const segments = pathname.split('/').filter(Boolean);
    let currentPath = '';

    for (let i = 0; i < segments.length; i += 1) {
        const segment = segments[i];
        currentPath += `/${segment}`;

        const prevSegment = segments[i - 1] || '';
        const fallbackLabel = /^\d+$/.test(segment) ? 'Item' : slugToLabel(segment);
        let name = SEGMENT_LABELS[segment] || fallbackLabel;

        if (prevSegment === 'brands') {
            name = slugToLabel(segment);
        }

        if (prevSegment === 'product' && /^\d+$/.test(segment)) {
            name = 'Product Item';
        }

        breadcrumbs.push({
            name,
            url: `${siteUrl}${currentPath}`,
        });
    }

    return breadcrumbs;
}

function getRouteMeta(pathname: string): RouteMeta {
    const match = ROUTE_META.find((entry) => entry.test(pathname));
    return match?.meta || DEFAULT_META;
}

export function RouteSeo() {
    const location = useLocation();
    const siteUrl = getSiteUrl();
    const pathname = normalizePath(location.pathname);
    const canonical = `${siteUrl}${pathname === '/' ? '' : pathname}`;
    const image = `${siteUrl}${DEFAULT_IMAGE_PATH}`;
    const routeMeta = getRouteMeta(pathname);
    const searchParams = new URLSearchParams(location.search);
    const hasQuery = location.search.length > 1;
    const hasTrackingParams = Array.from(searchParams.keys()).some(
        (key) => key.startsWith('utm_') || key === 'gclid' || key === 'fbclid'
    );
    const currentPage = Number(searchParams.get('page') || '1');
    const hasPagination = Number.isFinite(currentPage) && currentPage > 1;
    const breadcrumbs = buildBreadcrumbs(pathname, siteUrl);
    const keywords = `${routeMeta.keywords}, ${DEFAULT_KEYWORDS}`;

    const isFilteredShopPage = pathname.startsWith('/shop') && hasQuery;
    const isNoindex = NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || pathname === '/search' || isFilteredShopPage;
    const shouldNoindex = isNoindex || hasTrackingParams || (pathname.startsWith('/shop') && hasPagination);
    const robots = shouldNoindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    const organizationSchema = {
        '@context': 'https://schema.org',
        '@type': 'HealthAndBeautyBusiness',
        '@id': `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        image,
        telephone: '+44 20 8318 0999',
        email: 'info@yourhairbeauty.co.uk',
        priceRange: 'GBP',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '37 Lewis Grove',
            addressLocality: 'Lewisham',
            addressRegion: 'London',
            postalCode: 'SE13 6BG',
            addressCountry: 'GB',
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                opens: '09:00',
                closes: '19:30',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Sunday',
                opens: '10:00',
                closes: '18:00',
            },
        ],
        areaServed: ['GB', 'US', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'AT', 'PT', 'SE', 'DK', 'NO'],
    };

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/shop?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };

    const webpageSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: routeMeta.title,
        description: routeMeta.description,
        inLanguage: 'en-GB',
        isPartOf: {
            '@id': `${siteUrl}/#website`,
        },
    };

    const breadcrumbSchema =
        breadcrumbs.length > 1
            ? {
                  '@context': 'https://schema.org',
                  '@type': 'BreadcrumbList',
                  '@id': `${canonical}#breadcrumb`,
                  itemListElement: breadcrumbs.map((item, index) => ({
                      '@type': 'ListItem',
                      position: index + 1,
                      name: item.name,
                      item: item.url,
                  })),
              }
            : null;

    return (
        <Helmet prioritizeSeoTags>
            <html lang="en-GB" />
            <title>{routeMeta.title}</title>
            <meta name="description" content={routeMeta.description} />
            <meta name="keywords" content={keywords} />
            <meta name="robots" content={robots} />
            <meta name="googlebot" content={robots} />
            <meta name="author" content="Your Hair & Beauty" />
            <meta name="geo.region" content="GB-LND" />
            <meta name="geo.placename" content="Lewisham, London" />
            <meta name="distribution" content="global" />
            <meta name="theme-color" content="#f21393" />

            <link rel="canonical" href={canonical} />
            {HREFLANGS.map((hrefLang) => (
                <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={canonical} />
            ))}
            <link rel="alternate" hrefLang="en" href={canonical} />

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="en_GB" />
            <meta property="og:locale:alternate" content="en_US" />
            <meta property="og:locale:alternate" content="en_IE" />
            <meta property="og:title" content={routeMeta.title} />
            <meta property="og:description" content={routeMeta.description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={image} />
            <meta property="og:image:alt" content="Your Hair and Beauty store front in Lewisham" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={routeMeta.title} />
            <meta name="twitter:description" content={routeMeta.description} />
            <meta name="twitter:image" content={image} />

            <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
            <script type="application/ld+json">{JSON.stringify(webpageSchema)}</script>
            {breadcrumbSchema && (
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            )}
        </Helmet>
    );
}

export default RouteSeo;
