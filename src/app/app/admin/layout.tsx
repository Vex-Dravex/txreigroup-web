import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-purple-500/30">
            {/* Background decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
                <div className="absolute top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
                <div className="absolute bottom-[0%] right-[20%] h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px]" />
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
