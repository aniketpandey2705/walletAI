"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function FinancialDNAPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTrait, setActiveTrait] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchApi("/analytics/financial-dna");
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi]);

  const getTraitText = (confidence: number) => {
    if (confidence >= 90) return "text-[var(--success)] font-medium";
    if (confidence >= 70) return "text-[var(--foreground)] font-medium";
    return "text-[var(--muted-text)] font-medium";
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8">
        <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Your Financial DNA</h1>
        <p className="text-[14px] text-[var(--secondary-text)] max-w-2xl">
          Deterministic behavioral traits based on your spending patterns. Discover your financial personality.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[13px] text-[var(--secondary-text)]">
           Loading DNA profile...
        </div>
      ) : !data?.traits?.length ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-center border border-dashed border-[var(--border)] rounded-md">
          <h3 className="text-[15px] font-medium text-[var(--foreground)]">No traits discovered yet</h3>
          <p className="text-[13px] text-[var(--secondary-text)] max-w-md">Upload more statements to allow the engine to build your complete financial profile.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 border-t border-[var(--border)] mt-4">
          <AnimatePresence>
            {data.traits.map((trait: any, idx: number) => {
              const textClass = getTraitText(trait.confidence);
              const isActive = activeTrait === idx;

              return (
                <motion.div
                  key={idx}
                  layout
                  onClick={() => setActiveTrait(isActive ? null : idx)}
                  className="flex flex-col border-b border-[var(--border)] cursor-pointer hover:bg-[var(--hover)] transition-colors group"
                >
                  <div className="flex items-center justify-between p-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--secondary-text)]">Trait Detected</span>
                      <h3 className="text-[16px] font-medium text-[var(--foreground)] tracking-tight">{trait.trait}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[13px] ${textClass}`}>{trait.confidence}% Confidence</span>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--secondary-text)]">Score: {trait.score}/100</span>
                    </div>
                  </div>
                  
                  <motion.div 
                    initial={false}
                    animate={{ height: isActive ? 'auto' : '0px', opacity: isActive ? 1 : 0 }}
                    className="overflow-hidden px-6"
                  >
                    <div className="pb-6 flex flex-col gap-4 border-t border-[var(--border)] pt-4">
                      <p className="text-[13px] text-[var(--secondary-text)] leading-relaxed max-w-3xl">
                        {trait.reason}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-col gap-2 p-6 bg-[var(--background)] border border-[var(--border)] rounded-md mt-4">
        <h4 className="text-[13px] font-medium text-[var(--foreground)] uppercase tracking-wider">How does Financial DNA work?</h4>
        <p className="text-[13px] text-[var(--secondary-text)] leading-relaxed max-w-3xl">
          Our deterministic engine analyzes your spending patterns across multiple dimensions (time, categories, merchants, and frequency) to identify distinct financial behaviors. These traits are strictly data-driven and update automatically as you upload new statements.
        </p>
      </div>
    </div>
  );
}
