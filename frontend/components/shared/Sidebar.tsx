"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UploadCloud, FileText, List, Repeat, Clock, Calendar, Fingerprint, Lightbulb, Settings } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "Dashboard": LayoutDashboard,
  "Upload": UploadCloud,
  "Statements": FileText,
  "Transactions": List,
  "Money Flow": Repeat,
  "Timeline": Clock,
  "Monthly Journey": Calendar,
  "Financial DNA": Fingerprint,
  "Insights": Lightbulb,
  "Settings": Settings,
};

const links = [
  { name: "Dashboard", href: "/app/dashboard" },
  { name: "Upload", href: "/app/upload" },
  { name: "Statements", href: "/app/statements" },
  { name: "Transactions", href: "/app/transactions" },
  { name: "Money Flow", href: "/app/money-flow" },
  { name: "Timeline", href: "/app/timeline" },
  { name: "Monthly Journey", href: "/app/monthly-journey" },
  { name: "Financial DNA", href: "/app/financial-dna" },
  { name: "Insights", href: "/app/insights" },
  { name: "Settings", href: "/app/settings" },
];

export function Sidebar({ isSidebarOpen = true, toggleSidebar }: { isSidebarOpen?: boolean; toggleSidebar?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex h-14 items-center px-4 shrink-0 mt-2">
        <button onClick={toggleSidebar} className={`flex items-center gap-2 w-full overflow-hidden hover:opacity-70 transition-opacity ${isSidebarOpen ? 'justify-start' : 'justify-center'}`}>
          <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-background tracking-tighter">ER</span>
          </div>
          <span className={`text-[15px] font-medium text-foreground tracking-tight transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
            ERIS
          </span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <ul className="flex flex-col gap-0.5 px-3">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = iconMap[link.name] || FileText;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition-colors whitespace-nowrap overflow-hidden group relative",
                    isActive
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-[var(--hover)] hover:text-foreground",
                    !isSidebarOpen && "px-0 justify-center"
                  )}
                  title={!isSidebarOpen ? link.name : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--primary)] rounded-r-full" />
                  )}
                  <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive ? "text-[var(--primary)]" : "text-[var(--muted-text)] group-hover:text-foreground")} />
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
      
      <div className="p-3 mt-auto shrink-0 border-t border-black/5">
        <div className={cn(
          "flex items-center rounded-md p-2 hover:bg-black/[0.02] transition-colors cursor-pointer overflow-hidden",
          isSidebarOpen ? "gap-2" : "justify-center px-0"
        )}>
          <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-foreground font-medium text-[11px] shrink-0 border border-black/10">
            AP
          </div>
          <div 
            className={`flex flex-col whitespace-nowrap transition-all duration-300 ${
              isSidebarOpen ? "opacity-100" : "opacity-0 w-0 hidden"
            }`}
          >
            <span className="text-[13px] font-medium text-foreground leading-tight truncate">Aniket Pandey</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Free Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
