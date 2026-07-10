"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/api";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import { PrecisionSparkline } from "@/components/ui/PrecisionSparkline";

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
      <div className="flex items-center justify-center h-48 text-[13px] text-[var(--secondary-text)]">
        Loading dashboard...
      </div>
    );
  }

  if (!data) return null;

  const { summary, recent_transactions, top_categories, top_merchants } = data;

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto w-full px-6 py-12">
      {/* Editorial Header / Primary Metric */}
      <div className="flex flex-col gap-6 border-b border-[var(--border)] pb-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-[14px] font-medium text-[var(--secondary-text)]">This Month's Balance</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-medium text-[var(--foreground)] tracking-tight mono-num">
                ₹{summary.savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
              </span>
              <span className="text-[14px] font-medium text-[var(--success)] bg-green-50 px-2 py-0.5 rounded-md">
                {summary.savings_rate.toFixed(1)}% saved
              </span>
            </div>
          </div>
          
          <div className="hidden sm:block w-32 md:w-48 self-center">
            <PrecisionSparkline 
              data={[2000, 2400, 2200, 2800, 2600, 3100, 3000, 3400, 3800, 3600, 4000, summary.savings]} 
              height={40} 
            />
          </div>

          <button 
            onClick={() => setIsInsightsOpen(true)}
            className="btn-secondary text-[13px] hidden sm:flex shrink-0"
          >
            View Latest Insight
          </button>
        </div>

        <p className="text-[15px] text-[var(--foreground)] leading-relaxed max-w-2xl">
          You earned <span className="font-medium mono-num">₹{summary.income.toLocaleString()}</span> and spent <span className="font-medium mono-num">₹{summary.expenses.toLocaleString()}</span> so far. Your saving rate is healthy, keeping your financial score strong.
        </p>

        {/* Secondary Nav */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
          {[
            { label: "Money Flow", href: "/app/money-flow" },
            { label: "Timeline", href: "/app/timeline" },
            { label: "Journey", href: "/app/monthly-journey" },
            { label: "Your DNA", href: "/app/financial-dna" }
          ].map((item, i) => (
            <Link 
              key={i} 
              href={item.href} 
              className="text-[13px] font-medium text-[var(--secondary-text)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1"
            >
              {item.label} <ArrowRight className="w-3 h-3 opacity-50" />
            </Link>
          ))}
        </div>
      </div>

      {/* Middle Section: Top Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-[var(--border)] pb-10">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <h3 className="text-[14px] font-medium text-[var(--foreground)]">Where your money went</h3>
          </div>
          <div className="flex flex-col">
            {top_categories.map((cat: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/50 last:border-0 group">
                <span className="text-[14px] text-[var(--secondary-text)] group-hover:text-[var(--foreground)] transition-colors">{cat.name}</span>
                <span className="text-[14px] text-[var(--foreground)] font-medium mono-num">₹{cat.amount.toLocaleString()}</span>
              </div>
            ))}
            {top_categories.length === 0 && <span className="text-[13px] text-[var(--muted-text)] py-2">Nothing to show yet.</span>}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-baseline">
            <h3 className="text-[14px] font-medium text-[var(--foreground)]">Top Merchants</h3>
          </div>
          <div className="flex flex-col">
            {top_merchants.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/50 last:border-0 group">
                <span className="text-[14px] text-[var(--secondary-text)] group-hover:text-[var(--foreground)] transition-colors">{m.name}</span>
                <span className="text-[14px] text-[var(--foreground)] font-medium mono-num">₹{m.amount.toLocaleString()}</span>
              </div>
            ))}
            {top_merchants.length === 0 && <span className="text-[13px] text-[var(--muted-text)] py-2">Nothing to show yet.</span>}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-baseline">
          <h3 className="text-[14px] font-medium text-[var(--foreground)]">Recent Activity</h3>
          <Link href="/app/transactions" className="text-[13px] font-medium text-[var(--secondary-text)] hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3 opacity-50" />
          </Link>
        </div>
        <div className="w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-2 py-3 text-[12px] font-medium text-[var(--muted-text)] w-32">Date</th>
                <th className="px-2 py-3 text-[12px] font-medium text-[var(--muted-text)]">Transaction</th>
                <th className="px-2 py-3 text-[12px] font-medium text-[var(--muted-text)] w-48">Merchant</th>
                <th className="px-2 py-3 text-[12px] font-medium text-[var(--muted-text)] text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors group">
                  <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] whitespace-nowrap mono-num">{tx.date}</td>
                  <td className="px-2 py-4 text-[14px] text-[var(--foreground)]">{tx.description}</td>
                  <td className="px-2 py-4 text-[13px] text-[var(--foreground)]">{tx.merchant || "-"}</td>
                  <td className="px-2 py-4 text-right whitespace-nowrap">
                    <span className={`text-[14px] mono-num font-medium ${tx.type === 'CREDIT' ? 'text-[var(--success)]' : 'text-[var(--foreground)]'}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {recent_transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-2 py-8 text-[13px] text-center text-[var(--muted-text)]">No transactions yet — add your first one to get started.</td>
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
              className="relative w-full max-w-[500px] bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-8 flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-[var(--foreground)] tracking-tight">Insight</h3>
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="p-1.5 -mr-1.5 -mt-1.5 text-[var(--secondary-text)] hover:bg-[var(--hover)] hover:text-[var(--foreground)] rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[15px] font-medium text-[var(--foreground)]">You're having a good income month.</span>
                <span className="text-[14px] text-[var(--secondary-text)] leading-relaxed">
                  Your savings rate is looking very healthy this period. Keep it up. See the full Insights page for a complete breakdown of where your money is going.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsInsightsOpen(false)}
                  className="btn-ghost"
                >
                  Close
                </button>
                <Link href="/app/insights" className="btn-primary">
                  See more details
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
