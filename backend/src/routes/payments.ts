import express, { Router } from 'express';
import { config } from '../config';
import { query } from '../config/database';
import { authenticate, authenticateOptional, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';
import {
    extractWorldpayRedirectUrl,
    mapAttemptStatusToFrontendStatus,
    mapFrontendStatusMessage,
    processWorldpayWebhookEvent,
} from '../services/worldpay';

const router = Router();

const WORLDPAY_HPP_MEDIA_TYPE = 'application/vnd.worldpay.payment_pages-v1.hal+json';

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

function normalizeCountryCode(input: string): string {
    const value = input.trim().toUpperCase();
    if (!value) return 'GB';

    if (value === 'UK') return 'GB';
    if (value === 'UNITED KINGDOM') return 'GB';
    if (value === 'GREAT BRITAIN') return 'GB';
    if (value === 'UNITED STATES') return 'US';
    if (value === 'CANADA') return 'CA';

    if (value.length === 2) return value;
    return 'GB';
}

function parseAddress(raw: unknown): Record<string, any> | null {
    if (!raw) return null;

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                return parsed as Record<string, any>;
            }
            return null;
        } catch {
            return null;
        }
    }

    if (typeof raw === 'object') {
        return raw as Record<string, any>;
    }

    return null;
}

function buildBillingAddress(shippingAddressRaw: unknown): Record<string, any> | null {
    const shipping = parseAddress(shippingAddressRaw);
    if (!shipping) return null;

    const firstName = String(shipping.firstName || shipping.firstname || '').trim();
    const lastName = String(shipping.lastName || shipping.lastname || '').trim();
    const address1 = String(shipping.addressLine1 || shipping.address1 || shipping.address || '').trim();
    const address2 = String(shipping.addressLine2 || shipping.address2 || '').trim() || '-';
    const address3 = String(shipping.addressLine3 || shipping.address3 || '').trim() || '-';
    const city = String(shipping.city || shipping.town || '').trim();
    const state = String(shipping.state || shipping.region || shipping.county || '').trim() || city || '-';
    const postalCode = String(shipping.postcode || shipping.postalCode || shipping.zip || '').trim();
    const countryCode = normalizeCountryCode(String(shipping.countryCode || shipping.country || 'GB'));

    if (!address1 || !city || !postalCode) {
        return null;
    }

    return {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        address1,
        address2,
        address3,
        city,
        state,
        postalCode,
        countryCode,
    };
}

function createTransactionReference(orderId: number): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `ORD-${orderId}-${timestamp}-${randomPart}`;
}

function buildResultUrls(reference: string) {
    const baseUrl = config.appBaseUrl.replace(/\/+$/, '');

    return {
        successURL: `${baseUrl}/pay/success?ref=${encodeURIComponent(reference)}`,
        pendingURL: `${baseUrl}/pay/pending?ref=${encodeURIComponent(reference)}`,
        failureURL: `${baseUrl}/pay/failure?ref=${encodeURIComponent(reference)}`,
        errorURL: `${baseUrl}/pay/error?ref=${encodeURIComponent(reference)}`,
        cancelURL: `${baseUrl}/pay/cancel?ref=${encodeURIComponent(reference)}`,
        expiryURL: `${baseUrl}/pay/expiry?ref=${encodeURIComponent(reference)}`,
    };
}

async function getNormalizedPaymentStatus(reference: string) {
    const attempts = await query<any[]>(
        `
            SELECT order_id, transaction_reference, status
            FROM payment_attempts
            WHERE transaction_reference = ?
            ORDER BY id DESC
            LIMIT 1
        `,
        [reference]
    );

    if (attempts.length === 0) {
        return {
            status: 'UNKNOWN' as const,
            orderId: null,
            reference,
            message: mapFrontendStatusMessage('UNKNOWN'),
        };
    }

    const attempt = attempts[0];
    const status = mapAttemptStatusToFrontendStatus(attempt.status);

    return {
        status,
        orderId: Number(attempt.order_id),
        reference: attempt.transaction_reference,
        message: mapFrontendStatusMessage(status),
    };
}

