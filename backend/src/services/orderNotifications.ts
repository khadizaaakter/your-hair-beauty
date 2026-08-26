import { query } from '../config/database';
import { sendEmail } from '../lib/email';

export type OrderNotificationType =
    | 'placed'
    | 'paid'
    | 'failed'
    | 'cancelled'
    | 'expired'
    | 'error';

type OrderNotificationRow = {
    id: number;
    worldpay_order_code: string | null;
    total_amount: number;
    currency: string | null;
    status: string | null;
    payment_status: string | null;
    shipping_address: string | null;
    user_name: string | null;
    user_email: string | null;
};

function parseShippingAddress(raw: unknown): Record<string, any> | null {
    if (!raw) return null;

    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    }

    if (typeof raw === 'object') {
        return raw as Record<string, any>;
    }

    return null;
}

function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatAmount(amount: unknown, currency: string | null): string {
    const parsed = Number(amount);
    const code = String(currency || 'GBP').toUpperCase();
    if (!Number.isFinite(parsed)) {
        return code === 'GBP' ? '£0.00' : `0.00 ${code}`;
    }

    if (code === 'GBP') {
        return `£${parsed.toFixed(2)}`;
    }

    return `${parsed.toFixed(2)} ${code}`;
}

function subjectFor(type: OrderNotificationType, orderCode: string): string {
    switch (type) {
        case 'placed':
            return `Order placed successfully - ${orderCode}`;
        case 'paid':
            return `Payment confirmed - ${orderCode}`;
        case 'failed':
            return `Payment failed - ${orderCode}`;
        case 'cancelled':
            return `Payment cancelled - ${orderCode}`;
        case 'expired':
            return `Payment session expired - ${orderCode}`;
        case 'error':
            return `Payment status update - ${orderCode}`;
        default:
            return `Order update - ${orderCode}`;
    }
}

function messageFor(type: OrderNotificationType): { title: string; body: string } {
    switch (type) {
        case 'placed':
            return {
                title: 'We have received your order',
                body: 'Your order has been created and is waiting for payment confirmation.',
            };
        case 'paid':
            return {
                title: 'Payment confirmed',
                body: 'Your payment has been received successfully and your order is now being processed.',
            };
        case 'failed':
            return {
                title: 'Payment failed',
                body: 'Your payment attempt was not successful. Please retry checkout to complete your order.',
            };
        case 'cancelled':
            return {
                title: 'Payment cancelled',
                body: 'Your payment was cancelled. No charge has been completed for this order.',
            };
        case 'expired':
            return {
                title: 'Payment session expired',
                body: 'Your payment session expired before completion. Please retry checkout to complete your purchase.',
            };
        case 'error':
            return {
                title: 'Payment status requires attention',
                body: 'We were unable to confirm your payment automatically. Please contact support if money was deducted.',
            };
        default:
            return {
                title: 'Order update',
                body: 'There is an update on your order status.',
            };
    }
}

export async function sendOrderLifecycleEmail(orderId: number, type: OrderNotificationType): Promise<boolean> {
    const rows = await query<OrderNotificationRow[]>(
        `
            SELECT
                o.id,
                o.worldpay_order_code,
                o.total_amount,
                o.currency,
                o.status,
                o.payment_status,
                o.shipping_address,
                u.name as user_name,
                u.email as user_email
            FROM orders o
            LEFT JOIN users u ON u.id = o.user_id
            WHERE o.id = ?
            LIMIT 1
        `,
        [orderId]
    );

    if (!rows.length) {
        console.warn(`[Order email] Order not found for notification: orderId=${orderId}, type=${type}`);
        return false;
    }

    const order = rows[0];
    const shippingAddress = parseShippingAddress(order.shipping_address);

    const shippingEmail = shippingAddress?.email ? String(shippingAddress.email).trim() : '';
    const shippingFirstName = shippingAddress?.firstName ? String(shippingAddress.firstName).trim() : '';
    const shippingLastName = shippingAddress?.lastName ? String(shippingAddress.lastName).trim() : '';

    const email = shippingEmail || String(order.user_email || '').trim();
    if (!email) {
        console.warn(`[Order email] No recipient email found: orderId=${orderId}, type=${type}`);
        return false;
    }

    const shippingName = `${shippingFirstName} ${shippingLastName}`.trim();
    const recipientName = shippingName || String(order.user_name || '').trim() || 'Customer';
    const orderCode = String(order.worldpay_order_code || `#${order.id}`);
    const amount = formatAmount(order.total_amount, order.currency);
    const content = messageFor(type);

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
            <h2 style="margin-bottom: 4px;">Your Hair &amp; Beauty</h2>
            <p style="margin-top: 0; color: #6b7280;">Order notification</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
            <p>Hi ${escapeHtml(recipientName)},</p>
            <h3 style="margin-bottom: 8px;">${escapeHtml(content.title)}</h3>
            <p style="line-height: 1.6;">${escapeHtml(content.body)}</p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin: 18px 0;">
                <p style="margin: 0 0 6px;"><strong>Order:</strong> ${escapeHtml(orderCode)}</p>
                <p style="margin: 0 0 6px;"><strong>Total:</strong> ${escapeHtml(amount)}</p>
                <p style="margin: 0;"><strong>Payment status:</strong> ${escapeHtml(String(order.payment_status || 'pending'))}</p>
            </div>
            <p style="line-height: 1.6;">If you need help, contact us at <a href="mailto:info@yourhairbeauty.co.uk">info@yourhairbeauty.co.uk</a>.</p>
            <p style="margin-top: 20px;">Thanks,<br/>Your Hair &amp; Beauty</p>
        </div>
    `;

    const sent = await sendEmail(email, subjectFor(type, orderCode), html);
    if (!sent) {
        console.warn(`[Order email] Failed to send email: orderId=${orderId}, type=${type}, to=${email}`);
    }

    return sent;
}
