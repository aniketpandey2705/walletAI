"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";

export default function InsightsPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
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

  const insights = [
    {
      id: 1,
      type: "warning",
      title: "High Travel Expenses",
      description: "You spent 25% more on travel this month compared to your usual average.",
    },
    {
      id: 2,
      type: "achievement",
      title: "Savings Goal Hit!",
      description: "You successfully saved over ₹5000 this month. Great discipline!",
    },
    {
      id: 3,
      type: "recommendation",
      title: "Optimization Opportunity",
      description: "Transferring ₹1000 from checking to a high-yield fixed deposit could earn you better interest.",
    },
    {
      id: 4,
      type: "subscription",
      title: "New Subscription Detected",
      description: "A recurring charge for 'Netflix' (₹499) was detected. Ensure you are actually using this service.",
    },
    {
      id: 5,
      type: "prediction",
      title: "End of Month Projection",
      description: "Based on your current run rate, you will likely end the month with ₹1200 in disposable income.",
    }
  ];

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8">
        <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Insights</h1>
        <span className="text-sm text-[var(--secondary-text)]">Smart financial analysis tailored just for you.</span>
      </div>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-[13px] text-muted-foreground">
            Loading insights...
          </div>
        ) : (
          <div className="flex flex-col gap-0 border-t border-[var(--border)]">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors group"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--secondary-text)] mb-1">
                    {insight.type}
                  </span>
                  <h3 className="text-[15px] font-medium text-[var(--foreground)] tracking-tight">{insight.title}</h3>
                  <p className="text-[14px] text-[var(--secondary-text)] leading-relaxed max-w-2xl">
                    {insight.description}
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex-shrink-0">
                  <button className="btn-secondary opacity-0 group-hover:opacity-100 focus:opacity-100">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