// Create a Worldpay Hosted Payment Page session.
router.post('/worldpay/session', authenticateOptional, async (req: AuthRequest, res, next) => {
    const { orderId } = req.body || {};

    if (!orderId || Number.isNaN(Number(orderId))) {
        return next(new ApiError('Order ID is required', 400));
    }

    const parsedOrderId = Number(orderId);
    const transactionReference = createTransactionReference(parsedOrderId);

    try {
        const [order] = await query<any[]>(
            `
                SELECT id, total_amount, currency, exchange_rate, payment_status, shipping_address
                FROM orders
                WHERE id = ?
                LIMIT 1
            `,
            [parsedOrderId]
        );

        if (!order) {
            throw new ApiError('Order not found', 404);
        }

        if (String(order.payment_status || '').toLowerCase() === 'paid') {
            throw new ApiError('Order is already paid', 400);
        }

        const currency = (order.currency || 'GBP').toUpperCase();
        const exchangeRate = Number(order.exchange_rate || 1);
        const amountMinor = Math.round(Number(order.total_amount) * exchangeRate * 100);
        const billingAddress = buildBillingAddress(order.shipping_address);

        if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
            throw new ApiError('Order amount is invalid', 400);
        }

        await query(
            `
                INSERT INTO payment_attempts (order_id, transaction_reference, status, worldpay_url)
                VALUES (?, ?, 'INITIATED', NULL)
            `,
            [parsedOrderId, transactionReference]
        );

        if (!config.worldpay.username || !config.worldpay.password || !config.worldpay.entity) {
            await query(
                `
                    UPDATE payment_attempts
                    SET status = 'ERROR', last_event_type = ?, last_event_at = NOW()
                    WHERE transaction_reference = ?
                `,
                ['MISSING_WORLDPAY_CONFIG', transactionReference]
            );
            throw new ApiError('Payment gateway is not configured. Please contact support.', 500);
        }

        const payload: any = {
            transactionReference,
            merchant: { entity: config.worldpay.entity },
            narrative: {
                line1: config.worldpay.narrativeLine1,
            },
            value: {
                currency,
                amount: amountMinor,
            },
            resultURLs: buildResultUrls(transactionReference),
            hostedProperties: {
                // If we already have checkout address, do not ask again on HPP.
                showBillingAddress: billingAddress ? 'HIDE' : 'EDIT',
            },
        };

        if (billingAddress) {
            payload.billingAddress = billingAddress;
        }

        const worldpayResponse = await fetch(`${config.worldpay.baseUrl}/payment_pages`, {
            method: 'POST',
            headers: {
                'Content-Type': WORLDPAY_HPP_MEDIA_TYPE,
                Accept: WORLDPAY_HPP_MEDIA_TYPE,
                Authorization: `Basic ${Buffer.from(`${config.worldpay.username}:${config.worldpay.password}`).toString('base64')}`,
            },
            body: JSON.stringify(payload),
        });

        const responseBody: any = await worldpayResponse.json().catch(() => ({}));
        const redirectUrl = extractWorldpayRedirectUrl(responseBody);

        if (!worldpayResponse.ok || !redirectUrl) {
            console.error('Worldpay session creation failed', {
                status: worldpayResponse.status,
                body: responseBody,
            });
            await query(
                `
                    UPDATE payment_attempts
                    SET status = 'ERROR', last_event_type = ?, last_event_at = NOW()
                    WHERE transaction_reference = ?
                `,
                ['SESSION_CREATE_FAILED', transactionReference]
            );
            throw new ApiError('Unable to initialize secure payment session. Please try again.', 502);
        }

        await query(
            `
                UPDATE payment_attempts
                SET status = 'HPP_SESSION_CREATED', worldpay_url = ?
                WHERE transaction_reference = ?
            `,
            [redirectUrl, transactionReference]
        );

        res.json({
            success: true,
            data: {
                url: redirectUrl,
                transactionReference,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Canonical frontend polling endpoint.
router.get('/status', async (req, res, next) => {
    try {
        const reference = String(req.query.ref || '').trim();
        if (!reference) {
            throw new ApiError('Transaction reference is required', 400);
        }

        const normalized = await getNormalizedPaymentStatus(reference);
        res.json({
            success: true,
            data: normalized,
        });
    } catch (error) {
        next(error);
    }
});

// Backwards-compatible status alias.
router.get('/worldpay/status', async (req, res, next) => {
    try {
        const reference = String(req.query.ref || '').trim();
        if (!reference) {
            throw new ApiError('Transaction reference is required', 400);
        }

        const normalized = await getNormalizedPaymentStatus(reference);
        res.json({
            success: true,
            data: normalized,
        });
    } catch (error) {
        next(error);
    }
});

// Backwards-compatible webhook alias.
router.post('/worldpay/webhook', express.text({ type: '*/*', limit: '2mb' }), async (req, res) => {
    try {
        const payload = parseWebhookBody(req.body);
        if (!payload) {
            console.warn('Legacy Worldpay webhook endpoint ignored unparseable payload', {
                contentType: req.headers['content-type'],
            });
            return res.status(200).json({ success: true });
        }

        await processWorldpayWebhookEvent(payload);
    } catch (error) {
        console.error('Legacy Worldpay webhook endpoint error:', error);
    }

    res.status(200).json({ success: true });
});

// Legacy status endpoint used by old pages.
router.get('/worldpay/status/:orderCode', async (req, res, next) => {
    try {
        const { orderCode } = req.params;

        const orders = await query<any[]>(
            'SELECT id, status, payment_status, total_amount FROM orders WHERE worldpay_order_code = ? LIMIT 1',
            [orderCode]
        );

        if (orders.length === 0) {
            throw new ApiError('Order not found', 404);
        }

        const order = orders[0];

        res.json({
            success: true,
            data: {
                status: order.status,
                paymentStatus: order.payment_status,
                total: order.total_amount,
            },
        });
    } catch (error) {
        next(error);
    }
});

// Kept for compatibility with old client code paths.
router.get('/worldpay/client-key', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            clientKey: config.worldpay.clientKey,
            env: config.worldpay.env,
        },
    });
});

export default router;
