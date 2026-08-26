import { api } from './api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(email: string, source: string) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
        return { success: false, message: 'Please enter a valid email address.' };
    }

    const response = await api.contact.subscribeNewsletter({
        email: normalizedEmail,
        source,
    });

    if (!response.success) {
        return {
            success: false,
            message: response.message || 'Unable to subscribe right now. Please try again.',
        };
    }

    return {
        success: true,
        message: response.message || 'Thanks. Check your inbox for next steps.',
    };
}
