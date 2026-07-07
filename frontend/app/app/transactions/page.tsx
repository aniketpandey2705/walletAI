"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { ArrowUpRight, ArrowDownRight, Wallet, Search, Filter } from "lucide-react";

export default function TransactionsPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      if (search) params.append("search", search);
      if (typeFilter) params.append("type", typeFilter);
      const res = await fetchApi(`/transactions?${params}`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const totalIncome = data?.data?.filter((t: any) => t.type === "CREDIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;
  const totalExpense = data?.data?.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between animate-item">
        <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Transactions</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">{data?.total ?? 0} total</span>
          <button className="btn-liquid-glass px-4 py-2 text-sm font-semibold text-foreground btn-click-anim">
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden animate-item delay-100 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Income</span>
            <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-display text-success">₹{totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden animate-item delay-200 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Expense</span>
            <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center text-danger">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold font-display text-danger">₹{totalExpense.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        
        <div className="glass-card p-6 flex flex-col gap-4 relative overflow-hidden animate-item delay-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Net Balance</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className={`text-2xl font-bold font-display ${(totalIncome - totalExpense) >= 0 ? "text-primary" : "text-danger"}`}>
              ₹{(totalIncome - totalExpense).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-item delay-400">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-11 w-full rounded-xl border border-white/60 shadow-sm bg-white/40 backdrop-blur-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <button type="submit" className="btn-liquid-glass h-11 px-6 text-foreground text-sm font-semibold btn-click-anim">Search</button>
        </form>
        <div className="relative min-w-[140px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="h-11 w-full rounded-xl border border-white/60 shadow-sm bg-white/40 backdrop-blur-md pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card flex flex-col overflow-hidden animate-item delay-400">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground font-medium">Loading transactions...</div>
        ) : !data?.data?.length ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground font-medium">No transactions found.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/20 border-b border-white/40">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wide">Date</th>
                  <th className="px-6 py-4 font-semibold tracking-wide">Description</th>
                  <th className="px-6 py-4 font-semibold tracking-wide text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold tracking-wide text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((tx: any, idx: number) => (
                  <tr key={tx.id} className={`border-b border-white/20 hover:bg-white/40 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-primary/[0.05]'}`}>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                    <td className="px-6 py-4 font-medium text-foreground max-w-xs sm:max-w-md truncate">{tx.description}</td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === "CREDIT" ? "text-success" : "text-danger"}`}>
                      {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${tx.type === "CREDIT" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
                        {tx.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > 50 && (
        <div className="flex items-center justify-between glass-card p-4 animate-item delay-400">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-liquid-glass h-10 px-5 text-foreground text-sm font-semibold disabled:opacity-50 btn-click-anim"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground bg-white/30 px-4 py-2 rounded-lg border border-white/40">
            Page {page} of {Math.ceil(data.total / 50)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / 50)}
            className="btn-liquid-glass h-10 px-5 text-foreground text-sm font-semibold disabled:opacity-50 btn-click-anim"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
