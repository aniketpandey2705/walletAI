"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Activity, AlertCircle, CheckCircle2, HelpCircle, Download, Filter } from "lucide-react";
import { TransactionDetailsModal } from "@/components/transactions/TransactionDetailsModal";

export default function TransactionsPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Modal state
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

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

  useEffect(() => { 
    fetchTransactions(); 
    fetchApi("/categories").then(res => setCategories(res.data || res)).catch(console.error);
  }, [page, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleUpdateTransaction = async (merchantName: string, categoryId: string) => {
    if (!selectedTx) return;
    try {
      await fetchApi(`/transactions/${selectedTx.id}`, {
        method: "PUT",
        body: JSON.stringify({
          merchant_name: merchantName,
          category_id: categoryId
        })
      });
      // Refresh transactions
      await fetchTransactions();
      // Close modal after update
      setSelectedTx(null);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const totalIncome = data?.data?.filter((t: any) => t.type === "CREDIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;
  const totalExpense = data?.data?.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-between animate-item">
        <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Transactions </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">{data?.total ?? 0} total</span>
          <button className="btn-liquid-glass px-4 py-2 text-sm font-semibold text-foreground btn-click-anim flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
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
              <Activity className="w-4 h-4" />
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
            placeholder="Search transactions..."
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
                  <th className="px-6 py-4 font-semibold tracking-wide">Intelligence</th>
                  <th className="px-6 py-4 font-semibold tracking-wide text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((tx: any, idx: number) => {
                  const confidenceColor = tx.ai_confidence && tx.ai_confidence > 80 ? "bg-success/20 text-success" : (tx.ai_confidence && tx.ai_confidence > 40 ? "bg-accent/20 text-accent-foreground text-accent" : "bg-danger/20 text-danger");
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => {
                        setSelectedTx(tx);
                      }}
                      className={`border-b border-white/20 hover:bg-white/60 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-transparent' : 'bg-primary/[0.03]'}`}
                    >
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{tx.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground max-w-xs sm:max-w-md truncate">{tx.merchant_name || tx.description}</span>
                          {tx.merchant_name && <span className="text-xs text-muted-foreground truncate">{tx.description}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 w-fit">
                            {tx.category_name || "Uncategorized"}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {tx.ai_confidence >= 95 || tx.category_source === "user" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-success/20 text-success border border-success/20">
                                <CheckCircle2 className="w-3 h-3" /> High Confidence
                              </span>
                            ) : tx.ai_confidence >= 70 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-accent/20 text-accent border border-accent/20">
                                <AlertCircle className="w-3 h-3" /> Medium Confidence
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-danger/20 text-danger border border-danger/20">
                                <HelpCircle className="w-3 h-3" /> Unknown
                              </span>
                            )}
                            <span className="text-[10px] font-medium text-muted-foreground">
                              ({tx.category_source === 'user' ? 'User Corrected' : tx.category_source === 'memory' ? 'Financial Memory' : 'LLM'})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === "CREDIT" ? "text-success" : "text-danger"}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )
                })}
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
            <ChevronLeft className="w-4 h-4 mr-1 inline" /> Previous
          </button>
          <span className="text-sm font-medium text-muted-foreground bg-white/30 px-4 py-2 rounded-lg border border-white/40">
            Page {page} of {Math.ceil(data.total / 50)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / 50)}
            className="btn-liquid-glass h-10 px-5 text-foreground text-sm font-semibold disabled:opacity-50 btn-click-anim"
          >
            Next <ChevronRight className="w-4 h-4 ml-1 inline" />
          </button>
        </div>
      )}

      <TransactionDetailsModal
        open={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx}
        categories={categories}
        onSave={handleUpdateTransaction}
      />
    </div>
  );
}
