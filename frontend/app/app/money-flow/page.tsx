"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/api";
import { ArrowRightLeft, Download } from "lucide-react";
import { Sankey, Tooltip, ResponsiveContainer, Layer, Rectangle } from "recharts";

export default function MoneyFlowPage() {
  const { fetchApi } = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchApi("/analytics/money-flow");
        // Recharts Sankey needs nodes to be unique by index, not ID directly in some older versions.
        // It's safer to ensure we map strings to indices.
        if (res && res.nodes && res.links) {
          const nodeMap = new Map();
          res.nodes.forEach((n: any, idx: number) => nodeMap.set(n.id, idx));
          
          // Recharts Sankey sometimes requires nodes to just have 'name'
          const formattedNodes = res.nodes.map((n: any) => ({ name: n.id, value: n.value }));
          const formattedLinks = res.links.map((l: any) => ({
            source: nodeMap.has(l.source) ? nodeMap.get(l.source) : -1,
            target: nodeMap.has(l.target) ? nodeMap.get(l.target) : -1,
            value: l.value
          })).filter((l: any) => l.source !== -1 && l.target !== -1 && l.value > 0);

          // Need to extract missing targets as nodes if they don't exist
          const allTargets = new Set(res.links.map((l: any) => l.target));
          allTargets.forEach(t => {
            if (!nodeMap.has(t)) {
              formattedNodes.push({ name: t, value: 0 });
              nodeMap.set(t, formattedNodes.length - 1);
            }
          });

          // Rebuild links with new targets
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
  }, [fetchApi]);

  const CustomNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
    const isOut = x + width + 6 > containerWidth;
    return (
      <Layer key={`CustomNode${index}`}>
        <Rectangle x={x} y={y} width={width} height={height} fill="rgba(184, 65, 40, 0.8)" fillOpacity="1" radius={4} />
        <text
          textAnchor={isOut ? 'end' : 'start'}
          x={isOut ? x - 6 : x + width + 6}
          y={y + height / 2}
          fontSize="12"
          fontWeight="600"
          fill="#374151"
          dy={4}
        >
          {payload.name} (₹{payload.value.toLocaleString()})
        </text>
      </Layer>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full relative">
      <div className="flex items-center justify-between animate-item">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Money Flow</h1>
        </div>
        <button className="btn-liquid-glass px-4 py-2 text-sm font-semibold text-foreground btn-click-anim flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Map
        </button>
      </div>

      <div className="glass-card flex flex-col overflow-hidden animate-item delay-200 h-[650px] p-6 relative">
        <h3 className="text-lg font-semibold font-display text-foreground mb-4">Income to Merchant Flow</h3>
        
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-10">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : !data ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
             <ArrowRightLeft className="w-12 h-12 opacity-20" />
             <p className="font-medium">Not enough data to visualize money flow.</p>
          </div>
        ) : (
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={data}
                node={<CustomNode />}
                nodePadding={40}
                margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
                link={{ stroke: 'rgba(184, 65, 40, 0.2)', strokeWidth: '10' }}
              >
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)' }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Narrative block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-item delay-300">
         <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1">
           <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">How to read this</span>
           <p className="text-sm text-foreground leading-relaxed mt-2">
             The Sankey diagram maps your money from its source (Income) directly to where it is spent (Categories), and finally down to the individual Merchants. The thickness of the lines represents the volume of money.
           </p>
         </div>
         <div className="glass-card p-6 flex flex-col gap-2 relative overflow-hidden group hover:-translate-y-1 md:col-span-2">
           <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Insight</span>
           <p className="text-sm font-medium text-primary leading-relaxed mt-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
             Your largest outflow path is typically Food & Dining directly to Swiggy/Zomato. Consider optimizing this flow to increase your net savings at the end of the month.
           </p>
         </div>
      </div>
    </div>
  );
}
