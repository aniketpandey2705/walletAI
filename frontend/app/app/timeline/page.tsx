"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

export default function TimelinePage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"day" | "week" | "month" | "year">("month");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchApi(`/analytics/timeline?view=${view}`);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi, view]);

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border)] pb-8 sticky top-0 bg-[var(--background)]/95 backdrop-blur-sm z-30 pt-4 -mt-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Timeline</h1>
          <p className="text-[14px] text-[var(--secondary-text)]">Chronological transaction history</p>
        </div>
        
        <div className="flex bg-[var(--background)] p-1 rounded-md border border-[var(--border)]">
          {["day", "week", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded capitalize transition-colors ${
                view === v 
                  ? "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-sm" 
                  : "text-[var(--secondary-text)] hover:text-[var(--foreground)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[13px] text-[var(--secondary-text)]">
           Loading timeline...
        </div>
      ) : !data?.events?.length ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border border-dashed border-[var(--border)] rounded-md">
          <h3 className="text-[15px] font-medium text-[var(--foreground)]">No events found</h3>
          <p className="text-[13px] text-[var(--secondary-text)]">Try changing the view period.</p>
        </div>
      ) : (
        <div className="relative mt-4 pl-4 sm:pl-28">
          {/* Main vertical line */}
          <div className="absolute left-[19px] sm:left-[111px] top-0 bottom-0 w-[1px] bg-[var(--border)]" />
          
          <AnimatePresence mode="popLayout">
            {data.events.map((event: any, idx: number) => {
              const date = parseISO(event.date);
              const isCredit = event.event_type === "CREDIT";
              
              return (
                <motion.div
                  key={`${event.date}-${idx}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.03, ease: "easeOut" }}
                  className="relative mb-10 group"
                >
                  <div className="hidden sm:block absolute -left-[120px] top-4 w-[100px] text-right">
                    <div className="text-[13px] font-medium text-[var(--foreground)]">{format(date, "MMM d")}</div>
                    <div className="text-[11px] font-medium text-[var(--secondary-text)]">{format(date, "h:mm a")}</div>
                  </div>

                  <div className={`absolute -left-[5px] top-[18px] w-2.5 h-2.5 rounded-full z-10 transition-transform group-hover:scale-125 ${
                    isCredit ? "bg-[var(--success)]" : "bg-[var(--foreground)]"
                  }`} />
                  
                  <div className="p-5 ml-6 sm:ml-8 border border-[var(--border)] rounded-md hover:bg-[var(--hover)] transition-colors bg-[var(--surface)]">
                    <div className="sm:hidden text-[11px] font-medium text-[var(--secondary-text)] mb-2 uppercase tracking-wider">
                      {format(date, "MMM d, h:mm a")}
                    </div>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[15px] font-medium text-[var(--foreground)]">{event.merchant}</span>
                        <span className="text-[13px] text-[var(--secondary-text)] max-w-xs truncate">{event.title}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-[15px] font-medium mono-num ${isCredit ? "text-[var(--success)]" : "text-[var(--foreground)]"}`}>
                          {isCredit ? "+" : "-"}₹{Number(event.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border)]">
                      <span className="text-[11px] font-medium text-[var(--secondary-text)] uppercase tracking-wider">
                        {event.category}
                      </span>
                      {event.balance !== null && (
                        <span className="text-[12px] font-medium text-[var(--secondary-text)] mono-num">
                          Bal: ₹{Number(event.balance).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
