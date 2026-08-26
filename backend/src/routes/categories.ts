import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

// Get all categories
router.get('/', async (req, res, next) => {
    try {
        const categories = await query<any[]>(`
            SELECT c.*, 
                   (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c
            ORDER BY c.name ASC
        `);

        // Get subcategories for each category
        const subcategories = await query<any[]>('SELECT * FROM subcategories');

        const categoriesWithSubs = categories.map(cat => ({
            ...cat,
            subcategories: subcategories.filter(sub => sub.category_id === cat.id),
        }));

        res.json({
            success: true,
            data: categoriesWithSubs
        });
    } catch (error) {
        next(error);
    }
});

// Get single category
router.get('/:slug', async (req, res, next) => {
    try {
        const categories = await query<any[]>(
            'SELECT * FROM categories WHERE slug = ?',
            [req.params.slug]
        );

        if (categories.length === 0) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.json({
            success: true,
            data: categories[0]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
