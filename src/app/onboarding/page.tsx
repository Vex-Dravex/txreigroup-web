"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = 'force-dynamic';

type Step = "personal" | "roles" | "details" | "complete";

const ROLES = [
    { id: "investor", label: "Investor", icon: "📈", description: "I want to buy properties" },
    { id: "wholesaler", label: "Wholesaler", icon: "⚡", description: "I find deals for investors" },
    { id: "service", label: "Transaction Service", icon: "📑", description: "Lender, Title, Escrow, etc." },
    { id: "vendor", label: "Vendor", icon: "🛠️", description: "Contractors, Inspectors, etc." },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("personal");
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // Data State
    const [personalData, setPersonalData] = useState({
        firstName: "",
        lastName: "",
        businessName: "",
        phoneNumber: "",
    });

    const [investorData, setInvestorData] = useState({
        buyBox: "",
        maxEntry: "",
        dealTypes: [] as string[],
        assetTypes: [] as string[],
        areas: "",
        propertyDetails: "",
        targetReturn: "",
    });

    const [wholesalerData, setWholesalerData] = useState({
        experienceYears: "",
        dealsClosed: "",
    });

    const [serviceData, setServiceData] = useState({
        serviceType: "",
        companyName: "",
    });

    const [vendorData, setVendorData] = useState({
        serviceType: "",
        companyName: "",
    });

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        // Check if user is logged in
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login?mode=signup");
            }
        };
        checkUser();
    }, [router, supabase]);

    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
        );
    };

    const handleNext = async () => {
        if (step === "personal") {
            if (!personalData.firstName || !personalData.lastName || !personalData.phoneNumber) return;
            setStep("roles");
        } else if (step === "roles") {
            if (selectedRoles.length === 0) return;
            setStep("details");
            setCurrentRoleIndex(0);
        } else if (step === "details") {
            const currentRole = selectedRoles[currentRoleIndex];

            // Move to next role or finish
            if (currentRoleIndex < selectedRoles.length - 1) {
                setCurrentRoleIndex(prev => prev + 1);
            } else {
                await handleSubmit();
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            // Update profiles table with personal info
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    first_name: personalData.firstName,
                    last_name: personalData.lastName,
                    business_name: personalData.businessName,
                    phone: personalData.phoneNumber,
                    display_name: `${personalData.firstName} ${personalData.lastName}`
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Save to user_onboarding table
            const { error } = await supabase
                .from('user_onboarding')
                .upsert({
                    user_id: user.id,
                    roles: selectedRoles,
                    investor_data: investorData,
                    wholesaler_data: wholesalerData,
                    service_data: serviceData,
                    vendor_data: vendorData,
                    completed: true
                });

            if (error) throw error;

            // Also save each role to user_roles table for multi-role support
            // First, delete existing roles for this user
            await supabase
                .from('user_roles')
                .delete()
                .eq('user_id', user.id);

            // Then insert all selected roles
            const roleInserts = selectedRoles.map(role => ({
                user_id: user.id,
                role: role as "admin" | "investor" | "wholesaler" | "contractor" | "vendor" | "service"
            }));

            const { error: rolesError } = await supabase
                .from('user_roles')
                .insert(roleInserts);

            if (rolesError) {
                console.error("Error saving user roles:", rolesError);
                // Don't throw - onboarding data is saved, roles  are nice-to-have
            }

            router.push("/onboarding/subscription"); // Redirect to subscription page
        } catch (err) {
            console.error("Error saving onboarding data:", err);
            // Handle error (show toast etc)
        } finally {
            setLoading(false);
        }
    };

    const currentRole = step === "details" ? selectedRoles[currentRoleIndex] : null;

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-8 selection:bg-blue-500/30">
            <div className="noise-overlay opacity-20" />

            {/* Background Glows same as login */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-600/20 blur-[100px]"
                />
            </div>

            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-6xl glass rounded-[2.5rem] p-8 md:p-12 lg:p-16 overflow-hidden shadow-2xl border-white/10"
            >
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                    {/* Left Side: Watermark & Welcome Text */}
                    <div className="space-y-10 relative hidden lg:block h-full min-h-[400px]">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] opacity-[0.1] pointer-events-none">
                            <Image src="/logo.png" alt="" fill className="object-contain" priority />
                        </div>

                        <div className="relative z-10 flex flex-col justify-center h-full">
                            <h1 className="text-5xl font-black tracking-tighter text-white leading-[0.95] mb-6">
                                Welcome to <br /> <span className="text-blue-500">HTXREIGROUP</span>
                            </h1>
                            <p className="text-xl text-zinc-400 max-w-lg leading-relaxed">
                                Let's customize your experience. Tell us about your goals and how you fit into the Texas Real Estate ecosystem.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Dynamic Form */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {step === "personal" && (
                                <PersonalForm
                                    key="personal"
                                    data={personalData}
                                    updateData={(d: any) => setPersonalData({ ...personalData, ...d })}
                                    onNext={handleNext}
                                />
                            )}

                            {step === "roles" && (
                                <RolesSelection
                                    key="roles"
                                    selectedRoles={selectedRoles}
                                    onToggle={handleRoleToggle}
                                    onNext={handleNext}
                                />
                            )}

                            {step === "details" && currentRole === "investor" && (
                                <InvestorForm
                                    key="investor"
                                    data={investorData}
                                    updateData={(d: any) => setInvestorData({ ...investorData, ...d })}
                                    onNext={handleNext}
                                    loading={loading}
                                />
                            )}

                            {step === "details" && currentRole === "wholesaler" && (
                                <WholesalerForm
                                    key="wholesaler"
                                    data={wholesalerData}
                                    updateData={(d: any) => setWholesalerData({ ...wholesalerData, ...d })}
                                    onNext={handleNext}
                                    loading={loading}
                                />
                            )}

                            {step === "details" && currentRole === "service" && (
                                <ServiceForm
                                    key="service"
                                    data={serviceData}
                                    updateData={(d: any) => setServiceData({ ...serviceData, ...d })}
                                    onNext={handleNext}
                                    loading={loading}
                                />
                            )}

                            {step === "details" && currentRole === "vendor" && (
                                <VendorForm
                                    key="vendor"
                                    data={vendorData}
                                    updateData={(d: any) => setVendorData({ ...vendorData, ...d })}
                                    onNext={handleNext}
                                    loading={loading}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}

// Sub-components for cleaner file

function PersonalForm({ data, updateData, onNext }: any) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Let's get to know you</h2>
                <p className="text-zinc-400 text-sm">Tell us a bit about yourself.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        placeholder="John"
                        value={data.firstName}
                        onChange={(e: any) => updateData({ firstName: e.target.value })}
                        required
                    />
                    <Input
                        label="Last Name"
                        placeholder="Doe"
                        value={data.lastName}
                        onChange={(e: any) => updateData({ lastName: e.target.value })}
                        required
                    />
                </div>
                <Input
                    label="Phone Number"
                    placeholder="(555) 000-0000"
                    type="tel"
                    value={data.phoneNumber}
                    onChange={(e: any) => updateData({ phoneNumber: e.target.value })}
                    required
                />
                <Input
                    label="Business Name (Optional)"
                    placeholder="Acme Real Estate"
                    value={data.businessName}
                    onChange={(e: any) => updateData({ businessName: e.target.value })}
                />
            </div>

            <button
                onClick={onNext}
                disabled={!data.firstName || !data.lastName || !data.phoneNumber}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all"
            >
                Continue to Role Selection
            </button>
        </motion.div>
    );
}

