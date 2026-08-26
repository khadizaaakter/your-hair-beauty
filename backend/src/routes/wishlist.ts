import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

// Get wishlist
router.get('/', async (req: AuthRequest, res, next) => {
    try {
        const items = await query<any[]>(
            `SELECT p.*, w.id as wishlist_id, w.created_at as added_at 
             FROM wishlist w 
             JOIN products p ON w.product_id = p.id 
             WHERE w.user_id = ? 
             ORDER BY w.created_at DESC`,
            [req.user!.id]
        );

        // Parse images if they are strings
        const formattedItems = items.map(item => ({
            ...item,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images
        }));

        res.json({ success: true, data: formattedItems });
    } catch (error) {
        next(error);
    }
});

// Add to wishlist
router.post('/', async (req: AuthRequest, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            throw new ApiError('Product ID is required', 400);
        }

        // Check if exists
        const existing = await query<any[]>(
            'SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user!.id, productId]
        );

        if (existing.length > 0) {
            return res.json({ success: true, message: 'Already in wishlist' });
        }

        await query(
            'INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)',
            [req.user!.id, productId]
        );

        res.status(201).json({ success: true, message: 'Added to wishlist' });
    } catch (error) {
        next(error);
    }
});

// Remove from wishlist
router.delete('/:productId', async (req: AuthRequest, res, next) => {
    try {
        await query(
            'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
            [req.user!.id, req.params.productId]
        );

        res.json({ success: true, message: 'Removed from wishlist' });
    } catch (error) {
        next(error);
    }
});

export default router;
