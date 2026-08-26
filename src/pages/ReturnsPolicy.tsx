
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export function ReturnsPolicy() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <Helmet>
                <title>Returns Policy | Your Hair & Beauty</title>
                <meta name="description" content="Read our returns policy to understand how to return items, eligibility, and refunds." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-8">Returns Policy</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <div className="bg-slate-50 border-l-4 border-neon-pink p-4 mb-8">
                            <p className="font-medium text-slate-900">
                                <strong>Important Note:</strong> For hygiene reasons, we cannot accept returns on wigs, hair extensions, or hair pieces if the hygiene seal has been broken or removed.
                            </p>
                        </div>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Eligibility for Returns</h2>
                            <p className="mb-4">
                                Use the following criteria to determine if your item is eligible for a return:
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>Items must be returned within <strong>30 days</strong> of receipt.</li>
                                <li>Items must be unused, unaltered, and in the same condition that you received them.</li>
                                <li>Items must be in the original packaging with all tags and hygiene seals intact.</li>
                                <li>Proof of purchase is required.</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Non-Returnable Items</h2>
                            <p className="mb-4">
                                Several types of goods are exempt from being returned:
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>Perishable goods (such as magazines or newspapers).</li>
                                <li>Custom products (such as special orders or personalized items).</li>
                                <li>Personal care items (such as hair brushes, combs, or opened hair products).</li>
                                <li>Gift cards.</li>
                                <li>Sale items (only regular priced items may be refunded).</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How to Start a Return</h2>
                            <ol className="list-decimal pl-5 mb-4 space-y-2">
                                <li>Log in to your account and go to "Order History".</li>
                                <li>Select the order containing the item you wish to return.</li>
                                <li>Click "Request Return" and follow the instructions.</li>
                                <li>Alternatively, contact our customer service at <a href="mailto:returns@yourhairandbeauty.com" className="text-neon-pink hover:underline">returns@yourhairandbeauty.com</a> with your order number.</li>
                            </ol>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Refunds</h2>
                            <p className="mb-4">
                                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
                            </p>
                            <p className="mb-4">
                                If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within 5-10 business days.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Exchanges</h2>
                            <p className="mb-4">
                                We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:hello@yourhairandbeauty.com" className="text-neon-pink hover:underline">hello@yourhairandbeauty.com</a>.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Shipping Returns</h2>
                            <p className="mb-4">
                                To return your product, you should mail your product to:
                            </p>
                            <address className="not-italic mb-4">
                                Your Hair and Beauty - Returns<br />
                                37 Lewis Grove<br />
                                Lewisham, London SE13 6BG<br />
                                United Kingdom
                            </address>
                            <p>
                                You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund if we provided a prepaid label.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
