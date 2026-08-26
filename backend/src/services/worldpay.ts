import { pool } from '../config/database';
import { sendOrderLifecycleEmail, type OrderNotificationType } from './orderNotifications';

export type PaymentAttemptStatus =
    | 'INITIATED'
    | 'HPP_SESSION_CREATED'
    | 'PROCESSING'
    | 'AUTHORIZED'
    | 'PAID'
    | 'FAILED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'ERROR';

export type FrontendPaymentStatus =
    | 'PAID'
    | 'PROCESSING'
    | 'FAILED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'ERROR'
    | 'UNKNOWN';

export interface ParsedWorldpayWebhookEvent {
    eventId: string;
    eventTimestamp: Date;
    type: string;
    transactionReference: string;
    rawPayload: unknown;
}

export interface ProcessedWebhookResult {
    duplicate: boolean;
    processed: boolean;
    missingAttempt: boolean;
    event?: ParsedWorldpayWebhookEvent;
}

function isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null;
}

function parseDate(value: unknown): Date {
    if (!value || typeof value !== 'string') {
        return new Date();
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return new Date();
    }

    return parsed;
}

function normalizeString(value: unknown): string {
    if (typeof value !== 'string') return '';
    return value.trim();
}

function safeEventId(
    payload: Record<string, any>,
    eventDetails: Record<string, any>,
    type: string,
    transactionReference: string,
    timestamp: Date
): string {
    const rawId = normalizeString(
        payload.eventId ||
        payload.id ||
        eventDetails.eventId ||
        eventDetails.id
    );
    if (rawId) return rawId;

    return `generated:${transactionReference}:${type}:${timestamp.getTime()}`;
}

export function parseWorldpayWebhookPayload(payload: unknown): ParsedWorldpayWebhookEvent | null {
    if (!isObject(payload)) {
        return null;
    }

    const eventDetails = isObject(payload.eventDetails)
        ? payload.eventDetails
        : isObject(payload.details)
            ? payload.details
            : payload;

    const type = normalizeString(eventDetails.type || payload.type);
    const transactionReference = normalizeString(
        eventDetails.transactionReference ||
        eventDetails.transaction_reference ||
        eventDetails.transaction?.transactionReference ||
        payload.transactionReference
    );
    const timestamp = parseDate(
        payload.eventTimestamp ||
        payload.timestamp ||
        eventDetails.eventTimestamp ||
        eventDetails.timestamp
    );
    const eventId = safeEventId(payload, eventDetails, type, transactionReference, timestamp);

    if (!type || !transactionReference) {
        return null;
    }

    return {
        eventId,
        eventTimestamp: timestamp,
        type,
        transactionReference,
        rawPayload: payload,
    };
}

export function mapAttemptStatusToFrontendStatus(status: string): FrontendPaymentStatus {
    switch (status) {
        case 'PAID':
        case 'AUTHORIZED':
            return 'PAID';
        case 'INITIATED':
        case 'HPP_SESSION_CREATED':
        case 'PROCESSING':
            return 'PROCESSING';
        case 'FAILED':
            return 'FAILED';
        case 'CANCELLED':
            return 'CANCELLED';
        case 'EXPIRED':
            return 'EXPIRED';
        case 'ERROR':
            return 'ERROR';
        default:
            return 'UNKNOWN';
    }
}

export function mapEventTypeToAttemptStatus(type: string): PaymentAttemptStatus | null {
    const normalized = String(type || '').trim().toLowerCase();

    switch (normalized) {
        case 'sentforauthorization':
        case 'sent_for_authorization':
            return 'PROCESSING';
        case 'authorized':
            return 'PAID';
        case 'sentforsettlement':
        case 'sent_for_settlement':
            return 'PAID';
        case 'refused':
            return 'FAILED';
        case 'cancelled':
        case 'canceled':
            return 'CANCELLED';
        case 'expired':
            return 'EXPIRED';
        case 'error':
            return 'ERROR';
        default:
            break;
    }

    // Defensive fallback for provider-side type changes.
    if (normalized.includes('settlement') || normalized.includes('settled')) return 'PAID';
    if (normalized.includes('authoriz')) return 'PAID';
    if (normalized.includes('refus') || normalized.includes('declin') || normalized.includes('fail')) return 'FAILED';
    if (normalized.includes('cancel')) return 'CANCELLED';
    if (normalized.includes('expir')) return 'EXPIRED';
    if (normalized.includes('error')) return 'ERROR';

    return null;
}

export function mapFrontendStatusMessage(status: FrontendPaymentStatus): string {
    switch (status) {
        case 'PAID':
            return 'Payment confirmed';
        case 'PROCESSING':
            return 'Payment is being confirmed';
        case 'FAILED':
            return 'Payment failed';
        case 'CANCELLED':
            return 'Payment was cancelled';
        case 'EXPIRED':
            return 'Payment session expired';
        case 'ERROR':
            return 'Payment confirmation error';
        default:
            return 'Payment status not found yet';
    }
}

