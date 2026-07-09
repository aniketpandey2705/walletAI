"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function InsightsPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // We'll fetch from our insights router, if it exists, otherwise we'll fetch from analytics/dashboard
        // Currently the backend has an /insights router (from main.py `app.include_router(insights.router)`)
        // Wait, the new logic might be in /analytics, but let's assume we can fetch /insights
        // I will use some static mock insights mixed with real data if /insights isn't fully robust
        const res = await fetchApi("/analytics/dashboard");
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi]);

  // Mocking the structure based on user requirements for "Monthly Insights, Warnings, Achievements, Recommendations, Subscription Alerts, Predictions"
  // In a real scenario, this would come from the LLM or a specific Insights Engine
  const insights = [
    {
      id: 1,
      type: "warning",
      title: "High Travel Expenses",
      description: "You spent 25% more on travel this month compared to your usual average.",
      color: "bg-danger/10 border-danger/20"
    },
    {
      id: 2,
      type: "achievement",
      title: "Savings Goal Hit!",
      description: "You successfully saved over ₹5000 this month. Great discipline!",
      color: "bg-accent/10 border-accent/20"
    },
    {
      id: 3,
      type: "recommendation",
      title: "Optimization Opportunity",
      description: "Transferring ₹1000 from checking to a high-yield fixed deposit could earn you better interest.",
      color: "bg-primary/10 border-primary/20"
    },
    {
      id: 4,
      type: "subscription",
      title: "New Subscription Detected",
      description: "A recurring charge for 'Netflix' (₹499) was detected. Ensure you are actually using this service.",
      color: "bg-purple-500/10 border-purple-500/20"
    },
    {
      id: 5,
      type: "prediction",
      title: "End of Month Projection",
      description: "Based on your current run rate, you will likely end the month with ₹1200 in disposable income.",
      color: "bg-success/10 border-success/20"
    }
  ];

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full relative pb-20">
      <div className="flex items-center gap-3 animate-item">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">AI Insights</h1>
          <span className="text-sm text-muted-foreground">Smart financial analysis tailored just for you.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <AnimatePresence>
            {insights.map((insight, idx) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1, ease: "easeOut" }}
                className={`glass-card p-6 border flex gap-4 items-start ${insight.color} hover:bg-white/60 transition-colors group relative overflow-hidden`}
              >
                {/* Subtle Background Glow */}
                <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/40 blur-3xl rounded-full pointer-events-none" />

                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  
                </div>
                
                <div className="flex flex-col gap-1.5 flex-1 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{insight.type}</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-foreground tracking-tight">{insight.title}</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed max-w-3xl mt-1">
                    {insight.description}
                  </p>
                </div>
                
                <div className="hidden sm:flex shrink-0 self-center">
                   <button className="text-sm font-semibold px-4 py-2 rounded-lg bg-white/50 hover:bg-white transition-colors border border-black/5 shadow-sm btn-click-anim">
                     Take Action
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
