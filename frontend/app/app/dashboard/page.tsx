"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Wallet, AlertCircle, Lightbulb } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const categoryData = [
  { name: "Food & Dining", value: 4500 },
  { name: "Travel", value: 3200 },
  { name: "UPI Transfers", value: 2800 },
  { name: "Shopping", value: 1500 },
  { name: "Other", value: 900 },
];

const recentTransactions = [
  { id: 1, date: "2026-05-31", desc: "UPI/DR/Indian Rai/SBIN", amount: 29.10, type: "DEBIT", category: "Travel" },
  { id: 2, date: "2026-05-29", desc: "UPI/CR/Sanjay Kum/NSPB", amount: 500.00, type: "CREDIT", category: "Transfer" },
  { id: 3, date: "2026-05-28", desc: "UPI/CR/VIKRAMADIT/SBIN", amount: 3000.00, type: "CREDIT", category: "Income" },
  { id: 4, date: "2026-05-28", desc: "Int.Pd:28-04-2026 to 27-05", amount: 1.00, type: "CREDIT", category: "Interest" },
  { id: 5, date: "2026-05-27", desc: "UPI/DR/Sushil Ram/YESB", amount: 10.00, type: "DEBIT", category: "Transfer" },
];

export default function DashboardPage() {
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Top Header Row with Title and AI Insights Trigger */}
      <div className="flex justify-between items-center animate-item">
        <h2 className="text-2xl font-bold font-display text-foreground tracking-tight">Dashboard</h2>
        <button 
          onClick={() => setIsInsightsOpen(true)}
          className="btn-liquid-glass flex items-center gap-2 px-5 py-2.5 text-sm font-semibold btn-click-anim text-foreground cursor-pointer"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 8px 32px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(0, 0, 0, 0.08)",
          }}
        >
          <Lightbulb className="w-4 h-4 text-primary animate-pulse" />
          AI Insights
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group animate-item delay-100 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Income</span>
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-display text-foreground">₹6,517.67</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group animate-item delay-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Expense</span>
            <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center text-danger">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-display text-foreground">₹5,685.71</span>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden group animate-item delay-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Net Savings</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold font-display text-foreground">₹831.96</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Full-Width Chart */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 animate-item delay-400">
          <h3 className="text-lg font-semibold font-display text-foreground">Spending by Category</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }} width={100} />
                <Tooltip 
                  cursor={{ fill: 'rgba(184,65,40,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(16px)' }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(184,65,40,${1 - index * 0.15})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card flex flex-col overflow-hidden animate-item delay-400">
        <div className="p-6 border-b border-white/40 bg-white/10">
          <h3 className="text-lg font-semibold font-display text-foreground">Recent Transactions</h3>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-white/20 border-b border-white/40">
              <tr>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Type</th>
                <th className="px-6 py-4 font-medium">Category</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, idx) => (
                <tr key={tx.id} className={`border-b border-white/20 hover:bg-white/40 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-primary/[0.05]'}`}>
                  <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate">{tx.desc}</td>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      tx.type === 'CREDIT' ? 'bg-accent/20 text-accent-foreground text-accent' : 'bg-primary/20 text-primary'
                    }`}>
                      {tx.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Modal */}
      {isInsightsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
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
              <h3 className="text-xl font-bold font-display text-foreground">AI Insights</h3>
              <button 
                onClick={() => setIsInsightsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/[0.05] transition-colors cursor-pointer text-xl"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Insight 1 */}
              <div 
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/40 hover:bg-white/50 transition-colors"
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-foreground">High Travel Expenses</span>
                  <span className="text-[12px] text-muted-foreground mt-1 leading-relaxed">You spent 25% more on travel this month compared to your usual average.</span>
                </div>
              </div>

              {/* Insight 2 */}
              <div 
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/40 hover:bg-white/50 transition-colors"
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Lightbulb className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-foreground">Savings Opportunity</span>
                  <span className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Transferring ₹500 to a fixed deposit could earn you better interest.</span>
                </div>
              </div>

              {/* Insight 3 */}
              <div 
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/40 hover:bg-white/50 transition-colors"
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(0, 0, 0, 0.06)",
                }}
              >
                <Lightbulb className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={2} />
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-foreground">Good Income Month</span>
                  <span className="text-[12px] text-muted-foreground mt-1 leading-relaxed">Your income is higher than your expenses. Keep it up!</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setIsInsightsOpen(false)}
                className="btn-liquid-glass bg-black/[0.05] hover:bg-black/[0.1] text-foreground font-semibold py-2 px-5 rounded-full btn-click-anim cursor-pointer"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 1px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.02)",
                  border: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
