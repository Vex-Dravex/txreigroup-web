"use client";

import Link from "next/link";
import Image from "next/image";
import AppHeader from "../../app/components/AppHeader";
import FeatureCarousel from "../FeatureCarousel";
import { motion, AnimatePresence } from "framer-motion";
import type { Role } from "@/lib/roles";

interface LandingPageContentProps {
    isAuthenticated: boolean;
    userProfile: { avatar_url: string | null; display_name: string | null; email: string | null } | null;
    userRole: Role;
}

export default function LandingPageContent({
    isAuthenticated,
    userProfile,
    userRole,
}: LandingPageContentProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as any, // Custom ease-out expo
            },
        },
    };

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden selection:bg-blue-500/30">
            <AppHeader
                isAuthenticated={isAuthenticated}
                userRole={isAuthenticated ? userRole : "investor"}
                currentPage="home"
                avatarUrl={userProfile?.avatar_url || null}
                displayName={userProfile?.display_name || null}
                email={userProfile?.email || null}
            />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative flex min-h-[90vh] items-center justify-center pt-20 pb-8 md:pt-32 lg:pt-32">
                    <div className="noise-overlay" />

                    {/* Abstract Background Elements */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.15, scale: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/20 blur-[60px] md:blur-[120px]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.1, scale: 1 }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
                            className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[50px] md:blur-[100px]"
                        />
                    </div>

                    <div className="container relative z-10 mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center text-center lg:text-left">
                            {/* Left Column: Content */}
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="lg:col-span-7 order-2 lg:order-1"
                            >
                                <motion.div variants={itemVariants} className="inline-block px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">
                                    Reimagining Real Estate
                                </motion.div>

                                <motion.h1
                                    variants={itemVariants}
                                    className="text-2xl sm:text-3xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter text-zinc-950 dark:text-zinc-50 mb-2 md:mb-8"
                                >
                                    Invest <span className="inline-block pb-1 pr-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">Together.</span> Grow Faster.
                                </motion.h1>

                                <motion.p
                                    variants={itemVariants}
                                    className="max-w-xl mx-auto lg:mx-0 text-xs sm:text-sm md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4 md:mb-12"
                                >
                                    The premier social ecosystem for Creative Finance. The only platform where real estate investment meets social networking—giving you the tools to find deals and the network to fund them.
                                </motion.p>


                                <motion.div variants={itemVariants} className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full md:w-auto">
                                    <Link
                                        href="/login?mode=signup"
                                        className="flex-1 md:flex-none group relative inline-flex items-center justify-center px-4 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold text-white transition-all duration-300 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 rounded-xl hover:scale-105 active:scale-95 whitespace-nowrap"
                                    >
                                        <span>Get Early Access</span>
                                        <motion.span
                                            animate={{ x: [0, 5, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="ml-2"
                                        >
                                            →
                                        </motion.span>
                                    </Link>

                                    <button
                                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="flex-1 md:flex-none inline-flex items-center justify-center text-xs md:text-sm font-black tracking-widest uppercase text-zinc-900 dark:text-zinc-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer py-3 md:py-0 whitespace-nowrap text-center"
                                    >
                                        Explore Ecosystem
                                    </button>
                                </motion.div>
                            </motion.div>

                            {/* Right Column: Visual Component / Large Logo */}
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] as any }}
                                className="lg:col-span-5 relative block order-1 lg:order-2 mb-6 lg:mb-0 lg:mt-0 lg:max-w-full mx-auto"
                            >
                                <div className="relative w-[280px] md:w-[400px] lg:w-[500px] xl:w-[600px] aspect-square mx-auto">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-3xl rotate-3 scale-105" />
                                    <div className="absolute inset-0 glass rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]">
                                        <div className="absolute inset-0 flex items-center justify-center p-2 md:p-4">
                                            <Image
                                                src="/logo.png"
                                                alt="HTXREIGROUP Logo"
                                                width={600}
                                                height={600}
                                                className="object-contain w-full h-full drop-shadow-2xl"
                                                priority
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                    {/* Floating Elements */}
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                        className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 glass p-2 lg:p-4 rounded-xl lg:rounded-2xl shadow-xl flex items-center gap-2 lg:gap-3"
                                    >
                                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] lg:text-xs font-bold whitespace-nowrap">Live Marketplace</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Feature Carousel Section */}
                <section id="features" className="relative py-8 md:py-32 bg-zinc-50/50 dark:bg-zinc-950/50 overflow-hidden">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 mb-4 md:mb-16">
                            <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
                                <h2 className="text-2xl md:text-5xl font-black tracking-tighter mb-2 md:mb-4">
                                    Built for the <span className="text-blue-600">Modern</span> Professional.
                                </h2>
                                <p className="text-sm md:text-lg text-zinc-600 dark:text-zinc-400">
                                    Precision tools crafted for every stage of your investment journey.
                                </p>
                            </div>
                        </div>
                        <div className="glass rounded-3xl p-2 md:p-12 shadow-inner">
                            <FeatureCarousel />
                        </div>
                    </div>
                </section>

                {/* Audience Section */}
                <section className="py-8 md:py-32 bg-white dark:bg-transparent">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {[
                                { title: "Investors", desc: "Access the exclusive deals first.", icon: "📈", color: "blue" },
                                { title: "Wholesalers", desc: "Submit and close at lightning speed.", icon: "⚡", color: "green" },
                                { title: "Vendors", desc: "Build your legacy and client base.", icon: "🛠️", color: "purple" },
                                { title: "Services", desc: "Fluid transaction management.", icon: "📑", color: "orange" }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="group glass p-4 md:p-8 rounded-2xl md:rounded-3xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 flex flex-col items-center md:items-start text-center md:text-left h-full"
                                >
                                    <div className="text-3xl md:text-4xl mb-2 md:mb-6">{item.icon}</div>
                                    <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-3">{item.title}</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 text-[10px] md:text-sm leading-snug">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative py-16 md:py-32 overflow-hidden bg-zinc-950">
                    <div className="noise-overlay opacity-10" />
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 md:mb-8 italic">
                                The Future is <span className="text-blue-500">Texas</span> Real Estate.
                            </h2>
                            <p className="text-lg md:text-xl text-zinc-400 mb-8 md:mb-12 max-w-2xl mx-auto">
                                Join thousands of professionals already scaling their business with HTXREIGROUP.
                            </p>
                            <Link
                                href="/login?mode=signup"
                                className="inline-flex items-center px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all hover:scale-105"
                            >
                                Join the Community
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} HTXREIGROUP. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link href="/privacy" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Privacy</Link>
                        <Link href="/terms" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
