
import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, requireAdmin } from '../middleware/auth';
import { config } from '../config';
import { sendEmail } from '../lib/email';
import { ApiError } from '../middleware/errorHandler';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getSettingValue(key: string): Promise<string | null> {
    const rows = await query<any[]>(
        'SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1',
        [key]
    );
    if (!rows.length) return null;
    const value = String(rows[0].setting_value || '').trim();
    return value || null;
}

function escapeHtml(value: string): string {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function buildFirstOrderWelcomeEmail(registerUrl: string): string {
    return `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
            <h2 style="color: #ec4899; margin: 0 0 12px;">Welcome to Your Hair & Beauty</h2>
            <p>Thanks for joining our 10% first-order offer list.</p>
            <p>To unlock your offer, please follow these steps:</p>
            <ol>
                <li>Create your account using this email address.</li>
                <li>Complete all required account details: name, email, phone number, and address.</li>
                <li>Place your first order and the 10% discount will apply automatically at checkout.</li>
            </ol>
            <p style="margin: 16px 0;">
                <a href="${registerUrl}" style="display: inline-block; padding: 10px 16px; background: #ec4899; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Create Your Account
                </a>
            </p>
            <p>If you did not request this email, you can ignore it.</p>
        </div>
    `;
}

router.post('/newsletter', async (req, res, next) => {
    try {
        const { email, source } = req.body || {};
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

        if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
            res.status(400).json({ success: false, message: 'Valid email is required' });
            return;
        }

        const sourceLabel = typeof source === 'string' && source.trim()
            ? source.trim().slice(0, 100)
            : 'newsletter';

        await query(
            'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [
                'Newsletter Subscriber',
                normalizedEmail,
                'Newsletter Subscription',
                `10% first-order subscription source: ${sourceLabel}`,
            ]
        );

        const registerUrl = `${config.appBaseUrl.replace(/\/+$/, '')}/register`;
        const emailSent = await sendEmail(
            normalizedEmail,
            'Your Hair & Beauty: unlock 10% off your first order',
            buildFirstOrderWelcomeEmail(registerUrl)
        );

        if (!emailSent) {
            throw new ApiError('Unable to send welcome email right now. Please try again.', 500);
        }

        res.json({
            success: true,
            message: 'Thanks. Check your inbox for instructions to unlock your first-order 10% off.',
        });
    } catch (error) {
        next(error);
    }
});

// Submit contact form
router.post('/', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }

        await query(
            'INSERT INTO contact_submissions (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );

        const adminEmail =
            (await getSettingValue('admin_email')) ||
            (await getSettingValue('contact_email')) ||
            config.email.user ||
            '';

        if (adminEmail && emailPattern.test(adminEmail)) {
            const safeSubject = escapeHtml(subject || 'Contact Form Message');
            const safeName = escapeHtml(name);
            const safeEmail = escapeHtml(email);
            const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

            const html = `
                <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                    <h2 style="color: #ec4899; margin: 0 0 12px;">New Contact Form Message</h2>
                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <p><strong>Message:</strong><br/>${safeMessage}</p>
                </div>
            `;

            const notificationSent = await sendEmail(
                adminEmail,
                `Contact Form: ${subject || 'New message'}`,
                html
            );

            if (!notificationSent) {
                console.warn(`Contact submission saved but admin notification failed for ${adminEmail}`);
            }
        }

        res.json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        next(error);
    }
});

// Admin: Get all messages
router.get('/admin', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const messages = await query<any[]>('SELECT * FROM contact_submissions ORDER BY created_at DESC');
        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
});

// Admin: Mark as read/reply
router.put('/admin/:id', authenticate, requireAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'read', 'replied'

        await query(
            'UPDATE contact_submissions SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        next(error);
    }
});

export default router;