export async function processWorldpayWebhookEvent(payload: unknown): Promise<ProcessedWebhookResult> {
    const event = parseWorldpayWebhookPayload(payload);
    if (!event) {
        return {
            duplicate: false,
            processed: false,
            missingAttempt: false,
        };
    }

    const attemptStatus = mapEventTypeToAttemptStatus(event.type) || 'PROCESSING';
    const connection = await pool.getConnection();
    let notificationType: OrderNotificationType | null = null;
    let notificationOrderId: number | null = null;

    try {
        await connection.beginTransaction();

        const [existingLogs] = await connection.query<any[]>(
            'SELECT event_id FROM webhook_event_logs WHERE event_id = ? LIMIT 1',
            [event.eventId]
        );

        if (existingLogs.length > 0) {
            await connection.rollback();
            return {
                duplicate: true,
                processed: false,
                missingAttempt: false,
                event,
            };
        }

        await connection.query(
            `
                INSERT INTO webhook_event_logs (event_id, transaction_reference, type, timestamp, raw_payload)
                VALUES (?, ?, ?, ?, ?)
            `,
            [event.eventId, event.transactionReference, event.type, event.eventTimestamp, JSON.stringify(event.rawPayload)]
        );

        const [attemptRows] = await connection.query<any[]>(
            `
                SELECT id, order_id
                FROM payment_attempts
                WHERE transaction_reference = ?
                ORDER BY id DESC
                LIMIT 1
                FOR UPDATE
            `,
            [event.transactionReference]
        );

        if (attemptRows.length === 0) {
            await connection.commit();
            return {
                duplicate: false,
                processed: true,
                missingAttempt: true,
                event,
            };
        }

        const attempt = attemptRows[0];
        notificationOrderId = Number(attempt.order_id);

        await connection.query(
            `
                UPDATE payment_attempts
                SET status = ?, last_event_type = ?, last_event_at = ?
                WHERE id = ?
            `,
            [attemptStatus, event.type, event.eventTimestamp, attempt.id]
        );

        let previousPaymentStatus = '';
        let previousOrderStatus = '';
        let couponCode = '';
        try {
            const [orderRows] = await connection.query<any[]>(
                `
                    SELECT payment_status, status, coupon_code
                    FROM orders
                    WHERE id = ?
                    LIMIT 1
                    FOR UPDATE
                `,
                [attempt.order_id]
            );
            previousPaymentStatus = String(orderRows[0]?.payment_status || '').toLowerCase();
            previousOrderStatus = String(orderRows[0]?.status || '').toLowerCase();
            couponCode = typeof orderRows[0]?.coupon_code === 'string'
                ? orderRows[0].coupon_code.trim()
                : '';
        } catch (error: any) {
            if (error?.code !== 'ER_BAD_FIELD_ERROR') {
                throw error;
            }
            const [orderRows] = await connection.query<any[]>(
                `
                    SELECT payment_status, status
                    FROM orders
                    WHERE id = ?
                    LIMIT 1
                    FOR UPDATE
                `,
                [attempt.order_id]
            );
            previousPaymentStatus = String(orderRows[0]?.payment_status || '').toLowerCase();
            previousOrderStatus = String(orderRows[0]?.status || '').toLowerCase();
        }

        if (attemptStatus === 'PAID') {
            await connection.query(
                `
                    UPDATE orders
                    SET payment_status = 'paid', status = 'paid'
                    WHERE id = ?
                `,
                [attempt.order_id]
            );

            if (previousPaymentStatus !== 'paid' && couponCode) {
                await connection.query(
                    `
                        UPDATE coupons
                        SET used_count = used_count + 1
                        WHERE UPPER(code) = UPPER(?)
                    `,
                    [couponCode]
                );
            }

            if (previousPaymentStatus !== 'paid') {
                notificationType = 'paid';
            }
        } else if (attemptStatus === 'FAILED' || attemptStatus === 'EXPIRED' || attemptStatus === 'ERROR') {
            await connection.query(
                `
                    UPDATE orders
                    SET payment_status = 'failed', status = 'payment_failed'
                    WHERE id = ?
                `,
                [attempt.order_id]
            );

            const canSendFailureFamilyEmail =
                previousPaymentStatus !== 'failed' && previousPaymentStatus !== 'paid';

            if (attemptStatus === 'FAILED' && canSendFailureFamilyEmail) {
                notificationType = 'failed';
            }

            if (attemptStatus === 'EXPIRED' && canSendFailureFamilyEmail) {
                notificationType = 'expired';
            }

            if (attemptStatus === 'ERROR' && canSendFailureFamilyEmail) {
                notificationType = 'error';
            }
        } else if (attemptStatus === 'CANCELLED') {
            await connection.query(
                `
                    UPDATE orders
                    SET payment_status = 'failed', status = 'cancelled'
                    WHERE id = ?
                `,
                [attempt.order_id]
            );

            if (previousOrderStatus !== 'cancelled' && previousPaymentStatus !== 'paid') {
                notificationType = 'cancelled';
            }
        }

        await connection.commit();

        if (notificationOrderId && notificationType) {
            void sendOrderLifecycleEmail(notificationOrderId, notificationType).catch((error) => {
                console.error(
                    `[Order email] Failed to send "${notificationType}" email for orderId=${notificationOrderId}:`,
                    error
                );
            });
        }

        return {
            duplicate: false,
            processed: true,
            missingAttempt: false,
            event,
        };
    } catch (error: any) {
        await connection.rollback();

        // Handles a race where two webhook deliveries insert the same event_id at the same time.
        if (error?.code === 'ER_DUP_ENTRY') {
            return {
                duplicate: true,
                processed: false,
                missingAttempt: false,
                event,
            };
        }

        throw error;
    } finally {
        connection.release();
    }
}

export function extractWorldpayRedirectUrl(responseData: any): string | null {
    if (!responseData || typeof responseData !== 'object') {
        return null;
    }

    if (typeof responseData.url === 'string' && responseData.url.trim()) {
        return responseData.url;
    }

    const href = responseData._links?.redirect?.href || responseData._links?.self?.href;
    if (typeof href === 'string' && href.trim()) {
        return href;
    }

    return null;
}
