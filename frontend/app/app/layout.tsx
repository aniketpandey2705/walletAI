"use client";

import { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Dynamic Background Orbs (Subtle) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-[120px] mix-blend-multiply animate-[spin_30s_linear_infinite]" />
        <div className="absolute top-[20%] right-[-10%] w-[45%] h-[60%] rounded-full bg-amber-50/50 blur-[100px] mix-blend-multiply animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute bottom-[-20%] left-[10%] w-[60%] h-[50%] rounded-full bg-slate-100/40 blur-[120px] mix-blend-multiply animate-[spin_35s_linear_infinite]" />
      </div>

      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-4 left-4 z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isSidebarOpen ? "w-[260px]" : "w-[88px]"
        }`}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Main Content Area */}
      <div 
        className={`flex flex-col flex-1 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 ${
          isSidebarOpen ? "md:pl-[276px]" : "md:pl-[104px]"
        }`}
      >
        <Header />
        <main className="flex-1 p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
