"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

export default function MonthlyJourneyPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchApi(`/analytics/monthly-journey?month=${date.getMonth() + 1}&year=${date.getFullYear()}`);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi, date]);

  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    // Don't go beyond current month
    if (newDate <= new Date()) {
      setDate(newDate);
    }
  };

  const getEventIcon = (type: string) => {
    if (type.includes("Salary") || type.includes("Income")) return null;
    if (type.includes("Purchase") || type.includes("Spending")) return null;
    if (type.includes("Subscription")) return null;
    return null;
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full relative pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-item">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
            
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Monthly Journey</h1>
        </div>
        
        <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm">
          <button 
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/60 transition-colors"
          >
            
          </button>
          <div className="flex items-center gap-2 px-4 py-1">
            
            <span className="font-bold text-foreground min-w-[100px] text-center">
              {format(date, "MMMM yyyy")}
            </span>
          </div>
          <button 
            onClick={handleNextMonth}
            disabled={date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/60 transition-colors disabled:opacity-30"
          >
            
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground font-medium">
           <div className="w-12 h-12 border-4 border-success/30 border-t-success rounded-full animate-spin"></div>
        </div>
      ) : !data?.events?.length ? (
        <div className="glass-card flex flex-col items-center justify-center h-64 gap-4 animate-item text-center p-8">
          
          <h3 className="text-xl font-bold font-display">No journey data</h3>
          <p className="text-muted-foreground">We couldn't find enough significant transactions in {format(date, "MMMM yyyy")} to tell a story.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Journey Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl bg-gradient-to-br from-success/5 to-primary/5 border border-white/60"
          >
             <h2 className="text-2xl font-bold font-display text-foreground">Your {format(date, "MMMM")} Story</h2>
             <p className="text-muted-foreground mt-2 leading-relaxed">
               Every month tells a unique financial story. Here are the key milestones and events that shaped your spending and saving this month.
             </p>
          </motion.div>

          {/* Timeline Cards */}
          <div className="relative mt-4">
            <AnimatePresence mode="wait">
              {data.events.map((event: any, idx: number) => {
                const isEven = idx % 2 === 0;
                
                return (
                  <motion.div
                    key={`${event.date}-${idx}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.15, ease: "easeOut" }}
                    className="relative flex items-center mb-8"
                  >
                    {/* Storytelling Card */}
                    <div className="w-full relative z-10">
                      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center gap-6 group hover:-translate-y-1 transition-transform bg-white/70">
                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-white border border-white flex items-center justify-center shadow-sm">
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="flex flex-col flex-1 gap-1">
                          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{event.type}</span>
                          <h3 className="text-xl font-bold font-display text-foreground">{event.merchant}</h3>
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                             
                             {format(parseISO(event.date), "MMMM do, yyyy")}
                          </span>
                        </div>
                        
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 mt-4 sm:mt-0">
                          <span className="text-3xl font-black font-display text-foreground tracking-tight">
                            ₹{Number(event.amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
