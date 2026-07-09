"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/api";
import Link from "next/link";

export default function DashboardPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetchApi("/analytics/dashboard");
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [fetchApi]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, recent_transactions, top_categories, top_merchants } = data;

  // Simple Financial Score Calculation based on savings rate
  const financialScore = Math.min(100, Math.max(0, 50 + (summary.savings_rate * 1.5)));
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 50) return "text-primary";
    return "text-danger";
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Top Header Row with Title and AI Insights Trigger */}
      <div className="flex justify-between items-center animate-item">
        <h2 className="text-2xl font-bold font-display text-foreground tracking-tight">Financial Overview</h2>
        <button 
          onClick={() => setIsInsightsOpen(true)}
          className="btn-liquid-glass flex items-center gap-2 px-5 py-2.5 text-sm font-semibold btn-click-anim text-foreground cursor-pointer"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          
          Latest Insight
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Financial Score */}
        <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group animate-item hover:-translate-y-1 justify-center items-center">
           <span className="text-sm font-medium text-muted-foreground text-center">Financial Score</span>
           <div className={`text-5xl font-black font-display tracking-tight ${getScoreColor(financialScore)}`}>
             {Math.round(financialScore)}
           </div>
           <span className="text-xs text-muted-foreground mt-1">Out of 100</span>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group animate-item delay-100 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Income</span>
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
              
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-display text-foreground">₹{summary.income.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group animate-item delay-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Expenses</span>
            <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center text-danger">
              
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-display text-foreground">₹{summary.expenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group animate-item delay-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Net Savings</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-display text-foreground">₹{summary.savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">{summary.savings_rate.toFixed(1)}% savings rate</span>
          </div>
        </div>
      </div>

      {/* Navigation Portals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-item delay-400">
        <Link href="/app/money-flow" className="glass-card p-4 flex items-center justify-between hover:bg-white/60 transition-colors group">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"></div>
             <span className="font-semibold text-sm">Money Flow</span>
          </div>
          
        </Link>
        <Link href="/app/timeline" className="glass-card p-4 flex items-center justify-between hover:bg-white/60 transition-colors group">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent"></div>
             <span className="font-semibold text-sm">Timeline</span>
          </div>
          
        </Link>
        <Link href="/app/monthly-journey" className="glass-card p-4 flex items-center justify-between hover:bg-white/60 transition-colors group">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success"></div>
             <span className="font-semibold text-sm">Journey</span>
          </div>
          
        </Link>
        <Link href="/app/financial-dna" className="glass-card p-4 flex items-center justify-between hover:bg-white/60 transition-colors group">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600"></div>
             <span className="font-semibold text-sm">Your DNA</span>
          </div>
          
        </Link>
      </div>

      {/* Middle Section: Top Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="glass-card p-6 flex flex-col gap-4 animate-item delay-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold font-display text-foreground">Top Categories</h3>
            <Link href="/app/transactions" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {top_categories.map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium text-sm text-foreground">{cat.name}</span>
                </div>
                <span className="font-semibold text-sm">₹{cat.amount.toLocaleString()}</span>
              </div>
            ))}
            {top_categories.length === 0 && <span className="text-sm text-muted-foreground">No data yet.</span>}
          </div>
        </div>

        {/* Top Merchants */}
        <div className="glass-card p-6 flex flex-col gap-4 animate-item delay-500">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold font-display text-foreground">Top Merchants</h3>
            <Link href="/app/transactions" className="text-sm font-medium text-primary hover:underline">View All</Link>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {top_merchants.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center font-bold text-xs shadow-sm">
                    {m.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm text-foreground">{m.name}</span>
                </div>
                <span className="font-semibold text-sm">₹{m.amount.toLocaleString()}</span>
              </div>
            ))}
            {top_merchants.length === 0 && <span className="text-sm text-muted-foreground">No data yet.</span>}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card flex flex-col overflow-hidden animate-item delay-600">
        <div className="p-6 border-b border-white/40 bg-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold font-display text-foreground">Recent Transactions</h3>
          <Link href="/app/transactions" className="text-sm font-medium text-primary hover:underline">View All</Link>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Merchant</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Type</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.map((tx: any, idx: number) => (
                <tr key={tx.id} className={`border-b border-white/20 hover:bg-white/40 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-primary/[0.05]'}`}>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate">{tx.description}</td>
                  <td className="px-6 py-4 font-medium text-foreground">{tx.merchant || "-"}</td>
                  <td className={`px-6 py-4 text-right font-semibold whitespace-nowrap ${tx.type === 'CREDIT' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      tx.type === 'CREDIT' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                </tr>
              ))}
              {recent_transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No recent transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Modal */}
      <AnimatePresence>
        {isInsightsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInsightsOpen(false)}
              className="absolute inset-0 bg-black/25 backdrop-blur-[4px] cursor-pointer"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="z-10 w-full max-w-lg rounded-[28px] bg-white/80 backdrop-blur-[50px] p-8 space-y-6 relative overflow-hidden text-left"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 24px 64px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0, 0, 0, 0.08)",
              }}
            >
              <div className="flex justify-between items-center pb-2 border-b border-black/[0.05]">
                <h3 className="text-xl font-bold font-display text-foreground">Latest Insight</h3>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors cursor-pointer text-xl"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div 
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/40 hover:bg-white/50 transition-colors"
                  style={{
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  
                  <div className="flex flex-col">
                    <span className="text-[14px] font-bold text-foreground">Good Income Month</span>
                    <span className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Your savings rate is looking very healthy this period. See the Insights page for a complete breakdown.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Link href="/app/insights" className="btn-liquid-glass bg-primary/10 text-primary font-semibold py-2 px-5 rounded-full btn-click-anim">
                  View All Insights
                </Link>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="btn-liquid-glass bg-black/[0.05] hover:bg-black/[0.1] text-foreground font-semibold py-2 px-5 rounded-full btn-click-anim cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
