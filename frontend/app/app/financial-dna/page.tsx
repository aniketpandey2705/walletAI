"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { Dna, ShieldCheck, HelpCircle } from "lucide-react";
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

  const getTraitColor = (confidence: number) => {
    if (confidence >= 90) return "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-600";
    if (confidence >= 70) return "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-600";
    return "from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-600";
  };

  const getTraitBgColor = (confidence: number) => {
    if (confidence >= 90) return "bg-purple-500/10";
    if (confidence >= 70) return "bg-blue-500/10";
    return "bg-orange-500/10";
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full relative pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-item">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Dna className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black font-display text-foreground tracking-tight">Your Financial DNA</h1>
          </div>
          <p className="text-muted-foreground ml-15 max-w-lg">
            AI-generated behavioral traits based on your spending patterns. Discover your financial personality.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground font-medium">
           <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : !data?.traits?.length ? (
        <div className="glass-card flex flex-col items-center justify-center h-64 gap-4 animate-item text-center p-8">
          <Dna className="w-16 h-16 opacity-20 text-purple-600" />
          <h3 className="text-xl font-bold font-display">No traits discovered yet</h3>
          <p className="text-muted-foreground">Upload more statements to allow the AI to build your complete financial profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {data.traits.map((trait: any, idx: number) => {
              const colorClasses = getTraitColor(trait.confidence);
              const bgClass = getTraitBgColor(trait.confidence);
              const isActive = activeTrait === idx;

              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                  onClick={() => setActiveTrait(isActive ? null : idx)}
                  className={`cursor-pointer overflow-hidden rounded-[24px] border ${isActive ? 'bg-white/90 shadow-xl' : 'glass-card hover:bg-white/60 hover:-translate-y-1'} transition-all`}
                  style={{
                    boxShadow: isActive ? "0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)" : undefined
                  }}
                >
                  <div className={`p-6 bg-gradient-to-br ${colorClasses} border-b relative overflow-hidden`}>
                    {/* Background decoration */}
                    <Dna className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-45" />
                    
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Trait Detected</span>
                        <h3 className="text-2xl font-black font-display tracking-tight text-foreground">{trait.trait}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className={`w-5 h-5 ${trait.confidence >= 90 ? 'text-success' : 'text-accent'}`} />
                        <span className="text-sm font-semibold text-foreground">{trait.confidence}% Confidence</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${bgClass}`}>
                         Score: {trait.score}/100
                      </div>
                    </div>

                    <motion.div 
                      initial={false}
                      animate={{ height: isActive ? 'auto' : '60px' }}
                      className="relative overflow-hidden"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {trait.reason}
                      </p>
                      {!isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent backdrop-blur-[1px]" />
                      )}
                    </motion.div>
                    
                    <div className="pt-2 flex justify-end">
                      <span className="text-xs font-medium text-primary flex items-center gap-1">
                        {isActive ? "Show Less" : "Read More"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-8 glass-card p-6 flex items-start gap-4 animate-item delay-500 bg-primary/5 border-primary/20">
        <HelpCircle className="w-6 h-6 text-primary shrink-0" />
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-bold text-foreground">How does Financial DNA work?</h4>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Our deterministic AI engine analyzes your spending patterns across multiple dimensions (time, categories, merchants, and frequency) to identify distinct financial behaviors. These traits are strictly data-driven and update automatically as you upload new statements.
          </p>
        </div>
      </div>
    </div>
  );
}
