import { Router } from 'express';
import type { PoolConnection } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { query, pool } from '../config/database';
import { authenticate, authenticateOptional, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import { sendOrderLifecycleEmail } from '../services/orderNotifications';

const router = Router();

type CheckoutItemInput = {
    productId: number;
    variantId?: number;
    variantIds?: number[];
    quantity: number;
};

type ProcessedCheckoutItem = CheckoutItemInput & {
    price: number;
    selectedVariants?: Array<{
        id: number;
        name: string;
        value: string;
        color_code: string | null;
        image: string | null;
        price_adjustment: number;
    }>;
};

type CouponResolution = {
    code: string | null;
    discount: number;
    valid: boolean;
    message?: string;
};

type PricingSummary = {
    subtotal: number;
    deliveryFee: number;
    firstOrderDiscount: number;
    couponDiscount: number;
    totalDiscount: number;
    total: number;
    firstOrderEligible: boolean;
    coupon: CouponResolution;
    processedItems: ProcessedCheckoutItem[];
    freeShippingThreshold: number;
};

let supportsOrderPricingColumnsCache: boolean | null = null;
let supportsOrderItemSelectedVariantsCache: boolean | null = null;

function splitName(fullName: string): { firstName: string; lastName: string } {
    const normalized = String(fullName || '').trim();
    if (!normalized) return { firstName: '', lastName: '' };
    const parts = normalized.split(/\s+/);
    return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' '),
    };
}

function roundMoney(value: number): number {
    const rounded = Math.round((Number(value) + Number.EPSILON) * 100) / 100;
    return Number.isFinite(rounded) ? rounded : 0;
}

function parseNumericSetting(value: unknown, fallback: number): number {
    const raw = String(value ?? '').trim();
    if (!raw) return fallback;
    const cleaned = raw.replace(/[^0-9,.-]/g, '').replace(/,/g, '.');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeShippingAddress(raw: unknown): Record<string, any> {
    if (!raw) return {};
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return typeof parsed === 'object' && parsed !== null ? parsed : { address: raw };
        } catch {
            return { address: raw };
        }
    }
    if (typeof raw === 'object' && raw !== null) return raw as Record<string, any>;
    return {};
}

async function hydrateShippingAddressForUser(
    connection: PoolConnection,
    shippingAddress: Record<string, any>,
    userId: number | null
): Promise<Record<string, any>> {
    if (!userId) return shippingAddress;

    const [rows] = await connection.query<any[]>(
        'SELECT name, email, phone, address FROM users WHERE id = ? LIMIT 1',
        [userId]
    );

    if (rows.length === 0) return shippingAddress;

    const user = rows[0];
    const split = splitName(String(user.name || ''));

    return {
        ...shippingAddress,
        firstName: shippingAddress.firstName || split.firstName || '',
        lastName: shippingAddress.lastName || split.lastName || '',
        email: shippingAddress.email || String(user.email || '').trim(),
        phone: shippingAddress.phone || String(user.phone || '').trim(),
        address: shippingAddress.address || String(user.address || '').trim(),
        country: shippingAddress.country || 'United Kingdom',
    };
}

async function supportsOrderPricingColumns(connection: PoolConnection): Promise<boolean> {
    if (supportsOrderPricingColumnsCache !== null) {
        return supportsOrderPricingColumnsCache;
    }

    const [columns] = await connection.query<any[]>(
        `
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'orders'
              AND COLUMN_NAME IN (
                'subtotal_amount',
                'shipping_amount',
                'discount_amount',
                'first_order_discount_amount',
                'coupon_discount_amount',
                'coupon_code'
              )
        `
    );

    supportsOrderPricingColumnsCache = columns.length === 6;
    return supportsOrderPricingColumnsCache;
}

