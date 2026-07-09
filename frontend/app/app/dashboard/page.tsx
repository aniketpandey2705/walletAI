"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/api";
import Link from "next/link";
import { X } from "lucide-react";

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
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;

  const { summary, recent_transactions, top_categories, top_merchants } = data;

  const financialScore = Math.min(100, Math.max(0, 50 + (summary.savings_rate * 1.5)));
  
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-medium text-foreground tracking-tight leading-none mb-2">Overview</h1>
          <span className="text-sm text-muted-foreground">Your financial snapshot</span>
        </div>
        <button 
          onClick={() => setIsInsightsOpen(true)}
          className="btn-secondary text-[13px]"
        >
          View Latest Insight
        </button>
      </div>

      {/* Main KPI Row */}
      <div className="flex flex-wrap md:flex-nowrap gap-12 border-b border-[var(--border)] pb-8">
        <div className="flex flex-col gap-1 flex-1">
           <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Financial Score</span>
           <div className="flex items-baseline gap-2">
             <span className="text-3xl font-medium text-[var(--foreground)] tabular-nums tracking-tight">
               {Math.round(financialScore)}
             </span>
             <span className="text-xs text-[var(--muted-text)]">/ 100</span>
           </div>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Income</span>
          <span className="text-3xl font-medium text-[var(--foreground)] tabular-nums tracking-tight">
            ₹{summary.income.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
          </span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Expenses</span>
          <span className="text-3xl font-medium text-[var(--foreground)] tabular-nums tracking-tight">
            ₹{summary.expenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
          </span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Net Savings</span>
          <span className="text-3xl font-medium text-[var(--foreground)] tabular-nums tracking-tight">
            ₹{summary.savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
          </span>
          <span className="text-[11px] font-medium text-[var(--secondary-text)] mt-0.5">{summary.savings_rate.toFixed(1)}% rate</span>
        </div>
      </div>

      {/* Navigation Portals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Money Flow", href: "/app/money-flow" },
          { label: "Timeline", href: "/app/timeline" },
          { label: "Journey", href: "/app/monthly-journey" },
          { label: "Your DNA", href: "/app/financial-dna" }
        ].map((item, i) => (
          <Link 
            key={i} 
            href={item.href} 
            className="flex items-center justify-center p-3 rounded-md border border-[var(--border)] bg-transparent hover:bg-[var(--hover)] transition-colors text-[13px] font-medium text-[var(--foreground)]"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Middle Section: Top Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-[var(--border)] pb-10">
        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-baseline">
            <h3 className="text-[15px] font-medium text-[var(--foreground)] uppercase tracking-wider">Top Categories</h3>
            <Link href="/app/transactions" className="link-quiet text-[11px] uppercase tracking-wider">View All</Link>
          </div>
          <div className="flex flex-col">
            {top_categories.map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 group">
                <span className="text-[13px] text-[var(--foreground)] group-hover:pl-1 transition-all">{cat.name}</span>
                <span className="text-[13px] text-[var(--foreground)] font-medium tabular-nums">₹{cat.amount.toLocaleString()}</span>
              </div>
            ))}
            {top_categories.length === 0 && <span className="text-[13px] text-[var(--muted-text)] py-2">No data yet.</span>}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex justify-between items-baseline">
            <h3 className="text-[15px] font-medium text-[var(--foreground)] uppercase tracking-wider">Top Merchants</h3>
            <Link href="/app/transactions" className="link-quiet text-[11px] uppercase tracking-wider">View All</Link>
          </div>
          <div className="flex flex-col">
            {top_merchants.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 group">
                <span className="text-[13px] text-[var(--foreground)] group-hover:pl-1 transition-all">{m.name}</span>
                <span className="text-[13px] text-[var(--foreground)] font-medium tabular-nums">₹{m.amount.toLocaleString()}</span>
              </div>
            ))}
            {top_merchants.length === 0 && <span className="text-[13px] text-[var(--muted-text)] py-2">No data yet.</span>}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-[15px] font-medium text-[var(--foreground)] uppercase tracking-wider">Recent Transactions</h3>
          <Link href="/app/transactions" className="link-quiet text-[11px] uppercase tracking-wider">View All</Link>
        </div>
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] w-32">Date</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Transaction</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] w-48">Merchant</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors group">
                  <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] whitespace-nowrap tabular-nums">{tx.date}</td>
                  <td className="px-2 py-4 text-[14px] text-[var(--foreground)]">{tx.description}</td>
                  <td className="px-2 py-4 text-[13px] text-[var(--foreground)]">{tx.merchant || "-"}</td>
                  <td className="px-2 py-4 text-right whitespace-nowrap">
                    <span className={`text-[14px] tabular-nums font-medium ${tx.type === 'CREDIT' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {recent_transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-[13px] text-center text-[var(--muted-text)]">No recent transactions found.</td>
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setIsInsightsOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-[500px] bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--border)] p-8 flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-[var(--foreground)] tracking-tight">Latest Insight</h3>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="p-2 -mr-2 -mt-2 text-[var(--secondary-text)] hover:bg-[var(--hover)] rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2 bg-[var(--background)] p-4 rounded-md border border-[var(--border)]">
                <span className="text-[14px] font-medium text-[var(--foreground)]">Good Income Month</span>
                <span className="text-[13px] text-[var(--secondary-text)] leading-relaxed">Your savings rate is looking very healthy this period. See the Insights page for a complete breakdown.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="btn-ghost"
                >
                  Close
                </button>
                <Link href="/app/insights" className="btn-primary">
                  View All Insights
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
