import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { config } from '../config';
import { query } from '../config/database';
import { ApiError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { sendEmail } from '../lib/email';

const router = Router();

// Types
interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string;
    phone?: string;
    role: 'admin' | 'customer';
    created_at: Date;
    otp_code?: string;
    otp_expires_at?: Date;
    is_verified?: boolean | number; // boolean in code, number in DB (TINYINT)
    address?: string;
    temp_email?: string;
}

// Register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(errors.array()[0].msg, 400);
        }

        const { name, email, password, phone, address } = req.body;

        // Check if user exists
        const existingUsers = await query<User[]>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            throw new ApiError('Email already registered', 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        const result = await query<any>(
            'INSERT INTO users (name, email, password_hash, phone, address, role, otp_code, otp_expires_at, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone, address, 'customer', otp, otpExpiresAt, 0]
        );

        // Send Email
        await sendEmail(
            email,
            'Verify your email - Your Hair & Beauty',
            `<h1>Welcome to Your Hair & Beauty!</h1>
             <p>Your verification code is:</p>
             <h2 style="color: #ff1493; letter-spacing: 5px;">${otp}</h2>
             <p>This code will expire in 10 minutes.</p>`
        );

        res.status(201).json({
            success: true,
            data: { userId: result.insertId, email }
        });
    } catch (error) {
        next(error);
    }
});

// Verify Email
router.post('/verify-email', [
    body('email').isEmail().withMessage('Email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP is required'),
], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        const users = await query<any[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new ApiError('User not found', 404);
        }

        const user = users[0];

        if (user.is_verified) {
            // Generate token if already verified (idempotency)
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                config.jwt.secret,
                { expiresIn: '7d' }
            );

            return res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address,
                        role: user.role,
                    }
                }
            });
        }

        if (user.otp_code !== otp) {
            throw new ApiError('Invalid verification code', 400);
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            throw new ApiError('Verification code expired', 400);
        }

        // Mark as verified
        await query(
            'UPDATE users SET is_verified = 1, otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
            [user.id]
        );

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.jwt.secret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Resend OTP
router.post('/resend-otp', [
    body('email').isEmail().withMessage('Valid email is required'),
], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const users = await query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new ApiError('User not found', 404);
        }

        const user = users[0];

        if (Number(user.is_verified) === 1) { // Typecast to ensure boolean check works
            throw new ApiError('Email already verified', 400);
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await query(
            'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
            [otp, otpExpiresAt, user.id]
        );

        // Send Email
        await sendEmail(
            email,
            'New Verification Code - Your Hair & Beauty',
            `<h1>New Code Requested</h1>
             <p>Your new verification code is:</p>
             <h2 style="color: #ff1493; letter-spacing: 5px;">${otp}</h2>
             <p>This code will expire in 10 minutes.</p>`
        );

        res.json({
            success: true,
            message: 'Verification code sent'
        });
    } catch (error) {
        next(error);
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(errors.array()[0].msg, 400);
        }

        const { email, password } = req.body;

        // Find user
        const users = await query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new ApiError('Invalid credentials', 401);
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new ApiError('Invalid credentials', 401);
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            config.jwt.secret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    address: user.address,
                    role: user.role,
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const users = await query<User[]>(
            'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
            [req.user!.id]
        );

        if (users.length === 0) {
            throw new ApiError('User not found', 404);
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { name, email, phone, address } = req.body;

        // Email updates are now handled via /request-email-change
        if (email) {
            // throw new ApiError('Email update requires OTP verification. Please use "Change Email" section.', 400);
            // Or silently ignore email if we want to keep it simple, but better to error if client sends it.
            // Let's just remove email from the update query below and ignore it here.
        }

        await query(
            'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
            [name, phone, address, req.user!.id]
        );

        const users = await query<User[]>(
            'SELECT id, name, email, phone, address, role FROM users WHERE id = ?',
            [req.user!.id]
        );

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
// Request Email Change
router.post('/request-email-change', authenticate, [
    body('newEmail').isEmail().withMessage('Valid email is required'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(errors.array()[0].msg, 400);
        }

        const { newEmail } = req.body;

        if (newEmail === req.user!.email) {
            throw new ApiError('New email must be different from current email', 400);
        }

        // Check if new email is already taken
        const existingUsers = await query<User[]>(
            'SELECT id FROM users WHERE email = ?',
            [newEmail]
        );

        if (existingUsers.length > 0) {
            throw new ApiError('Email already in use', 400);
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP and temp_email
        await query(
            'UPDATE users SET temp_email = ?, otp_code = ?, otp_expires_at = ? WHERE id = ?',
            [newEmail, otp, otpExpiresAt, req.user!.id]
        );

        // Send Email to NEW address
        await sendEmail(
            newEmail,
            'Verify your new email address - Your Hair & Beauty',
            `<h1>Verify New Email Address</h1>
             <p>You requested to change your email address. Use the code below to verify this new address:</p>
             <h2 style="color: #ff1493; letter-spacing: 5px;">${otp}</h2>
             <p>This code will expire in 10 minutes.</p>`
        );

        res.json({
            success: true,
            message: 'Verification code sent to new email address'
        });
    } catch (error) {
        console.error('Email change request error:', error);
        next(error);
    }
});

// Verify Email Change
router.post('/verify-email-change', authenticate, [
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP is required'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { otp } = req.body;

        // Get user details including temp_email and otp
        const users = await query<any[]>(
            'SELECT * FROM users WHERE id = ?',
            [req.user!.id]
        );

        if (users.length === 0) {
            throw new ApiError('User not found', 404);
        }

        const user = users[0];

        if (!user.temp_email) {
            throw new ApiError('No pending email change request', 400);
        }

        if (user.otp_code !== otp) {
            throw new ApiError('Invalid verification code', 400);
        }

        if (new Date() > new Date(user.otp_expires_at)) {
            throw new ApiError('Verification code expired', 400);
        }

        // Update email and clear temp fields
        await query(
            'UPDATE users SET email = ?, temp_email = NULL, otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
            [user.temp_email, user.id]
        );

        // Return updated user
        const updatedUsers = await query<User[]>(
            'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
            [user.id]
        );

        const updatedUser = updatedUsers[0];

        // Generate new token since email changed (email is in payload)
        const token = jwt.sign(
            { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
            config.jwt.secret,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Email updated successfully',
            data: {
                token,
                user: updatedUser
            }
        });
    } catch (error) {
        next(error);
    }
});

