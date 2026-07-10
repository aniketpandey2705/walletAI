"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

export default function InsightsPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const url = accountId && accountId !== "all"
          ? `/insights?account_id=${accountId}`
          : "/insights";
        const res = await fetchApi(url);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi, accountId]);



  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex flex-col gap-2 border-b border-[var(--border)] pb-8">
        <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Insights</h1>
        <span className="text-sm text-[var(--secondary-text)]">Observations and recommendations based on your recent activity.</span>
      </div>

      <div className="flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-[13px] text-muted-foreground">
            Loading insights...
          </div>
        ) : (
          <div className="flex flex-col gap-0 border-t border-[var(--border)]">
            {data && data.length > 0 ? data.map((insight: any) => (
              <div
                key={insight.id}
                className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors group"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--secondary-text)] mb-1">
                    {insight.insight_type}
                  </span>
                  <h3 className="text-[15px] font-medium text-[var(--foreground)] tracking-tight">{insight.title}</h3>
                  <p className="text-[14px] text-[var(--secondary-text)] leading-relaxed max-w-2xl">
                    {insight.body}
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0 flex-shrink-0">
                  <button className="btn-ghost opacity-0 group-hover:opacity-100 focus:opacity-100">
                    Review
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-[13px] text-[var(--secondary-text)]">
                No insights found for the selected view.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