async function supportsOrderItemSelectedVariantsColumn(connection?: PoolConnection): Promise<boolean> {
    if (supportsOrderItemSelectedVariantsCache !== null) {
        return supportsOrderItemSelectedVariantsCache;
    }

    let columns: any[] = [];
    if (connection) {
        const [result] = await connection.query<any[]>(
            `
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'order_items'
                  AND COLUMN_NAME = 'selected_variants_json'
            `
        );
        columns = result;
    } else {
        columns = await query<any[]>(
            `
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'order_items'
                  AND COLUMN_NAME = 'selected_variants_json'
            `
        );
    }

    supportsOrderItemSelectedVariantsCache = columns.length === 1;
    return supportsOrderItemSelectedVariantsCache;
}

async function getCheckoutSettings(connection: PoolConnection): Promise<{
    freeShippingThreshold: number;
    deliveryCharge: number;
}> {
    const rows = await connection.query<any[]>(
        `
            SELECT setting_key, setting_value
            FROM settings
            WHERE setting_key IN ('free_shipping_threshold', 'delivery_charge')
        `
    );

    const list = rows[0] ?? [];
    const map = new Map<string, string>();
    for (const row of list) {
        map.set(String(row.setting_key), String(row.setting_value));
    }

    const freeShippingThreshold = parseNumericSetting(map.get('free_shipping_threshold'), 70);
    const deliveryCharge = parseNumericSetting(map.get('delivery_charge'), 3.99);

    return {
        freeShippingThreshold: Math.max(0, freeShippingThreshold),
        deliveryCharge: Math.max(0, deliveryCharge),
    };
}

async function calculateSubtotal(
    connection: PoolConnection,
    items: CheckoutItemInput[]
): Promise<{ subtotal: number; processedItems: ProcessedCheckoutItem[] }> {
    let subtotal = 0;
    const processedItems: ProcessedCheckoutItem[] = [];

    for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Number(item.quantity);
        const fromArray = Array.isArray(item.variantIds)
            ? item.variantIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
            : [];
        const fallbackVariant = item.variantId ? Number(item.variantId) : undefined;
        const normalizedVariantIds = Array.from(
            new Set(
                fromArray.length > 0
                    ? fromArray
                    : (fallbackVariant && Number.isInteger(fallbackVariant) && fallbackVariant > 0 ? [fallbackVariant] : [])
            )
        );

        if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
            throw new ApiError('Invalid cart item payload', 400);
        }

        const [productRows] = await connection.query<any[]>(
            'SELECT id, price, sale_price, stock_quantity, has_variants FROM products WHERE id = ?',
            [productId]
        );

        if (productRows.length === 0) throw new ApiError(`Product ${productId} not found`, 400);
        const product = productRows[0];
        const hasVariants = Number(product.has_variants || 0) === 1;
        const baseUnitPrice = Number(product.sale_price || product.price);

        let unitPrice = baseUnitPrice;
        let selectedVariants: ProcessedCheckoutItem['selectedVariants'] = [];

        if (normalizedVariantIds.length > 0) {
            const placeholders = normalizedVariantIds.map(() => '?').join(', ');
            const [variantRows] = await connection.query<any[]>(
                `
                    SELECT id, product_id, name, value, color_code, image, price_adjustment, stock_quantity
                    FROM product_variants
                    WHERE product_id = ? AND id IN (${placeholders})
                `,
                [productId, ...normalizedVariantIds]
            );

            if (variantRows.length !== normalizedVariantIds.length) {
                throw new ApiError('One or more selected variants are invalid', 400);
            }

            const variantsById = new Map<number, any>();
            for (const row of variantRows) variantsById.set(Number(row.id), row);

            const variantGroupSet = new Set<string>();
            for (const variantId of normalizedVariantIds) {
                const variant = variantsById.get(variantId);
                if (!variant) throw new ApiError(`Variant ${variantId} not found`, 400);
                if (Number(variant.stock_quantity) < quantity) {
                    throw new ApiError(`Insufficient stock for variant ${variant.value || variant.id}`, 400);
                }

                const groupName = String(variant.name || 'Option').trim().toLowerCase();
                if (variantGroupSet.has(groupName)) {
                    throw new ApiError('Only one option per variant type can be selected', 400);
                }
                variantGroupSet.add(groupName);
            }

            const [requiredGroupRows] = await connection.query<any[]>(
                'SELECT DISTINCT name FROM product_variants WHERE product_id = ?',
                [productId]
            );
            const requiredGroups = requiredGroupRows
                .map((row) => String(row.name || '').trim().toLowerCase())
                .filter(Boolean);

            if (requiredGroups.length > 0) {
                const missingGroups = requiredGroups.filter((group) => !variantGroupSet.has(group));
                if (missingGroups.length > 0) {
                    throw new ApiError('Please select all required variant options', 400);
                }
            }

            selectedVariants = normalizedVariantIds.map((variantId) => {
                const variant = variantsById.get(variantId)!;
                return {
                    id: Number(variant.id),
                    name: String(variant.name || 'Option'),
                    value: String(variant.value || ''),
                    color_code: variant.color_code ? String(variant.color_code) : null,
                    image: variant.image ? String(variant.image) : null,
                    price_adjustment: roundMoney(Number(variant.price_adjustment || 0)),
                };
            });

            unitPrice = baseUnitPrice + selectedVariants.reduce(
                (sum, variant) => sum + Number(variant.price_adjustment || 0),
                0
            );
        } else {
            if (hasVariants) {
                throw new ApiError('Please select variant options for this product', 400);
            }
            if (Number(product.stock_quantity) < quantity) {
                throw new ApiError(`Insufficient stock for selected product`, 400);
            }
        }

        const roundedPrice = roundMoney(unitPrice);
        subtotal += roundedPrice * quantity;
        processedItems.push({
            productId,
            variantId: normalizedVariantIds[0],
            variantIds: normalizedVariantIds.length > 0 ? normalizedVariantIds : undefined,
            selectedVariants,
            quantity,
            price: roundedPrice,
        });
    }

    return {
        subtotal: roundMoney(subtotal),
        processedItems,
    };
}

