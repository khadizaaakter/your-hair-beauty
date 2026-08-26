import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

// Public hero sliders (no auth required - for homepage)
router.get('/hero-sliders', async (req, res, next) => {
    try {
        const sliders = await query<any[]>('SELECT * FROM hero_sliders WHERE is_active = 1 ORDER BY order_index');
        res.json({ success: true, data: sliders });
    } catch (error) {
        next(error);
    }
});

// Public site settings
router.get('/settings', async (req, res, next) => {
    try {
        const settings = await query<any[]>('SELECT setting_key, setting_value FROM settings');
        const settingsObj: Record<string, string> = {};
        settings.forEach(s => { settingsObj[s.setting_key] = s.setting_value; });
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.json({ success: true, data: settingsObj });
    } catch (error) {
        next(error);
    }
});

// Public collections
router.get('/collections', async (req, res, next) => {
    try {
        const collections = await query<any[]>('SELECT id, title, description, image_url as image, button_link as link FROM featured_collections ORDER BY order_index');
        res.json({ success: true, data: collections });
    } catch (error) {
        next(error);
    }
});

// Public coupon validation for checkout/promo UI
router.get('/coupons/validate', async (req, res, next) => {
    try {
        const code = String(req.query.code || '').trim().toUpperCase();
        const subtotal = Number(req.query.subtotal || 0);

        if (!code) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: 'Coupon code is required' },
            });
        }

        const rows = await query<any[]>(
            `
                SELECT code, discount_type, discount_value, min_order_amount, max_uses, used_count, valid_from, valid_until, is_active
                FROM coupons
                WHERE UPPER(code) = UPPER(?)
                LIMIT 1
            `,
            [code]
        );

        if (rows.length === 0) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: 'Invalid coupon code' },
            });
        }

        const coupon = rows[0];
        const now = Date.now();
        const startsAt = coupon.valid_from ? new Date(coupon.valid_from).getTime() : null;
        const endsAt = coupon.valid_until ? new Date(coupon.valid_until).getTime() : null;
        const minOrder = Number(coupon.min_order_amount || 0);
        const maxUses = coupon.max_uses === null ? null : Number(coupon.max_uses);
        const usedCount = Number(coupon.used_count || 0);

        if (Number(coupon.is_active) !== 1) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: 'Coupon is inactive' },
            });
        }
        if (startsAt && startsAt > now) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: 'Coupon is not active yet' },
            });
        }
        if (endsAt && endsAt < now) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: 'Coupon has expired' },
            });
        }
        if (Number.isFinite(subtotal) && subtotal > 0 && subtotal < minOrder) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: `Minimum order is £${minOrder.toFixed(2)}` },
            });
        }
        if (maxUses !== null && usedCount >= maxUses) {
            return res.json({
                success: true,
                data: { valid: false, discount: 0, message: 'Coupon usage limit reached' },
            });
        }

        const type = String(coupon.discount_type || '').toLowerCase();
        const isPercentage = type === 'percentage' || type === 'percent';
        const discountRaw = isPercentage
            ? (subtotal * Number(coupon.discount_value || 0)) / 100
            : Number(coupon.discount_value || 0);
        const discount = Number.isFinite(discountRaw)
            ? Math.max(0, Math.round(Math.min(discountRaw, subtotal) * 100) / 100)
            : 0;

        return res.json({
            success: true,
            data: {
                valid: true,
                discount,
                code: coupon.code,
                discount_type: type,
                discount_value: Number(coupon.discount_value || 0),
                message: 'Coupon applied',
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;

