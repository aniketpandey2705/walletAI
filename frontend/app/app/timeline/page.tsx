"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { Clock, Filter, ChevronDown, CalendarDays } from "lucide-react";
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
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-item sticky top-0 z-30 pt-2 pb-4 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Clock className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Timeline</h1>
        </div>
        
        <div className="flex bg-white/40 backdrop-blur-md p-1 rounded-xl border border-white/60 shadow-sm">
          {["day", "week", "month", "year"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                view === v 
                  ? "bg-white text-foreground shadow-sm shadow-black/5" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground font-medium">
           <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
        </div>
      ) : !data?.events?.length ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
          <CalendarDays className="w-12 h-12 opacity-20" />
          <p className="font-medium">No events found for this view.</p>
        </div>
      ) : (
        <div className="relative mt-8 pl-8 sm:pl-32">
          {/* Main vertical line */}
          <div className="absolute left-[27px] sm:left-[111px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent/50 via-primary/20 to-transparent" />
          
          <AnimatePresence mode="popLayout">
            {data.events.map((event: any, idx: number) => {
              const date = parseISO(event.date);
              const isCredit = event.event_type === "CREDIT";
              
              return (
                <motion.div
                  key={`${event.date}-${idx}`}
                  initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  className="relative mb-12 group"
                >
                  {/* Left Date Label (visible on larger screens) */}
                  <div className="hidden sm:block absolute -left-[120px] top-4 w-[100px] text-right">
                    <div className="text-sm font-bold text-foreground">{format(date, "MMM d")}</div>
                    <div className="text-xs font-medium text-muted-foreground">{format(date, "h:mm a")}</div>
                  </div>

                  {/* Node Dot */}
                  <div className={`absolute -left-[17px] top-5 w-4 h-4 rounded-full border-2 border-background z-10 transition-transform group-hover:scale-125 ${
                    isCredit ? "bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-accent shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  }`} />
                  
                  {/* Content Card */}
                  <div className="glass-card p-5 ml-6 sm:ml-8 relative overflow-hidden hover:bg-white/60 transition-colors">
                    {/* Small date label for mobile */}
                    <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-2">
                      {format(date, "MMM d, h:mm a")}
                    </div>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold font-display text-foreground leading-tight">{event.merchant}</span>
                        <span className="text-sm font-medium text-muted-foreground mt-0.5 max-w-sm truncate">{event.title}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-xl font-bold font-display ${isCredit ? "text-success" : "text-foreground"}`}>
                          {isCredit ? "+" : "-"}₹{Number(event.amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/30">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isCredit ? "bg-success/10 text-success" : "bg-accent/10 text-accent-foreground text-accent"}`}>
                        {event.category}
                      </span>
                      {event.balance !== null && (
                        <span className="text-xs font-mono font-medium text-muted-foreground bg-white/40 px-2 py-1 rounded">
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
