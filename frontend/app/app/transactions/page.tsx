"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { Search, Download, Filter } from "lucide-react";
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
      await fetchTransactions();
      setSelectedTx(null);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const totalIncome = data?.data?.filter((t: any) => t.type === "CREDIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;
  const totalExpense = data?.data?.filter((t: any) => t.type === "DEBIT").reduce((s: number, t: any) => s + parseFloat(t.amount), 0) ?? 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[28px] font-medium text-foreground tracking-tight leading-none mb-2">Transactions</h1>
          <span className="text-sm text-muted-foreground">{data?.total ?? 0} entries</span>
        </div>
        <button className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-sm font-medium">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="flex gap-12 border-b border-[var(--border)] pb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-medium text-[var(--secondary-text)]">Income</span>
          <span className="text-xl font-medium text-[var(--foreground)]">
            ₹{totalIncome.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-medium text-[var(--secondary-text)]">Expense</span>
          <span className="text-xl font-medium text-[var(--foreground)]">
            ₹{totalExpense.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wider font-medium text-[var(--secondary-text)]">Net</span>
          <span className="text-xl font-medium text-[var(--foreground)]">
            ₹{(totalIncome - totalExpense).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-9 pr-4"
          />
        </form>
        <div className="relative min-w-[140px]">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="input-base pl-3 pr-8 appearance-none cursor-pointer"
          >
            <option value="">All Types</option>
            <option value="CREDIT">Income</option>
            <option value="DEBIT">Expense</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)] pointer-events-none">
            <Filter className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading...</div>
        ) : !data?.data?.length ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">No transactions found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] w-32">Date</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Transaction</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] w-48">Category</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((tx: any) => {
                let confIndicator = "• Low";
                if (tx.ai_confidence >= 95 || tx.category_source === "user") confIndicator = "••• High";
                else if (tx.ai_confidence >= 70) confIndicator = "•• Medium";

                return (
                  <tr 
                    key={tx.id} 
                    onClick={() => setSelectedTx(tx)}
                    className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors cursor-pointer group relative bg-[var(--surface)]"
                  >
                    <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] whitespace-nowrap tabular-nums">
                      <div className="hidden group-active:block absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--primary)]" />
                      {tx.date}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-medium text-[var(--foreground)]">{tx.merchant_name || tx.description}</span>
                        {tx.merchant_name && <span className="text-[13px] text-[var(--secondary-text)] truncate max-w-sm">{tx.description}</span>}
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] text-[var(--foreground)]">
                          {tx.category_name || "Uncategorized"}
                        </span>
                        <span className="text-[11px] text-[var(--muted-text)] opacity-0 group-hover:opacity-100 transition-opacity">
                          {confIndicator}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 text-right whitespace-nowrap">
                      <span className={`text-[15px] tabular-nums font-medium ${tx.type === "CREDIT" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > 50 && (
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost"
          >
            Previous
          </button>
          <span className="text-[13px] text-[var(--secondary-text)]">
            {page} / {Math.ceil(data.total / 50)}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(data.total / 50)}
            className="btn-ghost"
          >
            Next
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
