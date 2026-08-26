
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export function TermsOfService() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <Helmet>
                <title>Terms of Service | Your Hair & Beauty</title>
                <meta name="description" content="Read our terms of service to understand the rules and regulations for using our website." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-8">Terms of Service</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
                            <p className="mb-4">
                                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Your Hair and Beauty ("we," "us" or "our"), concerning your access to and use of our website.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Intellectual Property Rights</h2>
                            <p className="mb-4">
                                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Representations</h2>
                            <p className="mb-4">
                                By using the Site, you represent and warrant that:
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>All registration information you submit will be true, accurate, current, and complete.</li>
                                <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                                <li>You are not a minor in the jurisdiction in which you reside.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Products</h2>
                            <p className="mb-4">
                                We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Purchases and Payment</h2>
                            <p className="mb-4">
                                We accept the following forms of payment: Visa, Mastercard, American Express, and PayPal. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. You further agree to promptly update account and payment information, including email address, payment method, and payment card expiration date, so that we can complete your transactions and contact you as needed.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
                            <p className="mb-4">
                                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
                            </p>
                            <address className="not-italic">
                                Your Hair and Beauty<br />
                                37 Lewis Grove<br />
                                Lewisham, London SE13 6BG<br />
                                United Kingdom<br />
                                hello@yourhairandbeauty.com
                            </address>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
