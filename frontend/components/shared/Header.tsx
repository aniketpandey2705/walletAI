"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className="sticky top-0 z-30 pt-4 px-6 lg:px-8 pb-4">
      <header className="flex h-16 items-center gap-4 px-6 rounded-full transition-all bg-white/40 backdrop-blur-[40px] backdrop-saturate-[2] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05),_inset_0_1px_0_rgba(255,255,255,0.8),_inset_0_0_30px_rgba(255,255,255,0.2)]">
        <div className="flex items-center gap-4 w-full flex-1 overflow-hidden">
          <div className="flex flex-col truncate">
            <span className="text-[17px] font-bold font-display text-foreground leading-tight tracking-tight truncate">Good morning, Aniket</span>
            <span className="text-[11px] text-muted-foreground truncate">Here's your financial summary for May 2026</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn-liquid-glass flex items-center gap-2 px-5 py-2 text-sm font-semibold btn-click-anim text-foreground shrink-0"
        >
          
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </header>
    </div>
  );
}
