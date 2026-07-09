"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { format } from "date-fns";
import { Download, Trash2, RefreshCw } from "lucide-react";

export default function StatementsPage() {
  const { fetchApi } = useApi();
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatements = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/jobs");
      setStatements(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatements();
  }, [fetchApi]);

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
        <div>
          <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none mb-2">Statements</h1>
          <span className="text-sm text-[var(--secondary-text)]">{statements.length} processing records</span>
        </div>
        <button 
          onClick={loadStatements} 
          className="btn-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Loading records...</div>
        ) : statements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-[13px] text-muted-foreground">
            No statements uploaded yet.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] w-32">Job ID</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Bank</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)]">Uploaded</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] text-center">Status</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] text-center w-24">Progress</th>
                <th className="px-2 py-3 text-[11px] uppercase tracking-wider font-medium text-[var(--secondary-text)] text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((stmt: any) => {
                const isCompleted = stmt.status === "COMPLETED";
                const isFailed = stmt.status === "FAILED";
                
                return (
                  <tr key={stmt.id} className="border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors group">
                    <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] font-mono">{stmt.id.substring(0, 8)}</td>
                    <td className="px-2 py-4 text-[13px] text-[var(--foreground)] capitalize">{stmt.bank_slug}</td>
                    <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] tabular-nums">
                      {stmt.created_at ? format(new Date(stmt.created_at), "MMM d, yyyy HH:mm") : "-"}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <span className={`text-[13px] font-medium ${isCompleted ? 'text-[var(--success)]' : isFailed ? 'text-[var(--danger)]' : 'text-[var(--foreground)]'}`}>
                        {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Processing'}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] text-center tabular-nums">
                      {stmt.progress}%
                    </td>
                    <td className="px-2 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isCompleted && (
                          <button className="p-1.5 text-[var(--secondary-text)] hover:bg-[var(--hover)] hover:text-[var(--foreground)] rounded-md transition-colors" aria-label="Download CSV">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 text-[var(--secondary-text)] hover:bg-[var(--hover)] hover:text-[var(--danger)] rounded-md transition-colors" aria-label="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
