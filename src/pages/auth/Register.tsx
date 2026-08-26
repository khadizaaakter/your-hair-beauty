import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().trim().min(7, 'Phone number is required'),
    address: z.string().trim().min(5, 'Address is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [emailForOtp, setEmailForOtp] = useState('');
    const [otp, setOtp] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { setSession } = useAuth(); // We use manual login after verification now
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { acceptTerms: false },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        setError('');

        try {
            // Direct API call first
            const response = await api.auth.register({
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                password: data.password,
            });

            if (response.success && response.data) {
                setEmailForOtp(response.data.email);
                setStep('otp');
                toast.success('Registration successful! Check your email for code.');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.auth.verifyEmail({ email: emailForOtp, otp });
            if (response.success && response.data) {
                // Manually update auth context
                setSession(response.data.token, response.data.user);
                toast.success('Email verified! Welcome.');
                navigate('/');
            }
        } catch (err: any) {
            toast.error(err.message || 'Verification failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await api.auth.resendOtp(emailForOtp);
            toast.success('Code resent! Check your email.');
        } catch (error) {
            toast.error('Failed to resend code');
        }
    };

    return (
        <>
            <Helmet>
                <title>Create Account | Your Hair and Beauty</title>
                <meta name="description" content="Create your Your Hair and Beauty account" />
            </Helmet>

            <div className="py-12 px-4 flex justify-center items-center">
                <AnimatePresence mode="wait">
                    {step === 'details' ? (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full max-w-md"
                        >
                            {/* Header Text */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                                <p className="mt-2 text-slate-600">Join Your Hair and Beauty today</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-card p-8">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('name')}
                                                type="text"
                                                id="name"
                                                className="input-field pl-10"
                                                placeholder="Jane Doe"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('email')}
                                                type="email"
                                                id="email"
                                                className="input-field pl-10"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('phone')}
                                                type="tel"
                                                id="phone"
                                                className="input-field pl-10"
                                                placeholder="+44 20 8318 0999"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                                            Address
                                        </label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                            <textarea
                                                {...register('address')}
                                                id="address"
                                                rows={3}
                                                className="input-field pl-10 resize-y min-h-[90px]"
                                                placeholder="Street, city, postcode"
                                            />
                                        </div>
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('password')}
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                className="input-field pl-10 pr-10"
                                                placeholder="********"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                {...register('confirmPassword')}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                id="confirmPassword"
                                                className="input-field pl-10 pr-10"
                                                placeholder="********"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="flex items-start gap-2 cursor-pointer">
                                            <input
                                                {...register('acceptTerms')}
                                                type="checkbox"
                                                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-neon-pink focus:ring-neon-pink"
                                            />
                                            <span className="text-sm text-slate-600">
                                                I agree to the{' '}
                                                <Link to="/terms" className="text-neon-pink hover:underline">Terms of Service</Link>
                                                {' '}and{' '}
                                                <Link to="/privacy" className="text-neon-pink hover:underline">Privacy Policy</Link>
                                            </span>
                                        </label>
                                        {errors.acceptTerms && (
                                            <p className="mt-1 text-sm text-red-500">{errors.acceptTerms.message}</p>
                                        )}
                                    </div>

                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                <p className="mt-6 text-center text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-neon-pink font-medium hover:underline">
                                        Sign in
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full max-w-md"
                        >
                            <div className="bg-white rounded-2xl shadow-card p-8">
                                <div className="text-center mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">Verify your email</h3>
                                    <p className="mt-2 text-sm text-gray-600">
                                        We sent a 6-digit code to <span className="font-bold">{emailForOtp}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerify} className="space-y-6">
                                    <div>
                                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                            Enter Verification Code
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                id="otp"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neon-pink focus:border-neon-pink sm:text-sm text-center tracking-[1em] text-2xl font-mono"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting || otp.length !== 6}
                                        className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            'Verify Email'
                                        )}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="text-sm font-medium text-neon-pink hover:text-pink-600"
                                        >
                                            Resend Code
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
export default Register;
