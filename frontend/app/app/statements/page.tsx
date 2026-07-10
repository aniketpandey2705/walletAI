"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { format } from "date-fns";
import { Download, Trash2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAccounts } from "@/lib/hooks/useAccounts";

export default function StatementsPage() {
  const { fetchApi } = useApi();
  const [statements, setStatements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: accounts } = useAccounts();

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
                    <td className="px-2 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] text-[var(--foreground)] capitalize">{stmt.bank_slug}</span>
                        {stmt.account_id && (
                          <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm self-start">
                            {accounts?.find(a => a.id === stmt.account_id)?.display_name || 'Account'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-4 text-[13px] text-[var(--secondary-text)] tabular-nums">
                      {stmt.created_at ? format(new Date(stmt.created_at), "MMM d, yyyy HH:mm") : "-"}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`text-[13px] font-medium ${isCompleted ? 'text-[var(--success)]' : isFailed ? 'text-[var(--danger)]' : 'text-[var(--foreground)]'}`}>
                          {isCompleted ? 'Completed' : isFailed ? 'Failed' : 'Processing'}
                        </span>
                        
                        {isCompleted && (
                          <div className="flex flex-col gap-1 items-center">
                            {stmt.reconciliation_pass === true ? (
                              <span className="flex items-center text-[10px] text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Reconciled
                              </span>
                            ) : stmt.reconciliation_pass === false ? (
                              <span className="flex items-center text-[10px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                <AlertTriangle className="w-3 h-3 mr-1" /> Discrepancy
                              </span>
                            ) : null}

                            {stmt.continuity_warning && (
                              <div className="group/tooltip relative flex justify-center">
                                <span className="flex items-center text-[10px] text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full whitespace-nowrap cursor-help">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Continuity Gap
                                </span>
                                <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-48 p-2 bg-background border rounded-md shadow-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-opacity z-10 text-xs text-left">
                                  <p className="font-medium text-orange-500 mb-1">Balance Mismatch</p>
                                  <p className="text-muted-foreground flex justify-between">Expected: <span>₹{stmt.continuity_warning.expected_opening}</span></p>
                                  <p className="text-muted-foreground flex justify-between">Actual: <span>₹{stmt.continuity_warning.actual_opening}</span></p>
                                  <p className="text-muted-foreground flex justify-between">Gap: <span>{stmt.continuity_warning.gap_days} days</span></p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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
