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
    <div className="flex min-h-screen w-full bg-[#FCFCFC] relative">
      <div 
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[#FCFCFC] border-r border-black/5 ${
          isSidebarOpen ? "w-[240px]" : "w-[68px]"
        }`}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div 
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 ${
          isSidebarOpen ? "md:pl-[240px]" : "md:pl-[68px]"
        }`}
      >
        <Header />
        <main className="flex-1 w-full max-w-[1400px] mx-auto pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