async function isFirstOrderEligible(
    connection: PoolConnection,
    userId: number | null
): Promise<boolean> {
    // First-order discount is account-only (no guest-email eligibility).
    if (!userId) {
        return false;
    }

    const sql = `
        SELECT COUNT(*) as count
        FROM orders
        WHERE payment_status = 'paid'
          AND user_id = ?
    `;

    const [rows] = await connection.query<any[]>(sql, [userId]);
    const count = Number(rows[0]?.count || 0);
    return count === 0;
}

async function resolveCoupon(
    connection: PoolConnection,
    couponCode: string | undefined,
    discountBase: number,
    strict: boolean
): Promise<CouponResolution> {
    if (!couponCode || !couponCode.trim()) {
        return { code: null, discount: 0, valid: false };
    }

    const code = couponCode.trim().toUpperCase();
    const [rows] = await connection.query<any[]>(
        `
            SELECT id, code, discount_type, discount_value, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active
            FROM coupons
            WHERE UPPER(code) = UPPER(?)
            LIMIT 1
        `,
        [code]
    );

    if (rows.length === 0) {
        if (strict) throw new ApiError('Invalid coupon code', 400);
        return { code, discount: 0, valid: false, message: 'Invalid coupon code' };
    }

    const coupon = rows[0];
    const now = Date.now();
    const isActive = Number(coupon.is_active) === 1;
    const startsAt = coupon.valid_from ? new Date(coupon.valid_from).getTime() : null;
    const endsAt = coupon.valid_until ? new Date(coupon.valid_until).getTime() : null;
    const minOrderAmount = Number(coupon.min_order_amount || 0);
    const maxUses = coupon.max_uses === null ? null : Number(coupon.max_uses);
    const usedCount = Number(coupon.used_count || 0);

    let invalidMessage = '';
    if (!isActive) invalidMessage = 'Coupon is inactive';
    else if (startsAt && startsAt > now) invalidMessage = 'Coupon is not active yet';
    else if (endsAt && endsAt < now) invalidMessage = 'Coupon has expired';
    else if (discountBase < minOrderAmount) invalidMessage = `Minimum order is £${minOrderAmount.toFixed(2)}`;
    else if (maxUses !== null && usedCount >= maxUses) invalidMessage = 'Coupon usage limit reached';

    if (invalidMessage) {
        if (strict) throw new ApiError(invalidMessage, 400);
        return { code, discount: 0, valid: false, message: invalidMessage };
    }

    const type = String(coupon.discount_type || '').toLowerCase();
    const isPercentage = type === 'percentage' || type === 'percent';
    let discount = isPercentage
        ? (discountBase * Number(coupon.discount_value || 0)) / 100
        : Number(coupon.discount_value || 0);

    discount = roundMoney(Math.min(Math.max(discount, 0), discountBase));

    return {
        code: String(coupon.code || code),
        discount,
        valid: true,
        message: 'Coupon applied',
    };
}

