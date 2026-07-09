"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function TransactionsPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Drawer state
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [merchantInput, setMerchantInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleUpdateTransaction = async () => {
    if (!selectedTx) return;
    setIsUpdating(true);
    try {
      await fetchApi(`/transactions/${selectedTx.id}`, {
        method: "PUT",
        body: JSON.stringify({
          merchant_name: merchantInput,
          category_name: categoryInput,
          // user correction forces high confidence and overrides AI
          ai_confidence: 100 
        })
      });
      // Refresh transactions
      await fetchTransactions();
      setEditMode(false);
      // Close drawer after update
      setSelectedTx(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalIncome = data?.data?.filter((t: any) => t.type === "CREDIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;
  const totalExpense = data?.data?.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full relative">
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
                        setMerchantInput(tx.merchant_name || "");
                        setCategoryInput(tx.category_name || "");
                        setEditMode(false);
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
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            {tx.category_name || "Uncategorized"}
                          </span>
                          {tx.ai_confidence && (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10 ${confidenceColor}`}>
                              {tx.ai_confidence}% AI
                            </span>
                          )}
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

      {/* Transaction Details Drawer / Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white/80 backdrop-blur-[50px] border-l border-white/50 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] p-6 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold font-display text-foreground">Transaction Details</h2>
                  <p className="text-sm text-muted-foreground">{selectedTx.date}</p>
                </div>
                <button onClick={() => setSelectedTx(null)} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                  
                </button>
              </div>

              <div className="flex justify-center py-6 mb-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-white/60 shadow-inner">
                <span className={`text-4xl font-black font-display tracking-tight ${selectedTx.type === "CREDIT" ? "text-success" : "text-foreground"}`}>
                  {selectedTx.type === "CREDIT" ? "+" : "-"}₹{Number(selectedTx.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw Description</span>
                  <span className="font-medium text-foreground bg-white/40 p-3 rounded-xl border border-white/50 break-all">{selectedTx.description}</span>
                </div>

                {!editMode ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-end">
                         <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Identification</span>
                         <button onClick={() => setEditMode(true)} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                            Correct AI
                         </button>
                      </div>
                      <div className="bg-white/40 p-4 rounded-xl border border-white/50 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Merchant</span>
                          <span className="font-semibold text-foreground">{selectedTx.merchant_name || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Category</span>
                          <span className="font-semibold text-foreground">{selectedTx.category_name || "Uncategorized"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Confidence</span>
                          <span className="font-semibold text-foreground">{selectedTx.ai_confidence ? `${selectedTx.ai_confidence}%` : "Manual"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
                      
                      <p className="text-xs text-blue-800 leading-relaxed">
                        If the AI misidentified this transaction, you can correct it. Your corrections will train the system to automatically recognize similar transactions in the future.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-4 bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <h3 className="text-sm font-bold text-primary">Train the AI</h3>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-foreground">Merchant Name</label>
                      <input 
                        type="text" 
                        value={merchantInput}
                        onChange={(e) => setMerchantInput(e.target.value)}
                        className="h-10 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-foreground">Category</label>
                      <input 
                        type="text" 
                        value={categoryInput}
                        onChange={(e) => setCategoryInput(e.target.value)}
                        className="h-10 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button 
                        onClick={handleUpdateTransaction}
                        disabled={isUpdating}
                        className="flex-1 btn-liquid-glass bg-primary/90 text-white hover:bg-primary font-semibold py-2 rounded-lg text-sm"
                      >
                        {isUpdating ? "Saving..." : "Save Correction"}
                      </button>
                      <button 
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-black/5 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
