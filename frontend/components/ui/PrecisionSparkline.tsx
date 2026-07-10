"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrecisionSparklineProps {
  data: number[];
  width?: number | string;
  height?: number;
  strokeColor?: string;
  dotColor?: string;
}

export function PrecisionSparkline({
  data,
  width = "100%",
  height = 64,
  strokeColor = "var(--border)",
  dotColor = "var(--primary)"
}: PrecisionSparklineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 10;
  const innerHeight = height - pad * 2;

  // Assuming fixed SVG viewport of 400xHeight for scaling
  const viewBoxWidth = 400;
  const step = data.length > 1 ? viewBoxWidth / (data.length - 1) : viewBoxWidth;

  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - pad - ((val - min) / range) * innerHeight;
    return { x, y, val };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const lastPoint = points[points.length - 1];

  return (
    <div 
      className="relative w-full overflow-visible group" 
      style={{ height, width }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        viewBox={`-5 0 ${viewBoxWidth + 10} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* The permanent exact-point dot */}
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3"
          fill={dotColor}
          className="transition-opacity duration-200"
          style={{ opacity: hoverIndex !== null && hoverIndex !== points.length - 1 ? 0 : 1 }}
        />

        {/* Invisible hit areas for hover interaction */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={i === 0 ? 0 : p.x - step / 2}
            y={0}
            width={step}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(i)}
            className="cursor-crosshair"
          />
        ))}

        <AnimatePresence>
          {hoverIndex !== null && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <line
                x1={points[hoverIndex].x}
                y1={0}
                x2={points[hoverIndex].x}
                y2={height}
                stroke={strokeColor}
                strokeWidth="1"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={points[hoverIndex].x}
                cy={points[hoverIndex].y}
                r="3"
                fill={dotColor}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      
      {/* HTML tooltip for crisp mono-num text rendering outside SVG scaling */}
      <AnimatePresence>
        {hoverIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-8 -translate-x-1/2 bg-[var(--foreground)] text-[var(--background)] px-2 py-0.5 rounded text-[11px] font-medium mono-num whitespace-nowrap shadow-sm pointer-events-none"
            style={{ 
              left: `${(points[hoverIndex].x / viewBoxWidth) * 100}%` 
            }}
          >
            ₹{points[hoverIndex].val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