async function calculatePricing(
    connection: PoolConnection,
    payload: {
        items: CheckoutItemInput[];
        shippingAddress: Record<string, any>;
        userId: number | null;
        couponCode?: string;
    },
    strictCoupon: boolean
): Promise<PricingSummary> {
    const { subtotal, processedItems } = await calculateSubtotal(connection, payload.items);
    const settings = await getCheckoutSettings(connection);
    const isFreeShippingEnabled = settings.freeShippingThreshold > 0;
    const deliveryFee = isFreeShippingEnabled && subtotal >= settings.freeShippingThreshold
        ? 0
        : settings.deliveryCharge;

    const firstOrderEligible = await isFirstOrderEligible(connection, payload.userId);
    const firstOrderDiscount = firstOrderEligible ? roundMoney(subtotal * 0.1) : 0;

    const discountBase = roundMoney(Math.max(0, subtotal - firstOrderDiscount));
    const coupon = await resolveCoupon(connection, payload.couponCode, discountBase, strictCoupon);
    const couponDiscount = coupon.valid ? coupon.discount : 0;
    const totalDiscount = roundMoney(firstOrderDiscount + couponDiscount);
    const total = roundMoney(Math.max(0, subtotal - totalDiscount) + deliveryFee);

    return {
        subtotal,
        deliveryFee: roundMoney(deliveryFee),
        firstOrderDiscount,
        couponDiscount,
        totalDiscount,
        total,
        firstOrderEligible,
        coupon,
        processedItems,
        freeShippingThreshold: settings.freeShippingThreshold,
    };
}

