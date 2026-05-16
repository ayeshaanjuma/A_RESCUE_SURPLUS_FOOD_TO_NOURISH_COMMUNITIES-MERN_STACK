import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartHandshake, MapPin, Users, Utensils, ArrowRight } from 'lucide-react';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const Home = () => {
    return (
        <div className="bg-white selection:bg-emerald-100 selection:text-emerald-900">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),rgba(255,255,255,0))]" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)]" />
                    <div className="absolute top-24 -left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-float" />
                    <div className="absolute top-48 -right-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-float [animation-delay:2s]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div initial="initial" animate="animate" variants={fadeIn}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 mb-8 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            SUSTAINABLE FUTURE
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight mb-8 leading-[0.9]">
                            Rescue <span className="gradient-text">Surplus.</span><br />
                            Nourish People.
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-500 font-medium mb-12 leading-relaxed">
                            The intelligent bridge between food surplus and social impact.
                            Connect with verified NGOs in real-time and turn waste into worth.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link to="/register" className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-black rounded-2xl text-white btn-gradient shadow-xl hover:shadow-emerald-200 transition-all active:scale-95 leading-none">
                                Get Started
                            </Link>
                            <Link to="/map" className="inline-flex justify-center items-center px-8 py-4 border border-gray-200 text-base font-black rounded-2xl text-gray-700 bg-white hover:bg-gray-50/50 hover:shadow-lg transition-all active:scale-95 leading-none glass-panel">
                                Live Network Map
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Impact Stats */}
            <section className="py-12 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            { label: "Meals Rescued", value: "50,000+", icon: "🍲" },
                            { label: "Partner NGOs", value: "240+", icon: "🤝" },
                            { label: "Circular Impact", value: "100%", icon: "♻️" }
                        ].map((stat, i) => (
                            <motion.div key={i} variants={fadeIn} className="premium-card p-8 flex items-center justify-between group">
                                <div>
                                    <div className="text-[10px] uppercase font-black text-emerald-600 tracking-widest mb-1">{stat.label}</div>
                                    <div className="text-4xl font-black text-gray-900">{stat.value}</div>
                                </div>
                                <div className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-500 scale-110">
                                    {stat.icon}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features - Bento Grid */}
            <section className="py-24 bg-gray-50/50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">How the Platform Works</h2>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">A seamless ecosystem designed for maximum efficiency and social impact.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-2 w-12 bg-emerald-600 rounded-full" />
                            <div className="h-2 w-2 bg-emerald-200 rounded-full" />
                            <div className="h-2 w-2 bg-emerald-200 rounded-full" />
                        </div>
                    </div>

                    <motion.div
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6"
                    >
                        {/* Feature 1 */}
                        <motion.div variants={fadeIn} className="md:col-span-12 lg:col-span-5 premium-card p-10 bg-emerald-900 text-white border-none relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-7xl opacity-10 group-hover:opacity-20 transition-opacity">🍲</div>
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Utensils className="h-6 w-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black mb-4">Post Surplus Food</h3>
                                    <p className="text-emerald-100 font-medium leading-relaxed opacity-80">Donors list available resources with precise quantity and expiry data, ensuring quality control from the start.</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div variants={fadeIn} className="md:col-span-6 lg:col-span-3 premium-card p-10 bg-white group">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                                <MapPin className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Live Map</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">Real-time geolocation matching bridges users instantly.</p>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div variants={fadeIn} className="md:col-span-6 lg:col-span-4 premium-card p-10 bg-white group border-emerald-100/50">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                                <Users className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Claim & Collect</h3>
                            <p className="text-gray-500 text-sm font-medium leading-relaxed">NGOs claim donations and track pickups via their command center.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="premium-card p-12 md:p-20 text-center relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30 border-emerald-100/50">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl opacity-50" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-100/50 rounded-full blur-3xl opacity-50" />

                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
                            Build a <span className="gradient-text">Sustainable</span><br />Network Today.
                        </h2>
                        <p className="text-lg text-gray-500 font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                            Join thousands of businesses and organizations working together to build a zero-waste food ecosystem.
                        </p>
                        <div className="flex justify-center">
                            <Link to="/register" className="inline-flex items-center justify-center px-10 py-5 border border-transparent text-lg font-black rounded-2xl text-white btn-gradient shadow-xl hover:shadow-emerald-200 transition-all active:scale-95 leading-none">
                                Join the Network
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
