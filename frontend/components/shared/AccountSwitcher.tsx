"use client";

import { useAccounts } from "@/lib/hooks/useAccounts";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Wallet, Building, Landmark } from "lucide-react";

export function AccountSwitcher() {
  const { data: accounts, loading } = useAccounts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentAccount = searchParams.get("account") || "all";
  const [isPending, startTransition] = useTransition();

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    startTransition(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value === "all") {
        params.delete("account");
      } else {
        params.set("account", value);
      }
      router.push(`?${params.toString()}`);
    });
  };

  if (loading) return <div className="h-10 w-[200px] bg-muted animate-pulse rounded-md" />;

  return (
    <div className="flex items-center gap-2 relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        <Landmark className="h-4 w-4" />
      </div>
      <select 
        value={currentAccount} 
        onChange={handleValueChange} 
        disabled={isPending}
        className="h-9 rounded-md border border-black/10 bg-background/50 backdrop-blur-sm px-3 pl-9 pr-8 text-sm font-medium transition-all hover:bg-background/80 focus:outline-none appearance-none cursor-pointer text-foreground"
      >
        <option value="all">All Accounts (Net Position)</option>
        {accounts?.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.display_name} {acc.account_no ? `(••${acc.account_no.slice(-4)})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
