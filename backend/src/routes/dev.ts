import { Router } from 'express';
import { config } from '../config';
import { ApiError } from '../middleware/errorHandler';
import { processWorldpayWebhookEvent } from '../services/worldpay';

const router = Router();

const ALLOWED_EVENT_TYPES = new Set([
    'sentForAuthorization',
    'authorized',
    'sentForSettlement',
    'refused',
    'cancelled',
    'expired',
    'error',
]);

router.post('/simulate-worldpay-webhook', async (req, res, next) => {
    if (config.nodeEnv !== 'development') {
        return next(new ApiError('Not found', 404));
    }

    const { transactionReference, ref, type = 'sentForSettlement', eventId, eventTimestamp } = req.body || {};
    const resolvedReference = String(transactionReference || ref || '').trim();

    if (!resolvedReference) {
        return next(new ApiError('transactionReference (or ref) is required', 400));
    }

    if (!ALLOWED_EVENT_TYPES.has(String(type))) {
        return next(new ApiError('Unsupported simulated event type', 400));
    }

    try {
        const payload = {
            eventId: String(eventId || `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
            eventTimestamp: eventTimestamp || new Date().toISOString(),
            eventDetails: {
                type,
                transactionReference: resolvedReference,
            },
        };

        const result = await processWorldpayWebhookEvent(payload);

        res.json({
            success: true,
            data: {
                duplicate: result.duplicate,
                processed: result.processed,
                missingAttempt: result.missingAttempt,
                event: result.event,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
