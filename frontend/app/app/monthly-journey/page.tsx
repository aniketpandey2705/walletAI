"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthlyJourneyPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const url = accountId && accountId !== "all"
          ? `/analytics/monthly-journey?month=${month}&year=${year}&account_id=${accountId}`
          : `/analytics/monthly-journey?month=${month}&year=${year}`;
        const res = await fetchApi(url);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi, date, accountId]);

  const handlePrevMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    if (newDate <= new Date()) {
      setDate(newDate);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border)] pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Monthly Journey</h1>
          <span className="text-[14px] text-[var(--secondary-text)]">The story of your spending</span>
        </div>
        
        <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-md border border-[var(--border)]">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md hover:bg-[var(--hover)] transition-colors text-[var(--secondary-text)] hover:text-[var(--foreground)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center min-w-[120px] px-2">
            <span className="text-[13px] font-medium text-[var(--foreground)] mono-num">
              {format(date, "MMMM yyyy")}
            </span>
          </div>
          <button 
            onClick={handleNextMonth}
            disabled={date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear()}
            className="p-1.5 rounded-md hover:bg-[var(--hover)] transition-colors text-[var(--secondary-text)] hover:text-[var(--foreground)] disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[13px] text-[var(--secondary-text)]">
           Loading journey...
        </div>
      ) : !data?.events?.length ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border border-dashed border-[var(--border)] rounded-md">
          <h3 className="text-[15px] font-medium text-[var(--foreground)]">No journey data</h3>
          <p className="text-[13px] text-[var(--secondary-text)]">We couldn't find enough significant transactions in {format(date, "MMMM yyyy")} to tell a story.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
             <h2 className="text-[18px] font-medium text-[var(--foreground)]">Your month in review</h2>
             <p className="text-[13px] text-[var(--secondary-text)] leading-relaxed">
               Here's a look at the major milestones and events that shaped your spending and saving in {format(date, "MMMM")}.
             </p>
          </motion.div>

          <div className="flex flex-col gap-8">
            <AnimatePresence mode="wait">
              {data.events.map((event: any, idx: number) => {
                return (
                  <motion.div
                    key={`${event.date}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1, ease: "easeOut" }}
                    className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 border border-[var(--border)] rounded-md hover:bg-[var(--hover)] transition-colors"
                  >
                    <div className="flex flex-col flex-1 gap-1">
                      <span className="text-[11px] font-medium text-[var(--secondary-text)] uppercase tracking-wider">{event.type}</span>
                      <h3 className="text-[16px] font-medium text-[var(--foreground)]">{event.merchant}</h3>
                      <span className="text-[13px] text-[var(--secondary-text)] mono-num">
                         {format(parseISO(event.date), "MMMM do, yyyy")}
                      </span>
                    </div>
                    
                    <div className="flex items-center sm:justify-end mt-2 sm:mt-0">
                      <span className="text-[20px] font-medium text-[var(--foreground)] tracking-tight mono-num">
                        ₹{Number(event.amount).toLocaleString("en-IN")}
                      </span>
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
