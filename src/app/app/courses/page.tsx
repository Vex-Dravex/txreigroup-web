import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AppHeader from "../components/AppHeader";
import { getPrimaryRole, getUserRoles } from "@/lib/roles";
import EducationTutorialTrigger from "./EducationTutorialTrigger";
import FadeIn from "../../components/FadeIn";

export const dynamic = 'force-dynamic';

export default async function CoursesComingSoonPage() {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login?mode=signup");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", authData.user.id)
    .single();

  const roles = await getUserRoles(supabase, authData.user.id, profile?.role || "investor");
  const userRole = getPrimaryRole(roles, profile?.role || "investor");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 selection:bg-amber-500/30 overflow-hidden">
      <div className="noise-overlay fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />

      {/* Background Gradient Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader
          userRole={userRole}
          currentPage="courses"
          avatarUrl={profile?.avatar_url || null}
          displayName={profile?.display_name || null}
          email={authData.user.email}
        />

        <main className="flex-1 flex items-center justify-center p-6">
          <FadeIn>
            <div className="max-w-4xl w-full text-center space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/5 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                    Coming Soon
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 font-syne leading-[0.9] italic">
                  MASTER THE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600">
                    MARKET
                  </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                  The Education Center is evolving into the ultimate resource for HTX real estate investors.
                  From exclusive playbooks to live strategy sessions, get ready to scale your portfolio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { title: "Expert Courses", desc: "Step-by-step guides for every strategy." },
                  { title: "Live Sessions", desc: "Weekly Q&As with industry leaders." },
                  { title: "Resource Library", desc: "Contracts, scripts, and calculators." }
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-[2rem] border border-white/20 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl transition-all hover:scale-[1.02] hover:bg-white/60 dark:hover:bg-zinc-900/60 shadow-xl group">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-amber-500 transition-colors">{item.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-6 pt-8">
                <EducationTutorialTrigger />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Ready to see what&apos;s brewing? Take the interactive tour.
                </p>
              </div>
            </div>
          </FadeIn>
        </main>

        <footer className="p-8 text-center border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
            &copy; {new Date().getFullYear()} HTXREI Group &bull; Built for Investors
          </p>
        </footer>
      </div>
    </div>
  );
}

