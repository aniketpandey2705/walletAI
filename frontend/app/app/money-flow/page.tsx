"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from "recharts";

export default function MoneyFlowPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const accountId = searchParams.get("account");

  useEffect(() => {
    async function load() {
      try {
        const url = accountId && accountId !== "all"
          ? `/analytics/money-flow?account_id=${accountId}`
          : "/analytics/money-flow";
        const res = await fetchApi(url);
        if (res && res.nodes && res.links) {
          const nodeMap = new Map();
          res.nodes.forEach((n: any, idx: number) => nodeMap.set(n.id, idx));
          
          const formattedNodes = res.nodes.map((n: any) => ({ name: n.id, value: n.value }));
          const formattedLinks = res.links.map((l: any) => ({
            source: nodeMap.has(l.source) ? nodeMap.get(l.source) : -1,
            target: nodeMap.has(l.target) ? nodeMap.get(l.target) : -1,
            value: l.value
          })).filter((l: any) => l.source !== -1 && l.target !== -1 && l.value > 0);

          const allTargets = new Set(res.links.map((l: any) => l.target));
          allTargets.forEach(t => {
            if (!nodeMap.has(t)) {
              formattedNodes.push({ name: t, value: 0 });
              nodeMap.set(t, formattedNodes.length - 1);
            }
          });

          const finalLinks = res.links.map((l: any) => ({
            source: nodeMap.get(l.source),
            target: nodeMap.get(l.target),
            value: l.value
          })).filter((l: any) => l.value > 0);

          if (finalLinks.length > 0) {
            setData({ nodes: formattedNodes, links: finalLinks });
          } else {
            setData(null);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchApi, accountId]);

  const CustomNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
    const isOut = x + width + 6 > containerWidth;
    return (
      <Layer key={`CustomNode${index}`}>
        <Rectangle x={x} y={y} width={width} height={height} fill="#111111" fillOpacity="0.8" radius={2} />
        <foreignObject x={isOut ? x - 150 : x + width + 6} y={y - 5} width="150" height="20">
          <span className="text-[12px] font-medium text-[var(--foreground)]">
            {payload.name} (<span className="mono-num">₹{payload.value.toLocaleString()}</span>)
          </span>
        </foreignObject>
      </Layer>
    );
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex items-end justify-between border-b border-[var(--border)] pb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium text-[var(--foreground)] tracking-tight leading-none">Money Flow</h1>
          <p className="text-[14px] text-[var(--secondary-text)]">Income to Merchant mapping</p>
        </div>
        <button className="btn-secondary">
           Export Data
        </button>
      </div>

      <div className="flex flex-col h-[650px] p-6 border border-[var(--border)] rounded-md relative bg-[var(--surface)]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 text-[13px] text-[var(--secondary-text)]">
            Loading flow data...
          </div>
        ) : !data ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[13px] text-[var(--secondary-text)]">
             Not enough data to visualize money flow.
          </div>
        ) : (
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={data}
                node={<CustomNode />}
                nodePadding={40}
                margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
                link={{ stroke: 'rgba(17, 17, 17, 0.08)', strokeWidth: '10' }}
              >
                <Tooltip 
                  contentStyle={{ borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: 'rgba(255,255,255,1)', fontSize: '12px' }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
         <div className="flex flex-col gap-2 p-6 bg-[var(--background)] border border-[var(--border)] rounded-md">
           <span className="text-[11px] font-medium text-[var(--secondary-text)] uppercase tracking-wider">How to read this</span>
           <p className="text-[13px] text-[var(--foreground)] leading-relaxed mt-1">
             The Sankey diagram maps your money from its source (Income) directly to where it is spent (Categories), and finally down to the individual Merchants. The thickness of the lines represents the volume of money.
           </p>
         </div>
         <div className="flex flex-col gap-2 p-6 bg-[var(--background)] border border-[var(--border)] rounded-md md:col-span-2">
           <span className="text-[11px] font-medium text-[var(--secondary-text)] uppercase tracking-wider">Analysis</span>
           <p className="text-[13px] font-medium text-[var(--foreground)] leading-relaxed mt-1">
             Your largest outflow path is typically Food & Dining directly to Swiggy/Zomato. Consider optimizing this flow to increase your net savings at the end of the month.
           </p>
         </div>
      </div>
    </div>
  );
}
