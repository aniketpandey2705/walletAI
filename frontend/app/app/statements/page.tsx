"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { format } from "date-fns";

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
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-between animate-item">
        <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Statements</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">{statements.length} total</span>
        </div>
      </div>

      <div className="glass-card flex flex-col overflow-hidden animate-item delay-200">
        <div className="p-6 border-b border-white/40 bg-white/10 flex justify-between items-center">
          <h3 className="text-lg font-semibold font-display text-foreground">Processing History</h3>
          <button onClick={loadStatements} className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-black/5">
            
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground font-medium">Loading statements...</div>
        ) : statements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            
            <p className="font-medium">No statements uploaded yet.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-white/20 border-b border-white/40">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wide">ID</th>
                  <th className="px-6 py-4 font-semibold tracking-wide">Bank</th>
                  <th className="px-6 py-4 font-semibold tracking-wide">Date Uploaded</th>
                  <th className="px-6 py-4 font-semibold tracking-wide text-center">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wide text-center">Progress</th>
                  <th className="px-6 py-4 font-semibold tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((stmt: any, idx: number) => {
                  const isCompleted = stmt.status === "COMPLETED";
                  const isFailed = stmt.status === "FAILED";
                  
                  return (
                    <tr key={stmt.id} className={`border-b border-white/20 hover:bg-white/40 transition-colors ${idx % 2 === 0 ? 'bg-transparent' : 'bg-primary/[0.03]'}`}>
                      <td className="px-6 py-4 font-medium text-muted-foreground whitespace-nowrap text-xs font-mono">{stmt.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap capitalize">{stmt.bank_slug}</td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {stmt.created_at ? format(new Date(stmt.created_at), "MMM d, yyyy HH:mm") : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          {isCompleted ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                               Done
                            </span>
                          ) : isFailed ? (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20">
                               Failed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                               Processing
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap font-medium">
                        {stmt.progress}%
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-3">
                          {isCompleted && (
                            <button className="text-muted-foreground hover:text-primary transition-colors tooltip-trigger relative group">
                              
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Download CSV
                              </span>
                            </button>
                          )}
                          <button className="text-muted-foreground hover:text-danger transition-colors tooltip-trigger relative group">
                            
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
