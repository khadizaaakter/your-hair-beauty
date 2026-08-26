import express, { Router } from 'express';
import { processWorldpayWebhookEvent } from '../services/worldpay';

const router = Router();

router.use(express.text({ type: '*/*', limit: '2mb' }));

function parseWebhookBody(body: unknown): unknown {
    if (body && typeof body === 'object') return body;
    if (typeof body !== 'string') return null;

    const trimmed = body.trim();
    if (!trimmed) return null;

    try {
        return JSON.parse(trimmed);
    } catch {
        return null;
    }
}

router.post('/worldpay', async (req, res) => {
    try {
        const payload = parseWebhookBody(req.body);
        if (!payload) {
            console.warn('[Worldpay webhook] Ignored unparseable payload', {
                contentType: req.headers['content-type'],
            });
            return res.status(200).json({ success: true });
        }

        const result = await processWorldpayWebhookEvent(payload);

        if (result.event && result.missingAttempt) {
            console.warn(
                `[Worldpay webhook] No payment attempt found for transactionReference=${result.event.transactionReference}`
            );
        }

        if (!result.event) {
            console.warn('[Worldpay webhook] Ignored payload missing event type/reference', {
                contentType: req.headers['content-type'],
            });
        }
    } catch (error) {
        console.error('[Worldpay webhook] Processing error:', error);
        // Always acknowledge webhook delivery to avoid retry storms.
    }

    res.status(200).json({ success: true });
});

export default router;