// Live pricing preview for checkout (first-order discount + coupon + delivery).
router.post('/preview', authenticateOptional, async (req: AuthRequest, res, next) => {
    let connection: PoolConnection | undefined;
    try {
        const { items, shippingAddress, couponCode } = req.body || {};
        if (!Array.isArray(items) || items.length === 0) {
            throw new ApiError('Order must have at least one item', 400);
        }

        connection = await pool.getConnection();
        const normalizedShippingAddress = await hydrateShippingAddressForUser(
            connection,
            normalizeShippingAddress(shippingAddress),
            req.user ? req.user.id : null
        );
        const pricing = await calculatePricing(
            connection,
            {
                items,
                shippingAddress: normalizedShippingAddress,
                userId: req.user ? req.user.id : null,
                couponCode,
            },
            false
        );

        res.json({
            success: true,
            data: {
                subtotal: pricing.subtotal,
                deliveryFee: pricing.deliveryFee,
                firstOrderDiscount: pricing.firstOrderDiscount,
                couponDiscount: pricing.couponDiscount,
                totalDiscount: pricing.totalDiscount,
                total: pricing.total,
                firstOrderEligible: pricing.firstOrderEligible,
                freeShippingThreshold: pricing.freeShippingThreshold,
                coupon: {
                    code: pricing.coupon.code,
                    valid: pricing.coupon.valid,
                    message: pricing.coupon.message,
                },
            },
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// Create order
router.post('/', authenticateOptional, async (req: AuthRequest, res, next) => {
    let connection: PoolConnection | undefined;
    try {
        const {
            items,
            shippingAddress,
            couponCode,
            currency = 'GBP',
            exchangeRate = 1.0,
        } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            throw new ApiError('Order must have at least one item', 400);
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const normalizedShippingAddress = await hydrateShippingAddressForUser(
            connection,
            normalizeShippingAddress(shippingAddress),
            req.user ? req.user.id : null
        );
        const pricing = await calculatePricing(
            connection,
            {
                items,
                shippingAddress: normalizedShippingAddress,
                userId: req.user ? req.user.id : null,
                couponCode,
            },
            true
        );

        const orderCode = `ORD-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
        const userId = req.user ? req.user.id : null;
        const hasPricingColumns = await supportsOrderPricingColumns(connection);

        const [orderResult] = hasPricingColumns
            ? await connection.query<any>(
                `
                    INSERT INTO orders (
                        user_id,
                        total_amount,
                        subtotal_amount,
                        shipping_amount,
                        discount_amount,
                        first_order_discount_amount,
                        coupon_discount_amount,
                        coupon_code,
                        status,
                        payment_status,
                        shipping_address,
                        worldpay_order_code,
                        currency,
                        exchange_rate
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', 'pending', ?, ?, ?, ?)
                `,
                [
                    userId,
                    pricing.total,
                    pricing.subtotal,
                    pricing.deliveryFee,
                    pricing.totalDiscount,
                    pricing.firstOrderDiscount,
                    pricing.couponDiscount,
                    pricing.coupon.code,
                    JSON.stringify(normalizedShippingAddress),
                    orderCode,
                    currency,
                    exchangeRate,
                ]
            )
            : await connection.query<any>(
                `
                    INSERT INTO orders (user_id, total_amount, status, payment_status, shipping_address, worldpay_order_code, currency, exchange_rate)
                    VALUES (?, ?, 'pending_payment', 'pending', ?, ?, ?, ?)
                `,
                [
                    userId,
                    pricing.total,
                    JSON.stringify(normalizedShippingAddress),
                    orderCode,
                    currency,
                    exchangeRate,
                ]
            );

        const orderId = Number(orderResult.insertId);

        const hasSelectedVariantsColumn = await supportsOrderItemSelectedVariantsColumn(connection);

        for (const item of pricing.processedItems) {
            const selectedVariantIds = Array.isArray(item.variantIds)
                ? item.variantIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
                : [];

            if (selectedVariantIds.length > 0) {
                for (const selectedVariantId of selectedVariantIds) {
                    const [updateResult] = await connection.query<any>(
                        'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
                        [item.quantity, selectedVariantId, item.quantity]
                    );

                    if (updateResult.affectedRows === 0) {
                        throw new ApiError(`Failed to secure stock for selected variant`, 409);
                    }
                }

                if (hasSelectedVariantsColumn) {
                    await connection.query(
                        `
                            INSERT INTO order_items (order_id, product_id, variant_id, selected_variants_json, quantity, price)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `,
                        [
                            orderId,
                            item.productId,
                            selectedVariantIds[0] || null,
                            JSON.stringify(item.selectedVariants || []),
                            item.quantity,
                            item.price,
                        ]
                    );
                } else {
                    await connection.query(
                        `
                            INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
                            VALUES (?, ?, ?, ?, ?)
                        `,
                        [orderId, item.productId, selectedVariantIds[0] || null, item.quantity, item.price]
                    );
                }
            } else {
                const [updateResult] = await connection.query<any>(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
                    [item.quantity, item.productId, item.quantity]
                );

                if (updateResult.affectedRows === 0) {
                    throw new ApiError(`Failed to secure stock for selected product`, 409);
                }

                if (hasSelectedVariantsColumn) {
                    await connection.query(
                        `
                            INSERT INTO order_items (order_id, product_id, variant_id, selected_variants_json, quantity, price)
                            VALUES (?, ?, NULL, NULL, ?, ?)
                        `,
                        [orderId, item.productId, item.quantity, item.price]
                    );
                } else {
                    await connection.query(
                        `
                            INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
                            VALUES (?, ?, NULL, ?, ?)
                        `,
                        [orderId, item.productId, item.quantity, item.price]
                    );
                }
            }
        }

        await connection.commit();
        void sendOrderLifecycleEmail(orderId, 'placed').catch((error) => {
            console.error(`[Order email] Failed to queue placed email for orderId=${orderId}:`, error);
        });

        res.status(201).json({
            success: true,
            data: {
                orderId,
                orderCode,
                totalAmount: pricing.total,
                pricing: {
                    subtotal: pricing.subtotal,
                    deliveryFee: pricing.deliveryFee,
                    firstOrderDiscount: pricing.firstOrderDiscount,
                    couponDiscount: pricing.couponDiscount,
                    totalDiscount: pricing.totalDiscount,
                    total: pricing.total,
                    couponCode: pricing.coupon.code,
                },
            },
        });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

// Simple in-memory rate limiter for guest tracking
const trackAttempts = new Map<string, { count: number; resetAt: number }>();

// Track guest order (public — no auth required)
router.get('/track', async (req, res, next) => {
    try {
        const { code, email } = req.query;

        if (!code || !email) {
            throw new ApiError('Order code and email are required', 400);
        }

        // Rate limiting: 5 attempts per IP per minute
        const ip = req.ip || 'unknown';
        const now = Date.now();
        const attempt = trackAttempts.get(ip);
        if (attempt && attempt.resetAt > now) {
            if (attempt.count >= 5) {
                throw new ApiError('Too many attempts. Please try again later.', 429);
            }
            attempt.count++;
        } else {
            trackAttempts.set(ip, { count: 1, resetAt: now + 60000 });
        }

        const includeSelectedVariants = await supportsOrderItemSelectedVariantsColumn();

        const orders = await query<any[]>(`
            SELECT o.*, 
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'productId', oi.product_id,
                           'variantId', oi.variant_id,
                           'selected_variants_json', ${includeSelectedVariants ? 'oi.selected_variants_json' : 'NULL'},
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'name', p.name,
                           'variant_name', v.name,
                           'variant_value', v.value,
                           'image', IFNULL(v.image, IFNULL(p.images, '[]'))
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants v ON oi.variant_id = v.id
            WHERE o.worldpay_order_code = ?
            GROUP BY o.id
        `, [code]);

        if (orders.length === 0) {
            throw new ApiError('Order not found', 404);
        }

        const order = orders[0];

        // Verify email matches shipping address
        let shippingAddr: any = null;
        try {
            shippingAddr = order.shipping_address ? JSON.parse(order.shipping_address) : null;
        } catch { /* ignore parse errors */ }

        if (!shippingAddr || shippingAddr.email?.toLowerCase() !== String(email).toLowerCase()) {
            throw new ApiError('Order not found', 404); // Don't reveal the order exists
        }

        // Parse items
        let parsedItems: any[] = [];
        try {
            parsedItems = order.items ? JSON.parse(`[${order.items}]`) : [];
            parsedItems = parsedItems.map((i: any) => ({
                ...i,
                image: (() => { try { const imgs = JSON.parse(i.image); return Array.isArray(imgs) ? imgs[0] : null; } catch { return null; } })(),
                selected_variants: (() => {
                    try {
                        if (!i.selected_variants_json) return [];
                        const parsed = typeof i.selected_variants_json === 'string'
                            ? JSON.parse(i.selected_variants_json)
                            : i.selected_variants_json;
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        return [];
                    }
                })(),
            }));
        } catch { /* ignore */ }

        res.json({
            success: true,
            data: {
                orderCode: order.worldpay_order_code,
                status: order.status,
                paymentStatus: order.payment_status,
                totalAmount: order.total_amount,
                shippingAddress: shippingAddr,
                items: parsedItems,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
            }
        });
    } catch (error) {
        next(error);
    }
});

// Link guest order to a newly registered user
router.post('/link-account', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { orderCode } = req.body;

        if (!orderCode) {
            throw new ApiError('Order code is required', 400);
        }

        // Only link orders that have no user_id (guest orders)
        const [result] = await query<any>(`
            UPDATE orders SET user_id = ? WHERE worldpay_order_code = ? AND user_id IS NULL
        `, [req.user!.id, orderCode]);

        if (result.affectedRows === 0) {
            throw new ApiError('Order not found or already linked to an account', 404);
        }

        res.json({ success: true, message: 'Order linked to your account' });
    } catch (error) {
        next(error);
    }
});

// Get user's orders
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const includeSelectedVariants = await supportsOrderItemSelectedVariantsColumn();

        const orders = await query<any[]>(`
            SELECT o.*, 
                   GROUP_CONCAT(
                       JSON_OBJECT(
                           'id', oi.id,
                           'productId', oi.product_id,
                           'variantId', oi.variant_id,
                           'selected_variants_json', ${includeSelectedVariants ? 'oi.selected_variants_json' : 'NULL'},
                           'quantity', oi.quantity,
                           'price', oi.price,
                           'name', p.name,
                           'variant_name', v.name,
                           'variant_value', v.value
                       )
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants v ON oi.variant_id = v.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user!.id]);

        res.json({
            success: true,
            data: orders.map(o => ({
                ...o,
                shipping_address: o.shipping_address ? JSON.parse(o.shipping_address) : null,
                items: (() => {
                    const parsed = o.items ? JSON.parse(`[${o.items}]`) : [];
                    return parsed.map((item: any) => {
                        let selectedVariants: any[] = [];
                        try {
                            const raw = item.selected_variants_json;
                            const parsedSelected = raw
                                ? (typeof raw === 'string' ? JSON.parse(raw) : raw)
                                : [];
                            selectedVariants = Array.isArray(parsedSelected) ? parsedSelected : [];
                        } catch {
                            selectedVariants = [];
                        }
                        return {
                            ...item,
                            selected_variants: selectedVariants,
                        };
                    });
                })(),
            }))
        });
    } catch (error) {
        next(error);
    }
});

// Get single order
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const orders = await query<any[]>(`
            SELECT o.* FROM orders o
            WHERE o.id = ? AND o.user_id = ?
        `, [req.params.id, req.user!.id]);

        if (orders.length === 0) {
            throw new ApiError('Order not found', 404);
        }

        const order = orders[0];

        // Get order items
        const items = await query<any[]>(`
            SELECT oi.*, p.name, p.images, v.name as variant_name, v.value as variant_value, v.image as variant_image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_variants v ON oi.variant_id = v.id
            WHERE oi.order_id = ?
        `, [order.id]);

        res.json({
            success: true,
            data: {
                ...order,
                shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : null,
                items: items.map(i => ({
                    ...i,
                    images: i.images ? JSON.parse(i.images) : [],
                    selected_variants: (() => {
                        try {
                            if (!i.selected_variants_json) return [];
                            const parsed = typeof i.selected_variants_json === 'string'
                                ? JSON.parse(i.selected_variants_json)
                                : i.selected_variants_json;
                            return Array.isArray(parsed) ? parsed : [];
                        } catch {
                            return [];
                        }
                    })(),
                })),
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
