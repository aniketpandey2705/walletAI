"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Upload, List, Tag, Settings, FileText, ArrowRightLeft, Clock, Compass, Dna, Lightbulb } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
  { name: "Upload", href: "/app/upload", icon: Upload },
  { name: "Statements", href: "/app/statements", icon: FileText },
  { name: "Transactions", href: "/app/transactions", icon: List },
  { name: "Money Flow", href: "/app/money-flow", icon: ArrowRightLeft },
  { name: "Timeline", href: "/app/timeline", icon: Clock },
  { name: "Monthly Journey", href: "/app/monthly-journey", icon: Compass },
  { name: "Financial DNA", href: "/app/financial-dna", icon: Dna },
  { name: "Insights", href: "/app/insights", icon: Lightbulb },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar({ isSidebarOpen = true, toggleSidebar }: { isSidebarOpen?: boolean; toggleSidebar?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col rounded-2xl transition-all overflow-hidden bg-white/40 backdrop-blur-[40px] backdrop-saturate-[2] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05),_inset_0_1px_0_rgba(255,255,255,0.8),_inset_0_0_30px_rgba(255,255,255,0.2)]">
      <div className="flex h-20 items-center px-6 animate-item border-b border-white/50 shrink-0">
        <button onClick={toggleSidebar} className="flex items-center gap-3 w-full btn-click-anim text-left">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0 transition-all hover:bg-primary/20">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span 
            className={`text-2xl font-bold font-display text-primary tracking-tight whitespace-nowrap transition-all duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
            }`}
          >
            WalletDNA
          </span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6">
        <ul className="grid gap-2 px-4">
          {links.map((link, idx) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <li key={link.name} className={`animate-item delay-${(idx + 1) * 100}`}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium relative btn-click-anim transition-all whitespace-nowrap overflow-hidden",
                    isActive
                      ? "text-primary bg-primary/[0.08]"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    !isSidebarOpen && "px-0 justify-center"
                  )}
                  title={!isSidebarOpen ? link.name : undefined}
                >
                  <link.icon className="h-5 w-5 shrink-0" />
                  <span 
                    className={`transition-all duration-300 ${
                      isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 mt-auto animate-item delay-400">
        <div className={cn(
          "flex items-center p-3 rounded-lg bg-white/40 border border-white/50 shadow-sm cursor-pointer hover:bg-white/60 btn-click-anim overflow-hidden",
          isSidebarOpen ? "gap-3" : "justify-center px-0"
        )}>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            AP
          </div>
          <div 
            className={`flex flex-col whitespace-nowrap transition-all duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
            }`}
          >
            <span className="text-sm font-semibold text-foreground truncate">Aniket Pandey</span>
            <span className="text-xs font-medium text-accent">Free Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
