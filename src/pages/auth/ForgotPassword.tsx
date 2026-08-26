import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Key, Lock, Eye, EyeOff, Loader } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

const emailSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

const resetSchema = z.object({
    otp: z.string().length(6, 'Code must be 6 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

export function ForgotPassword() {
    const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register: registerEmail,
        handleSubmit: handleSubmitEmail,
        formState: { errors: emailErrors },
    } = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema),
    });

    const {
        register: registerReset,
        handleSubmit: handleSubmitReset,
        formState: { errors: resetErrors },
    } = useForm<ResetFormData>({
        resolver: zodResolver(resetSchema),
    });

    const onEmailSubmit = async (data: EmailFormData) => {
        setIsSubmitting(true);
        try {
            const response = await api.auth.forgotPassword(data.email);
            if (response.success) {
                setEmail(data.email);
                setStep('reset');
                toast.success('Code sent! Check your email.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send code');
        } finally {
            setIsSubmitting(false);
        }
    };

    const onResetSubmit = async (data: ResetFormData) => {
        setIsSubmitting(true);
        try {
            const response = await api.auth.resetPassword({
                email,
                otp: data.otp,
                password: data.password
            });
            if (response.success) {
                setStep('success');
                toast.success('Password reset successfully!');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await api.auth.forgotPassword(email);
            toast.success('Code resent! Check your email.');
        } catch (error) {
            toast.error('Failed to resend code');
        }
    };

    return (
        <>
            <Helmet>
                <title>Reset Password | Your Hair and Beauty</title>
                <meta name="description" content="Reset your Your Hair and Beauty account password" />
            </Helmet>

            <div className="py-12 px-4 flex justify-center items-center">
                <AnimatePresence mode="wait">
                    {step === 'email' && (
                        <motion.div
                            key="email-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-md"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                            </div>

                            <div className="bg-white rounded-2xl shadow-card p-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Forgot your password?</h2>
                                    <p className="text-slate-600 text-sm">
                                        Enter your email and we'll send you a verification code.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...registerEmail('email')}
                                                type="email"
                                                id="email"
                                                className="input-field pl-10"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        {emailErrors.email && (
                                            <p className="mt-1 text-sm text-red-500">{emailErrors.email.message}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Send Verification Code
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <p className="mt-6 text-center">
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-neon-pink"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to login
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'reset' && (
                        <motion.div
                            key="reset-step"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-md"
                        >
                            <div className="bg-white rounded-2xl shadow-card p-8">
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Reset Password</h2>
                                    <p className="text-slate-600 text-sm">
                                        Enter the code sent to <strong>{email}</strong> and your new password.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Verification Code
                                        </label>
                                        <div className="relative">
                                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...registerReset('otp')}
                                                type="text"
                                                className="input-field pl-10 tracking-widest font-mono"
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                        </div>
                                        {resetErrors.otp && (
                                            <p className="mt-1 text-sm text-red-500">{resetErrors.otp.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...registerReset('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                className="input-field pl-10 pr-10"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {resetErrors.password && (
                                            <p className="mt-1 text-sm text-red-500">{resetErrors.password.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...registerReset('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="input-field pl-10 pr-10"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {resetErrors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-500">{resetErrors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                Reset Password
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        className="text-sm font-medium text-neon-pink hover:text-pink-600"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900 mb-2">Password Reset!</h2>
                            <p className="text-slate-600 mb-6">
                                Your password has been successfully updated. You can now log in with your new credentials.
                            </p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 btn-primary px-6 py-2"
                            >
                                Continue to Login
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
export default ForgotPassword;