// Forgot Password - Send OTP
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Valid email is required'),
], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const users = await query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            // Security: Don't reveal if user exists
            return res.json({
                success: true,
                message: 'If an account exists with this email, a verification code has been sent.'
            });
        }

        const user = users[0];
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await query(
            'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE id = ?',
            [otp, otpExpiresAt, user.id]
        );

        await sendEmail(
            email,
            'Reset your password - Your Hair & Beauty',
            `<h1>Password Reset Request</h1>
             <p>Your verification code is:</p>
             <h2 style="color: #ff1493; letter-spacing: 5px;">${otp}</h2>
             <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>`
        );

        res.json({
            success: true,
            message: 'If an account exists with this email, a verification code has been sent.'
        });
    } catch (error) {
        next(error);
    }
});

// Reset Password
router.post('/reset-password', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid OTP is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp, password } = req.body;

        const users = await query<User[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            throw new ApiError('Invalid request', 400);
        }

        const user = users[0];

        if (user.otp_code !== otp) {
            throw new ApiError('Invalid verification code', 400);
        }

        if (new Date() > new Date(user.otp_expires_at!)) {
            throw new ApiError('Verification code expired', 400);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await query(
            'UPDATE users SET password_hash = ?, otp_code = NULL, otp_expires_at = NULL WHERE id = ?',
            [passwordHash, user.id]
        );

        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        next(error);
    }
});


