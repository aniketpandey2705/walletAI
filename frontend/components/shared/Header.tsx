"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AccountSwitcher } from "@/components/shared/AccountSwitcher";

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
    <div className="sticky top-0 z-30 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <header className="flex h-14 items-center justify-between px-6 lg:px-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col justify-center">
          <span className="text-[14px] font-medium text-foreground leading-tight tracking-tight">Aniket Pandey</span>
          <span className="text-[12px] text-[var(--secondary-text)]">{format(new Date(), "MMMM yyyy")} Summary</span>
        </div>
        <div className="flex items-center gap-4">
          <AccountSwitcher />
          <button
            onClick={handleSignOut}
            className="btn-ghost"
          >
            Sign Out
          </button>
        </div>
      </header>
    </div>
  );
}
