import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

// Get all active brands
router.get('/', async (req, res, next) => {
    try {
        const brands = await query<any[]>('SELECT id, name, slug, logo FROM brands WHERE is_active = 1 ORDER BY name');
        res.json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
});

// Get brand detail by slug (with product categories)
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const brands = await query<any[]>('SELECT * FROM brands WHERE slug = ? LIMIT 1', [slug]);
        if (!brands.length) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        const brand = brands[0];

        // Get categories that this brand's products belong to
        const categories = await query<any[]>(`
            SELECT DISTINCT c.id, c.name, c.slug, c.image,
                   COUNT(p.id) as product_count
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE p.brand_id = ?
            GROUP BY c.id, c.name, c.slug, c.image
            ORDER BY product_count DESC
        `, [brand.id]);

        // Get total product count for this brand
        const countResult = await query<any[]>('SELECT COUNT(*) as total FROM products WHERE brand_id = ?', [brand.id]);
        const totalProducts = countResult[0]?.total || 0;

        res.json({
            success: true,
            data: {
                ...brand,
                totalProducts,
                categories
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;