import { Router, type Request, type Response } from 'express';
import { query } from '../config/database';
import { config } from '../config';

type SitemapEntry = {
    loc: string;
    changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority: string;
    lastmod?: string;
};

type ProductSitemapRow = {
    id: number;
    updated_at: Date | string | null;
    created_at: Date | string | null;
};

type BrandSitemapRow = {
    slug: string;
    created_at: Date | string | null;
};

type CategorySitemapRow = {
    slug: string;
    created_at: Date | string | null;
};

const router = Router();

function getBaseUrl(req: Request): string {
    const configured = (config.appBaseUrl || config.frontendUrl || '').trim();
    if (configured && !configured.includes('localhost') && !configured.includes('127.0.0.1')) {
        return configured.replace(/\/+$/, '');
    }

    const forwardedProto = req.header('x-forwarded-proto')?.split(',')[0]?.trim();
    const forwardedHost = req.header('x-forwarded-host')?.split(',')[0]?.trim();
    const host = forwardedHost || req.header('host');
    const protocol = forwardedProto || req.protocol || 'https';

    if (host) {
        return `${protocol}://${host}`.replace(/\/+$/, '');
    }

    return 'https://yourhairbeauty.co.uk';
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toIso(input: Date | string | null | undefined): string | undefined {
    if (!input) return undefined;
    const parsed = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString();
}

function makeStaticEntries(baseUrl: string): SitemapEntry[] {
    return [
        { loc: `${baseUrl}/`, changefreq: 'daily', priority: '1.0' },
        { loc: `${baseUrl}/shop`, changefreq: 'daily', priority: '0.9' },
        { loc: `${baseUrl}/categories`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/about`, changefreq: 'monthly', priority: '0.7' },
        { loc: `${baseUrl}/brands`, changefreq: 'weekly', priority: '0.8' },
        { loc: `${baseUrl}/new-arrivals`, changefreq: 'daily', priority: '0.8' },
        { loc: `${baseUrl}/trending`, changefreq: 'daily', priority: '0.8' },
        { loc: `${baseUrl}/best-sellers`, changefreq: 'daily', priority: '0.8' },
        { loc: `${baseUrl}/sale`, changefreq: 'daily', priority: '0.8' },
        { loc: `${baseUrl}/contact`, changefreq: 'monthly', priority: '0.6' },
        { loc: `${baseUrl}/help`, changefreq: 'monthly', priority: '0.5' },
        { loc: `${baseUrl}/privacy`, changefreq: 'yearly', priority: '0.4' },
        { loc: `${baseUrl}/terms`, changefreq: 'yearly', priority: '0.4' },
        { loc: `${baseUrl}/cookies`, changefreq: 'yearly', priority: '0.4' },
        { loc: `${baseUrl}/returns-policy`, changefreq: 'monthly', priority: '0.5' },
    ];
}

router.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /dashboard',
        'Disallow: /checkout',
        'Disallow: /pay',
        'Disallow: /login',
        'Disallow: /register',
        'Disallow: /forgot-password',
        'Disallow: /api/',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');

    res.type('text/plain').send(robots);
});

router.get('/sitemap.xml', async (req: Request, res: Response) => {
    const baseUrl = getBaseUrl(req);
    const entries: SitemapEntry[] = makeStaticEntries(baseUrl);

    try {
        const products = await query<ProductSitemapRow[]>(
            'SELECT id, updated_at, created_at FROM products ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 50000'
        );

        for (const product of products) {
            entries.push({
                loc: `${baseUrl}/product/${product.id}`,
                changefreq: 'weekly',
                priority: '0.8',
                lastmod: toIso(product.updated_at || product.created_at),
            });
        }

        const brands = await query<BrandSitemapRow[]>(
            'SELECT slug, created_at FROM brands WHERE is_active = 1 ORDER BY name ASC'
        );
        for (const brand of brands) {
            entries.push({
                loc: `${baseUrl}/brands/${brand.slug}`,
                changefreq: 'weekly',
                priority: '0.7',
                lastmod: toIso(brand.created_at),
            });
        }

        const categories = await query<CategorySitemapRow[]>(
            'SELECT slug, created_at FROM categories ORDER BY name ASC'
        );
        for (const category of categories) {
            entries.push({
                loc: `${baseUrl}/shop/${category.slug}`,
                changefreq: 'weekly',
                priority: '0.7',
                lastmod: toIso(category.created_at),
            });
        }
    } catch (error) {
        console.error('SEO sitemap generation fallback:', error);
    }

    const xmlUrls = entries
        .map((entry) => {
            const parts = [
                '<url>',
                `  <loc>${escapeXml(entry.loc)}</loc>`,
                `  <changefreq>${entry.changefreq}</changefreq>`,
                `  <priority>${entry.priority}</priority>`,
            ];
            if (entry.lastmod) {
                parts.push(`  <lastmod>${entry.lastmod}</lastmod>`);
            }
            parts.push('</url>');
            return parts.join('\n');
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

    res.type('application/xml').send(xml);
});

export default router;
