import nodemailer from 'nodemailer';
import { config } from '../config';

// Create transporter only if credentials exist
const transporter = config.email?.host && config.email?.user
    ? nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.email.user,
            pass: config.email.pass,
        },
    })
    : null;

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: `"Your Hair & Beauty" <${config.email.user}>`,
                to,
                subject,
                html,
            });
            console.log('Message sent: %s', info.messageId);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    } else {
        // Mock email service
        console.log('=================================================');
        console.log(`[MOCK EMAIL] To: ${to}`);
        console.log(`[MOCK EMAIL] Subject: ${subject}`);
        console.log(`[MOCK EMAIL] Body: ${html}`);
        console.log('=================================================');
        return true;
    }
};
