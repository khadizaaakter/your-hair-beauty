
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export function CookiePolicy() {
    return (
        <div className="min-h-screen bg-white pt-24 pb-16">
            <Helmet>
                <title>Cookie Policy | Your Hair & Beauty</title>
                <meta name="description" content="Learn about how we use cookies and similar technologies on our website." />
            </Helmet>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-8">Cookie Policy</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. What Are Cookies</h2>
                            <p className="mb-4">
                                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. How We Use Cookies</h2>
                            <p className="mb-4">
                                We use cookies for a variety of reasons detailed below. Unfortunately, in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. The Cookies We Set</h2>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>
                                    <strong>Account related cookies:</strong> If you create an account with us then we will use cookies for the management of the signup process and general administration. These cookies will usually be deleted when you log out however in some cases they may remain afterwards to remember your site preferences when logged out.
                                </li>
                                <li>
                                    <strong>Login related cookies:</strong> We use cookies when you are logged in so that we can remember this fact. This prevents you from having to log in every single time you visit a new page. These cookies are typically removed or cleared when you log out to ensure that you can only access restricted features and areas when logged in.
                                </li>
                                <li>
                                    <strong>Orders processing related cookies:</strong> This site offers e-commerce or payment facilities and some cookies are essential to ensure that your order is remembered between pages so that we can process it properly.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Third Party Cookies</h2>
                            <p className="mb-4">
                                In some special cases we also use cookies provided by trusted third parties. The following section details which third party cookies you might encounter through this site.
                            </p>
                            <ul className="list-disc pl-5 mb-4 space-y-2">
                                <li>
                                    This site uses Google Analytics which is one of the most widespread and trusted analytics solution on the web for helping us to understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.
                                </li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. More Information</h2>
                            <p className="mb-4">
                                Hopefully that has clarified things for you and as was previously mentioned if there is something that you aren't sure whether you need or not it's usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                            </p>
                            <p className="mb-4">
                                However, if you are still looking for more information then you can contact us via email: hello@yourhairandbeauty.com
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
