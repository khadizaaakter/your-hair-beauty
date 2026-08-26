import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

// Get all products with filtering
router.get('/', async (req, res, next) => {
    try {
        const { category, brand, search, q, sort, limit = 20, offset = 0, min_price, max_price, subcategory } = req.query;

        let sql = `
            SELECT p.*, 
                   c.name as category_name, 
                   c.slug as category_slug,
                   s.name as subcategory_name,
                   s.slug as subcategory_slug,
                   b.name as brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN subcategories s ON p.subcategory_id = s.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (category) {
            sql += ' AND c.slug = ?';
            params.push(category);
        }

        if (subcategory) {
            sql += ' AND s.slug = ?';
            params.push(subcategory);
        }

        if (brand) {
            sql += ' AND b.slug = ?';
            params.push(brand);
        }

        if (req.query.badge) {
            sql += ' AND p.badge = ?';
            params.push(req.query.badge);
        }

        if (min_price) {
            sql += ' AND p.price >= ?';
            params.push(Number(min_price));
        }

        if (max_price) {
            sql += ' AND p.price <= ?';
            params.push(Number(max_price));
        }

        const searchQuery = search || q;
        if (searchQuery) {
            sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ? OR s.name LIKE ? OR b.name LIKE ?)';
            params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
        }

        // Sorting
        switch (sort) {
            case 'price_asc':
                sql += ' ORDER BY p.price ASC';
                break;
            case 'price_desc':
                sql += ' ORDER BY p.price DESC';
                break;
            case 'newest':
                sql += ' ORDER BY p.created_at DESC';
                break;
            default:
                sql += ' ORDER BY p.id DESC';
        }

        // Calculate offset if page is provided
        let calcOffset = Number(offset);
        if (req.query.page) {
            calcOffset = (Number(req.query.page) - 1) * Number(limit);
        }

        sql += ' LIMIT ? OFFSET ?';
        params.push(Number(limit), calcOffset);

        const products = await query<any[]>(sql, params);

        // Get total count
        const [countResult] = await query<any[]>('SELECT COUNT(*) as total FROM products');

        res.json({
            success: true,
            data: products.map(p => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : [],
                inStock: p.stock_quantity > 0,
            })),
            pagination: {
                total: countResult.total,
                limit: Number(limit),
                offset: calcOffset,
                page: req.query.page ? Number(req.query.page) : Math.floor(calcOffset / Number(limit)) + 1,
                totalPages: Math.ceil(countResult.total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get single product
router.get('/:id', async (req, res, next) => {
    try {
        const products = await query<any[]>(`
            SELECT p.*, 
                   c.name as category_name, 
                   c.slug as category_slug,
                   b.name as brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const product = products[0];

        // Get variants
        const variants = await query<any[]>(`
            SELECT * FROM product_variants WHERE product_id = ?
        `, [product.id]);

        // Get related products
        const relatedProducts = await query<any[]>(`
            SELECT * FROM products 
            WHERE category_id = ? AND id != ? 
            LIMIT 4
        `, [product.category_id, product.id]);

        res.json({
            success: true,
            data: {
                ...product,
                images: product.images ? JSON.parse(product.images) : [],
                inStock: product.stock_quantity > 0 || variants.some(v => v.stock_quantity > 0),
                variants: variants,
                relatedProducts: relatedProducts.map(p => ({
                    ...p,
                    images: p.images ? JSON.parse(p.images) : [],
                    inStock: p.stock_quantity > 0,
                })),
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
