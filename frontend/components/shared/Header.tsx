"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Header() {
  const supabase = createClient();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
      <div className="w-full flex-1">
        {/* Can add search bar here in future */}
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </header>
  );
}