function RolesSelection({ selectedRoles, onToggle, onNext }: any) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">What describes you best?</h2>
                <p className="text-zinc-400 text-sm">Select all that apply.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {ROLES.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => onToggle(role.id)}
                        className={`flex items-center p-4 rounded-xl border transition-all duration-200 group text-left ${selectedRoles.includes(role.id)
                            ? "bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                            }`}
                    >
                        <span className="text-2xl mr-4">{role.icon}</span>
                        <div className="flex-1">
                            <div className={`font-bold ${selectedRoles.includes(role.id) ? "text-white" : "text-zinc-300"}`}>
                                {role.label}
                            </div>
                            <div className="text-sm text-zinc-500">{role.description}</div>
                        </div>
                        {selectedRoles.includes(role.id) && (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white">✓</div>
                        )}
                    </button>
                ))}
            </div>

            <button
                onClick={onNext}
                disabled={selectedRoles.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all"
            >
                Continue
            </button>
        </motion.div>
    );
}

function InvestorForm({ data, updateData, onNext, loading }: any) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Investor Profile</h2>
                <p className="text-zinc-400 text-sm">Help us find the right deals for you.</p>
            </div>

            <div className="space-y-4">
                <Input label="Buy Box Description" placeholder="Describe what you're looking for..." value={data.buyBox} onChange={(e: any) => updateData({ buyBox: e.target.value })} />

                <Input label="Max Entry / Budget" placeholder="$250,000" value={data.maxEntry} onChange={(e: any) => updateData({ maxEntry: e.target.value })} />

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Deal Types</label>
                    <div className="flex flex-wrap gap-2">
                        {['Cash', 'Seller Finance', 'Mortgage Takeover', 'Hybrid', 'Trust Acquisition'].map(type => (
                            <button key={type} onClick={() => {
                                const newTypes = data.dealTypes.includes(type) ? data.dealTypes.filter((t: string) => t !== type) : [...data.dealTypes, type];
                                updateData({ dealTypes: newTypes });
                            }} className={`px-3 py-2 rounded-lg text-sm font-medium border ${data.dealTypes.includes(type) ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <Input label="Asset Types" placeholder="Single Family, Multi-Family, Land..." value={data.assetTypes.join(', ')} onChange={(e: any) => updateData({ assetTypes: e.target.value.split(', ') })} />
                <Input label="Preferred Areas (Texas)" placeholder="Houston, Austin, Dallas..." value={data.areas} onChange={(e: any) => updateData({ areas: e.target.value })} />
                <Input label="Property Details" placeholder="3+ Beds, 2+ Baths, 1500+ sqft..." value={data.propertyDetails} onChange={(e: any) => updateData({ propertyDetails: e.target.value })} />
                <Input label="Target Return" placeholder="15% ROI, $300/mo cashflow..." value={data.targetReturn} onChange={(e: any) => updateData({ targetReturn: e.target.value })} />
            </div>

            <Button onClick={onNext} loading={loading}>Next</Button>
        </motion.div>
    );
}

function WholesalerForm({ data, updateData, onNext, loading }: any) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Wholesaler Details</h2>
                <p className="text-zinc-400 text-sm">Tell us about your experience.</p>
            </div>

            <div className="space-y-4">
                <Input label="How long have you been wholesaling?" placeholder="e.g. 2 years" value={data.experienceYears} onChange={(e: any) => updateData({ experienceYears: e.target.value })} />
                <Input label="Deals Closed" placeholder="Approximation (e.g. 10+)" value={data.dealsClosed} onChange={(e: any) => updateData({ dealsClosed: e.target.value })} />
            </div>

            <Button onClick={onNext} loading={loading}>Next</Button>
        </motion.div>
    );
}

function ServiceForm({ data, updateData, onNext, loading }: any) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Transaction Service</h2>
                <p className="text-zinc-400 text-sm">Connect with investors needing your services.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Service Type</label>
                    <div className="flex flex-wrap gap-2">
                        {['Lender', 'Escrow Officer', 'Title Company'].map(type => (
                            <button key={type} onClick={() => updateData({ serviceType: type })}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border ${data.serviceType === type ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <Input label="Company Name" placeholder="Your Company LLC" value={data.companyName} onChange={(e: any) => updateData({ companyName: e.target.value })} />
            </div>

            <Button onClick={onNext} loading={loading}>Next</Button>
        </motion.div>
    );
}

function VendorForm({ data, updateData, onNext, loading }: any) {
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">Vendor Details</h2>
                <p className="text-zinc-400 text-sm">What services do you provide?</p>
            </div>

            <div className="space-y-4">
                <Input label="Service Type" placeholder="Contractor, Inspector, Staging..." value={data.serviceType} onChange={(e: any) => updateData({ serviceType: e.target.value })} />
                <Input label="Company Name" placeholder="Your Company LLC" value={data.companyName} onChange={(e: any) => updateData({ companyName: e.target.value })} />
            </div>

            <Button onClick={onNext} loading={loading}>Complete Setup</Button>
        </motion.div>
    );
}

// UI Components
const Input = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-zinc-500 ml-1">{label}</label>
        <input
            {...props}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
    </div>
);

const Button = ({ children, loading, ...props }: any) => (
    <button
        {...props}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-50"
    >
        {loading ? "Processing..." : children}
    </button>
);
