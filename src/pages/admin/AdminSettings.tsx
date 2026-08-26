import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import {
    Save,
    Store,
    Phone,
    Mail,
    Truck,
    MessageSquare,
    Instagram,
    Star,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

// TikTok icon component (not in Lucide)
function TikTokIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
    );
}

const settingsSchema = z.object({
    header_text: z.string().min(1, 'Header text is required'),
    free_shipping_threshold: z.string(),
    delivery_charge: z.string().optional(),
    contact_phone: z.string().min(1, 'Phone number is required'),
    contact_phone_secondary: z.string().optional(),
    contact_email: z.string().email('Invalid email address'),
    admin_email: z.union([z.string().email('Invalid email address'), z.literal('')]).optional(),
    address: z.string().optional(),
    instagram_url: z.string().optional(),
    tiktok_url: z.string().optional(),
    google_review_url: z.union([z.string().url('Invalid URL'), z.literal('')]).optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

function normalizeNumericInput(value: string | undefined, fallback: string): string {
    const cleaned = String(value || '')
        .trim()
        .replace(/[^0-9,.-]/g, '')
        .replace(/,/g, '.');
    const parsed = Number.parseFloat(cleaned);
    return Number.isFinite(parsed) ? String(parsed) : fallback;
}

export function AdminSettings() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm<SettingsForm>({
        resolver: zodResolver(settingsSchema),
    });

    // Fetch settings from API on load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.admin.settings.get();
                if (response.success && response.data) {
                    reset(response.data as SettingsForm);
                }
            } catch (error) {
                toast.error('Failed to load settings');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [reset]);

    const onSubmit = async (data: SettingsForm) => {
        setIsSaving(true);
        try {
            const normalizedData: SettingsForm = {
                ...data,
                free_shipping_threshold: normalizeNumericInput(data.free_shipping_threshold, '50'),
                delivery_charge: normalizeNumericInput(data.delivery_charge, '3.99'),
            };
            const response = await api.admin.settings.update(normalizedData as any);
            if (response.success) {
                toast.success('Settings saved successfully!');
                queryClient.invalidateQueries({ queryKey: ['settings'] });
            } else {
                toast.error('Failed to save settings');
            }
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-neon-pink" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Store Settings | Admin</title>
            </Helmet>

            <div className="space-y-6">
                <header>
                    <h1 className="text-2xl font-display font-bold text-slate-900">Store Settings</h1>
                    <p className="text-slate-500">Manage your store's global configuration</p>
                </header>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Header & Shipping Settings */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Header & Shipping</h2>
                                <p className="text-sm text-slate-500">Configure header text and shipping thresholds</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-2" />
                                    Top Header Text
                                </label>
                                <input
                                    type="text"
                                    {...register('header_text')}
                                    placeholder="FREE UK DELIVERY ON ORDERS OVER £50"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.header_text && (
                                    <p className="mt-1 text-sm text-red-500">{errors.header_text.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Truck className="w-4 h-4 inline mr-2" />
                                    Free Shipping Threshold (£)
                                </label>
                                <input
                                    type="text"
                                    {...register('free_shipping_threshold')}
                                    placeholder="50"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Truck className="w-4 h-4 inline mr-2" />
                                    Standard Delivery Charge (£)
                                </label>
                                <input
                                    type="text"
                                    {...register('delivery_charge')}
                                    placeholder="3.99"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.delivery_charge && (
                                    <p className="mt-1 text-sm text-red-500">{errors.delivery_charge.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Contact Information</h2>
                                <p className="text-sm text-slate-500">Your store's contact details (shown in header & footer)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    {...register('contact_phone')}
                                    placeholder="02083180999"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.contact_phone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.contact_phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Secondary Phone (Optional)
                                </label>
                                <input
                                    type="tel"
                                    {...register('contact_phone_secondary')}
                                    placeholder="+44 20 0000 0000"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.contact_phone_secondary && (
                                    <p className="mt-1 text-sm text-red-500">{errors.contact_phone_secondary.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    {...register('contact_email')}
                                    placeholder="hello@yourhairbeauty.com"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.contact_email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.contact_email.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Admin Email (Internal)
                                </label>
                                <input
                                    type="email"
                                    {...register('admin_email')}
                                    placeholder="yourhairandbeautyuk@gmail.com"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.admin_email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.admin_email.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Store Address
                                </label>
                                <textarea
                                    {...register('address')}
                                    rows={2}
                                    placeholder="37 Lewis Grove, Lewisham, London SE13 6BG"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media Links */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-500">
                                <Instagram className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-slate-900">Social Media</h2>
                                <p className="text-sm text-slate-500">Connect your social media accounts</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Instagram className="w-4 h-4 inline mr-2" />
                                    Instagram URL
                                </label>
                                <input
                                    type="url"
                                    {...register('instagram_url')}
                                    placeholder="https://www.instagram.com/yourhairandbeauty1"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <TikTokIcon className="w-4 h-4 inline mr-2" />
                                    TikTok URL
                                </label>
                                <input
                                    type="url"
                                    {...register('tiktok_url')}
                                    placeholder="https://www.tiktok.com/@yourhairandbeauty1?_r=1&_t=ZN-94DcnGT6U7D"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Star className="w-4 h-4 inline mr-2" />
                                    Google Review URL
                                </label>
                                <input
                                    type="url"
                                    {...register('google_review_url')}
                                    placeholder="https://g.page/r/CTlrynC6OrBbEBM/review"
                                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-neon-pink/20 focus:border-neon-pink"
                                />
                                {errors.google_review_url && (
                                    <p className="mt-1 text-sm text-red-500">{errors.google_review_url.message}</p>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSaving || !isDirty}
                            className="flex items-center gap-2 px-6 py-3 bg-neon-pink text-white font-semibold rounded-xl hover:bg-neon-pink/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-neon-pink/25"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AdminSettings;
