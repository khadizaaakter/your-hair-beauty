import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/slug';

const router = Router();
let hasHowToUseColumn: boolean | null = null;
let hasIngredientsColumn: boolean | null = null;
let hasOrderItemSelectedVariantsColumn: boolean | null = null;

async function supportsHowToUseColumn(): Promise<boolean> {
    if (hasHowToUseColumn !== null) return hasHowToUseColumn;
    const columns = await query<any[]>('SHOW COLUMNS FROM products LIKE "how_to_use"');
    hasHowToUseColumn = columns.length > 0;
    return hasHowToUseColumn;
}

async function supportsIngredientsColumn(): Promise<boolean> {
    if (hasIngredientsColumn !== null) return hasIngredientsColumn;
    const columns = await query<any[]>('SHOW COLUMNS FROM products LIKE "ingredients"');
    hasIngredientsColumn = columns.length > 0;
    return hasIngredientsColumn;
}

async function supportsOrderItemSelectedVariantsColumn(): Promise<boolean> {
    if (hasOrderItemSelectedVariantsColumn !== null) return hasOrderItemSelectedVariantsColumn;
    const columns = await query<any[]>(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'order_items'
          AND COLUMN_NAME = 'selected_variants_json'
    `);
    hasOrderItemSelectedVariantsColumn = columns.length > 0;
    return hasOrderItemSelectedVariantsColumn;
}

type IncomingVariant = {
    name?: string;
    value?: string;
    color_code?: string;
    image?: string;
    price_adjustment?: number;
    stock_quantity?: number;
    sku?: string;
};

function normalizeVariantType(name: string | undefined): 'Size' | 'Color' | 'Image' | 'Option' {
    const normalized = String(name || '').trim().toLowerCase();
    if (normalized.includes('color') || normalized.includes('colour')) return 'Color';
    if (normalized.includes('size')) return 'Size';
    if (normalized.includes('image')) return 'Image';
    return 'Option';
}

function normalizeHexColor(input: string): string | null {
    const raw = String(input || '').trim();
    if (!raw) return null;
    const hex = raw.startsWith('#') ? raw.slice(1) : raw;
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return null;
    return `#${hex.toUpperCase()}`;
}

function validateIncomingVariants(variants: unknown): IncomingVariant[] {
    if (!Array.isArray(variants)) return [];

    const normalized: IncomingVariant[] = [];
    for (const raw of variants) {
        const variant = (raw || {}) as IncomingVariant;
        const type = normalizeVariantType(variant.name);
        const value = String(variant.value || '').trim();
        const image = String(variant.image || '').trim();

        if (!value && type !== 'Image') {
            throw new ApiError('Variant option value is required', 400);
        }

        if (type === 'Color') {
            const hex = normalizeHexColor(variant.color_code || value);
            if (!hex) {
                throw new ApiError(`Invalid color code "${value || variant.color_code || ''}". Use 6-digit hex like #FFFFFF`, 400);
            }
            normalized.push({
                ...variant,
                name: 'Color',
                value: hex,
                color_code: hex,
                image: image || undefined,
            });
            continue;
        }

        if (type === 'Image') {
            if (!value) {
                throw new ApiError('Image variant title is required', 400);
            }
            if (!image) {
                throw new ApiError(`Image variant "${value}" must include an image`, 400);
            }
            normalized.push({
                ...variant,
                name: 'Image',
                value,
                image,
                color_code: undefined,
            });
            continue;
        }

        normalized.push({
            ...variant,
            name: type === 'Size' ? 'Size' : String(variant.name || 'Option'),
            value,
        });
    }

    return normalized;
}

function normalizeNumericSetting(value: unknown, fallback = 0): string {
    const cleaned = String(value ?? '')
        .trim()
        .replace(/[^0-9,.-]/g, '')
        .replace(/,/g, '.');
    const parsed = Number.parseFloat(cleaned);
    const normalized = Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
    return String(normalized);
}

function normalizeSettingValue(key: string, value: unknown): string {
    if (key === 'free_shipping_threshold' || key === 'delivery_charge') {
        return normalizeNumericSetting(value, 0);
    }
    return String(value ?? '').trim();
}

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// =============== DASHBOARD STATS ===============
router.get('/stats', async (req, res, next) => {
    try {
        // 1. Current Totals
        const [orders] = await query<any[]>(`
            SELECT
                COUNT(*) as count,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
            FROM orders
        `);
        const [products] = await query<any[]>('SELECT COUNT(*) as count FROM products');
        const [customers] = await query<any[]>("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
        const [pendingOrders] = await query<any[]>(
            "SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'pending_payment')"
        );

        // 2. Previous Month Totals (for trends)
        const now = new Date();
        const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [prevOrders] = await query<any[]>(`
            SELECT
                COUNT(*) as count,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
            FROM orders
            WHERE created_at >= ? AND created_at <= ?
        `, [firstDayPrevMonth, lastDayPrevMonth]);
        const [prevCustomers] = await query<any[]>(
            "SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND created_at >= ? AND created_at <= ?",
            [firstDayPrevMonth, lastDayPrevMonth]
        );
        const [prevProducts] = await query<any[]>(
            "SELECT COUNT(*) as count FROM products WHERE created_at >= ? AND created_at <= ?",
            [firstDayPrevMonth, lastDayPrevMonth]
        );


        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        // Note: For total orders/revenue, we probably want to compare "this month so far" vs "last month same time" or just "last month total" vs "this month total".
        // A better trend for "Total Revenue" (all time) is usually "Revenue this month" vs "Revenue last month".
        // However, the dashboard shows "Total Revenue". Developing a "change" for a running total is tricky.
        // Usually dashboards show "Total Revenue" and the trend is "Sales this month vs last month".
        // Let's assume the trend is based on monthly performance, even if the main number is total.

        const [currentMonthOrders] = await query<any[]>(`
            SELECT
                COUNT(*) as count,
                COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
            FROM orders
            WHERE created_at >= ?
        `, [firstDayCurrentMonth]);

        const revenueTrend = calculateTrend(currentMonthOrders.revenue, prevOrders.revenue);
        const ordersTrend = calculateTrend(currentMonthOrders.count, prevOrders.count);

        // For customers and products, we can calculate "new this month" vs "new last month"
        const [newCustomersthisMonth] = await query<any[]>(
            "SELECT COUNT(*) as count FROM users WHERE role = 'customer' AND created_at >= ?",
            [firstDayCurrentMonth]
        );
        const [newProductsThisMonth] = await query<any[]>(
            "SELECT COUNT(*) as count FROM products WHERE created_at >= ?",
            [firstDayCurrentMonth]
        );

        const customersTrend = calculateTrend(newCustomersthisMonth.count, prevCustomers.count);
        const productsTrend = calculateTrend(newProductsThisMonth.count, prevProducts.count);


        // 3. Last 6 Months Charts
        // We need to generate the months strictly to handle gaps, but for now simple GROUP BY is fine if we have data.
        // If gaps are possible, we might need a more complex query or fill in js.
        // Let's assume some data exists or we get partial.

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // 0-5 = 6 months
        sixMonthsAgo.setDate(1);

        const chartsData = await query<any[]>(`
            SELECT
                DATE_FORMAT(created_at, '%b') as name,
                MONTH(created_at) as month_num,
                YEAR(created_at) as year_num,
                COALESCE(SUM(total_amount), 0) as sales,
                COUNT(*) as orders
            FROM orders
            WHERE created_at >= ? AND payment_status = 'paid'
            GROUP BY year_num, month_num, name
            ORDER BY year_num ASC, month_num ASC
        `, [sixMonthsAgo]);

        res.json({
            success: true,
            data: {
                totalOrders: orders.count || 0,
                totalRevenue: orders.revenue || 0,
                totalProducts: products.count || 0,
                totalCustomers: customers.count || 0,
                pendingOrders: pendingOrders.count || 0,
                trends: {
                    revenue: revenueTrend,
                    orders: ordersTrend,
                    customers: customersTrend,
                    products: productsTrend
                },
                charts: chartsData
            }
        });
    } catch (error) {
        next(error);
    }
});

// =============== PRODUCTS ===============
router.get('/products', async (req, res, next) => {
    try {
        const products = await query<any[]>(`
            SELECT p.*, c.name as category_name, b.name as brand_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            ORDER BY p.created_at DESC
        `);

        const variants = await query<any[]>('SELECT * FROM product_variants');

        res.json({
            success: true,
            data: products.map(p => ({
                ...p,
                images: p.images ? JSON.parse(p.images) : [],
                variants: variants.filter(v => v.product_id === p.id)
            }))
        });
    } catch (error) {
        next(error);
    }
});

router.post('/products', async (req, res, next) => {
    try {
        const {
            name,
            short_description,
            description,
            how_to_use,
            ingredients,
            price,
            sale_price,
            stock_quantity,
            category_id,
            subcategory_id,
            brand_id,
            images,
            badge,
            is_featured,
            variants
        } = req.body;

        if (short_description && String(short_description).length > 500) {
            throw new ApiError('Short description must be 500 characters or less', 400);
        }
        if (ingredients && String(ingredients).length > 3000) {
            throw new ApiError('Ingredients must be 3000 characters or less', 400);
        }

        const hasHowToUse = await supportsHowToUseColumn();
        const hasIngredients = await supportsIngredientsColumn();
        const normalizedVariants = validateIncomingVariants(variants);
        const has_variants = normalizedVariants.length > 0;

        const columns = [
            'name',
            'short_description',
            'description',
            ...(hasHowToUse ? ['how_to_use'] : []),
            ...(hasIngredients ? ['ingredients'] : []),
            'price',
            'sale_price',
            'stock_quantity',
            'category_id',
            'subcategory_id',
            'brand_id',
            'images',
            'badge',
            'is_featured',
            'has_variants',
        ];

        const values = [
            name,
            short_description || null,
            description || null,
            ...(hasHowToUse ? [how_to_use || null] : []),
            ...(hasIngredients ? [ingredients || null] : []),
            price,
            sale_price || null,
            stock_quantity,
            category_id || null,
            subcategory_id || null,
            brand_id || null,
            JSON.stringify(images || []),
            badge || null,
            is_featured ? 1 : 0,
            has_variants ? 1 : 0,
        ];

        const placeholders = columns.map(() => '?').join(', ');
        const result = await query<any>(`
            INSERT INTO products (${columns.join(', ')})
            VALUES (${placeholders})
        `, values);

        const productId = result.insertId;

        if (has_variants) {
            for (const v of normalizedVariants) {
                await query(`
                    INSERT INTO product_variants (product_id, name, value, color_code, image, price_adjustment, stock_quantity, sku)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    productId,
                    v.name || 'Option',
                    v.value,
                    v.color_code || null,
                    v.image || null,
                    v.price_adjustment ?? 0,
                    v.stock_quantity ?? 100,
                    v.sku || null
                ]);
            }
        }

        res.status(201).json({ success: true, data: { id: productId } });
    } catch (error: any) {
        console.error('❌ Error creating product:', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });
        next(error);
    }
});

router.put('/products/:id', async (req, res, next) => {
    try {
        const {
            name,
            short_description,
            description,
            how_to_use,
            ingredients,
            price,
            sale_price,
            stock_quantity,
            category_id,
            subcategory_id,
            brand_id,
            images,
            badge,
            is_featured,
            variants
        } = req.body;

        if (short_description && String(short_description).length > 500) {
            throw new ApiError('Short description must be 500 characters or less', 400);
        }
        if (ingredients && String(ingredients).length > 3000) {
            throw new ApiError('Ingredients must be 3000 characters or less', 400);
        }

        const hasHowToUse = await supportsHowToUseColumn();
        const hasIngredients = await supportsIngredientsColumn();
        const normalizedVariants = validateIncomingVariants(variants);
        const has_variants = normalizedVariants.length > 0;

        const setClauses = [
            'name=?',
            'short_description=?',
            'description=?',
            ...(hasHowToUse ? ['how_to_use=?'] : []),
            ...(hasIngredients ? ['ingredients=?'] : []),
            'price=?',
            'sale_price=?',
            'stock_quantity=?',
            'category_id=?',
            'subcategory_id=?',
            'brand_id=?',
            'images=?',
            'badge=?',
            'is_featured=?',
            'has_variants=?',
        ];

        const values = [
            name,
            short_description || null,
            description || null,
            ...(hasHowToUse ? [how_to_use || null] : []),
            ...(hasIngredients ? [ingredients || null] : []),
            price,
            sale_price || null,
            stock_quantity,
            category_id || null,
            subcategory_id || null,
            brand_id || null,
            JSON.stringify(images || []),
            badge || null,
            is_featured ? 1 : 0,
            has_variants ? 1 : 0,
            req.params.id,
        ];

        await query(`
            UPDATE products SET
                ${setClauses.join(', ')}
            WHERE id=?
        `, values);

        // Delete existing variants and re-insert
        await query('DELETE FROM product_variants WHERE product_id = ?', [req.params.id]);

        if (has_variants) {
            for (const v of normalizedVariants) {
                await query(`
                    INSERT INTO product_variants (product_id, name, value, color_code, image, price_adjustment, stock_quantity, sku)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    req.params.id,
                    v.name || 'Option',
                    v.value,
                    v.color_code || null,
                    v.image || null,
                    v.price_adjustment ?? 0,
                    v.stock_quantity ?? 100,
                    v.sku || null
                ]);
            }
        }

        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/products/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============== ORDERS ===============
router.get('/orders', async (req, res, next) => {
    try {
        const includeSelectedVariants = await supportsOrderItemSelectedVariantsColumn();
        const orders = await query<any[]>(`
            SELECT
                o.*,
                u.name as user_name,
                u.email as user_email,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'variant_id', oi.variant_id,
                        'selected_variants_json', ${includeSelectedVariants ? 'oi.selected_variants_json' : 'NULL'},
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'name', p.name,
                        'variant_name', v.name,
                        'variant_value', v.value,
                        'variant_color', v.color_code,
                        'image', IFNULL(v.image, IFNULL(p.images, '[]'))
                    )
                ) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants v ON oi.variant_id = v.id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);

        res.json({
            success: true,
            data: orders.map((o) => {
                const shippingAddress = (() => {
                    if (!o.shipping_address) return null;
                    try {
                        return JSON.parse(o.shipping_address);
                    } catch {
                        return o.shipping_address;
                    }
                })();

                const guestFirstName = typeof shippingAddress === 'object' && shippingAddress
                    ? String(shippingAddress.firstName || '').trim()
                    : '';
                const guestLastName = typeof shippingAddress === 'object' && shippingAddress
                    ? String(shippingAddress.lastName || '').trim()
                    : '';
                const guestEmail = typeof shippingAddress === 'object' && shippingAddress
                    ? String(shippingAddress.email || '').trim()
                    : '';
                const guestName = [guestFirstName, guestLastName].filter(Boolean).join(' ').trim();

                return {
                    ...o,
                    user_name: o.user_name || guestName || null,
                    user_email: o.user_email || guestEmail || null,
                    shipping_address: shippingAddress,
                    items: (() => {
                        if (!o.items) return [];
                        try {
                            const parsed = JSON.parse(`[${o.items}]`);
                            return parsed.map((item: any) => {
                                let normalizedImage = item.image;
                                let selectedVariants = null;
                                try {
                                    const asJson = JSON.parse(item.image);
                                    normalizedImage = Array.isArray(asJson) ? asJson[0] : item.image;
                                } catch {
                                    // keep as-is if not json
                                }
                                try {
                                    selectedVariants = item.selected_variants_json
                                        ? (typeof item.selected_variants_json === 'string'
                                            ? JSON.parse(item.selected_variants_json)
                                            : item.selected_variants_json)
                                        : null;
                                } catch {
                                    selectedVariants = null;
                                }
                                return {
                                    ...item,
                                    image: normalizedImage || null,
                                    selected_variants: Array.isArray(selectedVariants) ? selectedVariants : []
                                };
                            });
                        } catch {
                            return [];
                        }
                    })(),
                };
            })
        });
    } catch (error) {
        next(error);
    }
});

router.put('/orders/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        await query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/orders/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM orders WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============== CUSTOMERS ===============
router.get('/customers', async (req, res, next) => {
    try {
        const customers = await query<any[]>(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at,
                   COUNT(o.id) as order_count,
                   COALESCE(SUM(o.total_amount), 0) as total_spent
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
            WHERE u.role = 'customer'
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);

        res.json({ success: true, data: customers });
    } catch (error) {
        next(error);
    }
});

router.get('/customers/:id', async (req, res, next) => {
    try {
        const [customer] = await query<any[]>(`
            SELECT u.id, u.name, u.email, u.phone, u.address, u.created_at,
                   COUNT(o.id) as order_count,
                   COALESCE(SUM(o.total_amount), 0) as total_spent,
                   CASE WHEN u.is_blocked = 1 THEN 'blocked' ELSE 'active' END as status
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
            WHERE u.id = ? AND u.role = 'customer'
            GROUP BY u.id
        `, [req.params.id]);

        if (!customer) {
            throw new ApiError('Customer not found', 404);
        }

        // Get orders for this customer
        const orders = await query<any[]>(`
            SELECT id, total_amount, status, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `, [req.params.id]);

        res.json({
            success: true,
            data: {
                ...customer,
                orders
            }
        });
    } catch (error) {
        next(error);
    }
});

router.put('/customers/:id', async (req, res, next) => {
    try {
        const { name, email, phone, address, status } = req.body;
        const is_blocked = status === 'blocked' ? 1 : 0;

        await query(
            'UPDATE users SET name=?, email=?, phone=?, address=?, is_blocked=? WHERE id=? AND role="customer"',
            [name, email, phone || null, address || null, is_blocked, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/customers/:id', async (req, res, next) => {
    try {
        // Optional: Check if customer has orders before deleting?
        // For now, allow deletion (cascading delete should handle orders if set up in DB, otherwise might error)
        // Assuming standard behavior is to allow delete.

        await query('DELETE FROM users WHERE id = ? AND role = "customer"', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============== CATEGORIES ===============
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await query<any[]>('SELECT * FROM categories ORDER BY name');
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
});

router.post('/categories', async (req, res, next) => {
    try {
        const { name, slug, image } = req.body;
        const categorySlug = generateSlug(slug || name);
        const result = await query<any>(
            'INSERT INTO categories (name, slug, image) VALUES (?, ?, ?)',
            [name, categorySlug, image]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

router.put('/categories/:id', async (req, res, next) => {
    try {
        const { name, slug, image } = req.body;
        const categorySlug = generateSlug(slug || name);
        await query(
            'UPDATE categories SET name=?, slug=?, image=? WHERE id=?',
            [name, categorySlug, image, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/categories/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============== BRANDS ===============
router.get('/brands', async (req, res, next) => {
    try {
        const brands = await query<any[]>('SELECT id, name, slug, logo as logo_url, is_active FROM brands ORDER BY name');
        res.json({ success: true, data: brands });
    } catch (error) {
        next(error);
    }
});

router.post('/brands', async (req, res, next) => {
    try {
        const { name, slug, logo, logo_url, is_active } = req.body;
        const brandSlug = generateSlug(slug || name);
        const brandLogo = logo || logo_url || null;

        const result = await query<any>(
            'INSERT INTO brands (name, slug, logo, is_active) VALUES (?, ?, ?, ?)',
            [name, brandSlug, brandLogo, is_active ? 1 : 0]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

router.put('/brands/:id', async (req, res, next) => {
    try {
        const { name, slug, logo, logo_url, is_active } = req.body;
        const brandSlug = generateSlug(slug || name);
        const brandLogo = logo || logo_url || null;

        await query(
            'UPDATE brands SET name=?, slug=?, logo=?, is_active=? WHERE id=?',
            [name, brandSlug, brandLogo, is_active ? 1 : 0, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/brands/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM brands WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});
router.get('/hero-sliders', async (req, res, next) => {
    try {
        const sliders = await query<any[]>('SELECT * FROM hero_sliders ORDER BY order_index');
        res.json({ success: true, data: sliders });
    } catch (error) {
        next(error);
    }
});

router.post('/hero-sliders', async (req, res, next) => {
    try {
        // Accept both camelCase and snake_case for button fields
        const { image, title, description, button_text, button_link, buttonText, buttonLink, order_index } = req.body;
        const btnText = button_text || buttonText || '';
        const btnLink = button_link || buttonLink || '';

        const result = await query<any>(
            'INSERT INTO hero_sliders (image, title, description, button_text, button_link, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [image, title, description || '', btnText, btnLink, order_index || 0]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

router.put('/hero-sliders/:id', async (req, res, next) => {
    try {
        // Accept both camelCase and snake_case for button fields
        const { image, title, description, button_text, button_link, buttonText, buttonLink, order_index, is_active } = req.body;
        const btnText = button_text || buttonText || '';
        const btnLink = button_link || buttonLink || '';

        await query(
            'UPDATE hero_sliders SET image=?, title=?, description=?, button_text=?, button_link=?, order_index=?, is_active=? WHERE id=?',
            [image, title, description || '', btnText, btnLink, order_index || 0, is_active !== false ? 1 : 0, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/hero-sliders/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM hero_sliders WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============== SETTINGS ===============
router.get('/settings', async (req, res, next) => {
    try {
        const settings = await query<any[]>('SELECT setting_key, setting_value FROM settings');
        const settingsObj: Record<string, string> = {};
        settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
        res.json({ success: true, data: settingsObj });
    } catch (error) {
        next(error);
    }
});

router.put('/settings', async (req, res, next) => {
    try {
        const settings = req.body;

        // Update each setting
        for (const [key, value] of Object.entries(settings)) {
            const normalizedValue = normalizeSettingValue(key, value);
            await query(
                `INSERT INTO settings (setting_key, setting_value) 
                 VALUES (?, ?) 
                 ON DUPLICATE KEY UPDATE setting_value = ?`,
                [key, normalizedValue, normalizedValue]
            );
        }

        res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
        next(error);
    }
});

// =============== COLLECTIONS ===============
router.get('/collections', async (req, res, next) => {
    try {
        const collections = await query<any[]>('SELECT * FROM featured_collections ORDER BY order_index');
        res.json({ success: true, data: collections });
    } catch (error) {
        next(error);
    }
});

router.post('/collections', async (req, res, next) => {
    try {
        const { title, description, image_url, button_link, order_index } = req.body;
        const result = await query<any>(
            'INSERT INTO featured_collections (title, description, image_url, button_link, order_index) VALUES (?, ?, ?, ?, ?)',
            [title, description || '', image_url || '', button_link || '', order_index || 0]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

router.put('/collections/:id', async (req, res, next) => {
    try {
        const { title, description, image_url, button_link, order_index } = req.body;
        await query(
            'UPDATE featured_collections SET title=?, description=?, image_url=?, button_link=?, order_index=? WHERE id=?',
            [title, description || '', image_url || '', button_link || '', order_index || 0, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/collections/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM featured_collections WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// =============== COUPONS ===============
router.get('/coupons', async (req, res, next) => {
    try {
        const coupons = await query<any[]>('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json({ success: true, data: coupons });
    } catch (error) {
        next(error);
    }
});

router.post('/coupons', async (req, res, next) => {
    try {
        const { code, discount_type, discount_value, min_order_amount, max_uses, expiry_date } = req.body;
        const normalizedDiscountType = String(discount_type || '').toLowerCase() === 'percent'
            ? 'percentage'
            : discount_type;
        const result = await query<any>(
            'INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_uses, valid_until) VALUES (?, ?, ?, ?, ?, ?)',
            [code, normalizedDiscountType, discount_value, min_order_amount || 0, max_uses || null, expiry_date || null]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

router.put('/coupons/:id', async (req, res, next) => {
    try {
        const { code, discount_type, discount_value, min_order_amount, max_uses, expiry_date, is_active } = req.body;
        const normalizedDiscountType = String(discount_type || '').toLowerCase() === 'percent'
            ? 'percentage'
            : discount_type;
        await query(
            'UPDATE coupons SET code=?, discount_type=?, discount_value=?, min_order_amount=?, max_uses=?, valid_until=?, is_active=? WHERE id=?',
            [code, normalizedDiscountType, discount_value, min_order_amount || 0, max_uses || null, expiry_date || null, is_active !== false ? 1 : 0, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/coupons/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});


// =============== SUBCATEGORIES ===============
router.get('/subcategories/:categoryId', async (req, res, next) => {
    try {
        const subcategories = await query<any[]>(
            'SELECT * FROM subcategories WHERE category_id = ? ORDER BY name',
            [req.params.categoryId]
        );
        res.json({ success: true, data: subcategories });
    } catch (error) {
        next(error);
    }
});

router.post('/subcategories', async (req, res, next) => {
    try {
        const { category_id, name, slug } = req.body;
        const subSlug = generateSlug(slug || name);
        const result = await query<any>(
            'INSERT INTO subcategories (category_id, name, slug) VALUES (?, ?, ?)',
            [category_id, name, subSlug]
        );
        res.status(201).json({ success: true, data: { id: result.insertId } });
    } catch (error) {
        next(error);
    }
});

router.put('/subcategories/:id', async (req, res, next) => {
    try {
        const { name, slug } = req.body;
        const subSlug = generateSlug(slug || name);
        await query(
            'UPDATE subcategories SET name=?, slug=? WHERE id=?',
            [name, subSlug, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

router.delete('/subcategories/:id', async (req, res, next) => {
    try {
        await query('DELETE FROM subcategories WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

export default router;

