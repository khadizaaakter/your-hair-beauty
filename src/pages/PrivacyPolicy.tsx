
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <Helmet>
                <title>Privacy Policy | Your Hair & Beauty</title>
                <meta name="description" content="Read our privacy policy to understand how we collect, use, and protect your personal data." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-8">Privacy Policy</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
                            <p className="mb-4">
                                Welcome to Your Hair and Beauty ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
                            <p className="mb-4">
                                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>Personal Data: Name, email address, phone number, shipping address, and billing address.</li>
                                <li>Payment Data: We collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
                            <p className="mb-4">
                                We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>To facilitate account creation and logon process.</li>
                                <li>To send you marketing and promotional communications.</li>
                                <li>To fulfill and manage your orders.</li>
                                <li>To post testimonials.</li>
                                <li>To deliver targeted advertising to you.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Sharing Your Information</h2>
                            <p className="mb-4">
                                We may process or share your data that we hold based on the following legal basis:
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>Consent: We may process your data if you have given us specific consent to use your personal information for a specific purpose.</li>
                                <li>Legitimate Interests: We may process your data when it is reasonably necessary to achieve our legitimate business interests.</li>
                                <li>Performance of a Contract: Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact Us</h2>
                            <p className="mb-4">
                                If you have questions or comments about this policy, you may email us at hello@yourhairandbeauty.com or by post to:
                            </p>
                            <address className="not-italic">
                                Your Hair and Beauty<br />
                                37 Lewis Grove<br />
                                Lewisham, London SE13 6BG<br />
                                United Kingdom
                            </address>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
