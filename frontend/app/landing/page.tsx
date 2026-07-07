"use client";

import { useEffect, useRef, useState } from "react";
import HyperTextParagraph from "@/components/ui/hyper-text-with-decryption";
import { motion, useInView, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Upload,
  Layers,
  Sparkles,
  Shield,
  Lock,
  ExternalLink,
  FileText,
  GitBranch,
  Fingerprint,
  CalendarDays,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Download,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ─── Animation Variant ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function InView({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// ─── Shared style constants ────────────────────────────────────────────────────

const GLASS_SHADOW =
  "inset 0 0 0 1px rgba(255,255,255,0.2), inset 0 2px 8px rgba(255,255,255,0.5), 0 24px 64px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)";

const BTN_SHADOW =
  "inset 0 2px 2px rgba(255,255,255,0.3), inset 4px 8px 16px rgba(255,255,255,0.15), inset -4px -8px 16px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.5)";

const GRID_BG =
  "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)";

// ─── Background ───────────────────────────────────────────────────────────────

function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050505]">
      {/* Background Video with Fallback Image */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/bg-fallback.png"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

// ─── Glass Primitives ─────────────────────────────────────────────────────────

function GlassPanel({
  children,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={
        "bg-black/40 backdrop-blur-[100px] backdrop-saturate-200 transition-all duration-500 rounded-[24px] " +
        className
      }
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

function GlassButton({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, backgroundColor: "rgba(0,0,0,0.8)" }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={
        "relative bg-black/60 backdrop-blur-[200px] backdrop-saturate-200 rounded-full font-semibold text-white cursor-pointer transition-all duration-300 " +
        className
      }
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </motion.button>
  );
}

function OutlineButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, backgroundColor: "rgba(0,0,0,0.8)" }}
      whileTap={{ scale: 0.95 }}
      className={
        "rounded-full font-semibold text-white bg-black/60 backdrop-blur-[200px] backdrop-saturate-200 cursor-pointer transition-all duration-300 " +
        className
      }
      style={{
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </motion.button>
  );
}

// ─── Hero Pipeline ────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { label: "PDF Statement", icon: FileText },
  { label: "Parsed Transactions", icon: Layers },
  { label: "Money Flow", icon: TrendingUp },
  { label: "Financial Timeline", icon: GitBranch },
  { label: "Financial DNA", icon: Fingerprint },
];

function HeroPipeline() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const interval = setInterval(
      () => setActive((a) => (a + 1) % PIPELINE_STEPS.length),
      1800
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassPanel className="p-6 w-full max-w-xs mx-auto">
      {PIPELINE_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = active === i;
        
        const bg = isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)";
        const borderColor = isActive ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.05)";
        const blurAmount = isActive ? "0px" : "4px";
        const opacityAmount = isActive ? 1 : 0.4;
        
        return (
          <div key={step.label} className="flex flex-col items-center w-full">
            <motion.div
              animate={{ scale: isActive ? 1.05 : 1, backgroundColor: bg, borderColor, filter: `blur(${blurAmount})`, opacity: opacityAmount }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full rounded-2xl p-3 flex items-center gap-3 border"
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-sm font-semibold text-white"
                style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
              >
                {step.label}
              </span>
            </motion.div>
            {i < PIPELINE_STEPS.length - 1 && (
              <motion.div
                className="w-0.5 h-4 mx-auto"
                animate={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
                transition={{ duration: 0.4 }}
              />
            )}
          </div>
        );
      })}
    </GlassPanel>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-6xl"
    >
      <div
        className={
          (scrolled ? "bg-black/60" : "bg-black/10") +
          " w-full rounded-full flex justify-between items-center px-8 py-3.5 transition-all duration-500 backdrop-blur-[200px] backdrop-saturate-200"
        }
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex items-center gap-8">
          <span
            className="text-lg font-bold tracking-tight text-white"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            LedgerFlow
          </span>
          <div className="hidden md:flex items-center gap-6">
            {["How it Works", "Features", "Privacy"].map((item) => (
              <a
                key={item}
                href={"#" + item.toLowerCase().replace(/\s+/g, "-")}
                className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        <Link href="/sign-in">
          <GlassButton className="px-5 py-2 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Statement
          </GlassButton>
        </Link>
      </div>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            role="heading"
            aria-level={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="font-extrabold tracking-wider leading-[1.08] text-white mb-6"
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "clamp(38px, 5.5vw, 68px)",
            }}
          >
            <HyperTextParagraph 
              text="Your Bank Statement" 
              highlightWords={["Bank", "Statement"]} 
              className="inline" 
              style={{ filter: "drop-shadow(0px 4px 20px rgba(0,0,0,0.9))" }}
            />
            <br />
            <HyperTextParagraph 
              text="Has a Story." 
              highlightWords={["Story."]}
              className="text-[#F59E0B] relative z-10 inline-block mt-2 font-bold"
              style={{ filter: "drop-shadow(0px 4px 20px rgba(245,158,11,0.6))" }}
            />
          </motion.div>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="text-xl text-white/80 font-medium leading-relaxed mb-10 max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          >
            Upload your bank statement and experience your finances through
            beautiful visual narratives, interactive money flows, and a
            completely new way to understand your spending.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="flex flex-wrap gap-4"
          >
            <Link href="/sign-in">
              <GlassButton className="px-8 py-4 text-base flex items-center gap-2.5">
                <Upload className="w-4 h-4" />
                Upload Statement
                <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </Link>
            <OutlineButton className="px-8 py-4 text-base flex items-center gap-2.5">
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </OutlineButton>
          </motion.div>
        </div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="flex justify-center"
        >
          <HeroPipeline />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  "No manual expense tracking",
  "Upload and analyze instantly",
  "Secure document processing",
  "Works with multiple banks",
];

function TrustBar() {
  return (
    <InView className="px-6 mb-32">
      <div className="max-w-5xl mx-auto">
        <GlassPanel className="py-5 px-8 flex flex-wrap justify-center gap-6 md:gap-12 rounded-full">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2.5 text-sm font-medium text-[#E5E7EB]"
            >
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              {item}
            </div>
          ))}
        </GlassPanel>
      </div>
    </InView>
  );
}

// ─── Scroll Progress Bar ─────────────────────────────────────────────────────

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(to right, #3B82F6, #60A5FA, #3B82F6)",
      }}
    />
  );
}

// ─── Sticky Scroll Sequence ────────────────────────────────────────────────────

const SCROLL_STEPS = [
  {
    step: "01",
    title: "Drop your statement.",
    body: "Drag in any PDF or CSV from your bank. No manual entry, no formatting — it just works.",
    icon: Upload,
    accent: "#F59E0B",
    visual: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#FBBF24]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">statement_july.pdf</p>
            <p className="text-xs text-[#E5E7EB] mt-1 drop-shadow-md">2.4 MB · Uploading...</p>
          </div>
          <div className="w-36 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#F59E0B]"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Every transaction, organized.",
    body: "Merchants are identified, categories assigned, duplicates removed. Your data is structured automatically.",
    icon: Layers,
    accent: "#22C55E",
    visual: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-72 space-y-2">
          {[
            { name: "Netflix", cat: "Subscription", amt: "-$15", color: "#3B82F6" },
            { name: "Salary", cat: "Income", amt: "+$3,400", color: "#22C55E" },
            { name: "Amazon", cat: "Shopping", amt: "-$89", color: "#F59E0B" },
            { name: "Starbucks", cat: "Food", amt: "-$12", color: "#EF4444" },
          ].map((r, i) => (
            <motion.div
              key={r.name}
              className="flex items-center justify-between bg-black/60 backdrop-blur-[200px] backdrop-saturate-200 transition-all duration-500 rounded-[16px] px-4 py-2.5"
              style={{
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: r.color }}>
                  {r.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{r.name}</p>
                  <p className="text-xs text-[#9CA3AF]">{r.cat}</p>
                </div>
              </div>
              <span className="text-xs font-bold" style={{ color: r.color }}>{r.amt}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Your money, visualized.",
    body: "Spending categories bloom into charts. Timelines emerge. Your financial personality takes shape.",
    icon: TrendingUp,
    accent: "#F59E0B",
    visual: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex items-end gap-3 h-40">
          {[
            { label: "Housing", pct: 80, color: "#3B82F6" },
            { label: "Food", pct: 55, color: "#F59E0B" },
            { label: "Transport", pct: 35, color: "#22C55E" },
            { label: "Shopping", pct: 45, color: "#8B5CF6" },
            { label: "Other", pct: 25, color: "#9CA3AF" },
          ].map((b, i) => (
            <div key={b.label} className="flex flex-col items-center gap-1">
              <motion.div
                className="w-10 rounded-t-lg"
                style={{ background: b.color }}
                initial={{ height: 0 }}
                animate={{ height: b.pct * 1.4 }}
                transition={{ delay: i * 0.1, duration: 1, repeat: Infinity, repeatDelay: 2.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="text-[10px] text-[#9CA3AF]">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "Your financial story.",
    body: "A complete picture: who you are with money, where it goes, and what your pattern looks like over time.",
    icon: Fingerprint,
    accent: "#8B5CF6",
    visual: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-64 space-y-3">
          {[
            { label: "Consistent Saver", pct: 82, color: "#22C55E" },
            { label: "Weekend Shopper", pct: 67, color: "#F59E0B" },
            { label: "Subscription Heavy", pct: 71, color: "#3B82F6" },
          ].map((t, i) => (
            <div key={t.label}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-[#9CA3AF]">{t.label}</span>
                <span className="text-xs font-bold" style={{ color: t.color }}>{t.pct}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: t.color }}
                  initial={{ width: 0 }}
                  animate={{ width: t.pct + "%" }}
                  transition={{ delay: i * 0.2 + 0.3, duration: 1.2, repeat: Infinity, repeatDelay: 2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

function StickyScrollSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      const index = Math.min(
        SCROLL_STEPS.length - 1,
        Math.floor(v * SCROLL_STEPS.length)
      );
      setActiveStep(index);
    });
  }, [scrollYProgress]);

  const step = SCROLL_STEPS[activeStep];
  const Icon = step.icon;

  return (
    <section ref={containerRef} className="relative mb-32" style={{ height: `${SCROLL_STEPS.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="max-w-6xl w-full mx-auto">
          {/* Section titles removed per user request */}

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex gap-2 mb-8">
                {SCROLL_STEPS.map((s, i) => (
                  <motion.div
                    key={s.step}
                    className="h-1 rounded-full"
                    animate={{
                      width: i === activeStep ? 32 : 8,
                      backgroundColor:
                        i === activeStep
                          ? step.accent
                          : i < activeStep
                          ? "rgba(255,255,255,0.4)"
                          : "rgba(255,255,255,0.1)",
                    }}
                    transition={{ duration: 0.4 }}
                  />
                ))}
              </div>

              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full mb-6"
                  style={{ color: step.accent, background: step.accent + "20" }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  Step {step.step}
                </div>
                <h3
                  className="font-extrabold text-3xl md:text-4xl text-white mb-4 leading-tight"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-lg text-white/90 leading-relaxed max-w-md drop-shadow-md font-medium">
                  {step.body}
                </p>
              </motion.div>
            </div>

            <motion.div
              key={"visual-" + activeStep}
              initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <GlassPanel className="h-72 relative overflow-hidden">
                {step.visual}
              </GlassPanel>
            </motion.div>
          </div>

          {activeStep === 0 && (
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="text-xs text-[#6B7280] font-medium">Scroll to explore</span>
              <div className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5">
                <motion.div
                  className="w-1 h-2 rounded-full bg-white/40"
                  animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Visuals ──────────────────────────────────────────────────────────

function MoneyFlowVisual() {
  const bars = [
    { label: "Housing", pct: 35, color: "#3B82F6" },
    { label: "Food", pct: 22, color: "#F59E0B" },
    { label: "Transport", pct: 15, color: "#22C55E" },
    { label: "Shopping", pct: 18, color: "#8B5CF6" },
    { label: "Others", pct: 10, color: "#9CA3AF" },
  ];
  return (
    <div className="mt-6 space-y-2.5">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-xs text-[#9CA3AF] w-16 shrink-0">
            {b.label}
          </span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: b.color }}
              initial={{ width: 0 }}
              whileInView={{ width: b.pct + "%" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.3,
              }}
            />
          </div>
          <span className="text-xs font-semibold text-[#E5E7EB] w-8">
            {b.pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

function TimelineVisual() {
  const events = [
    { day: "Jul 2", label: "Amazon", amount: "-$42", color: "#EF4444" },
    { day: "Jul 7", label: "Salary", amount: "+$3,400", color: "#22C55E" },
    { day: "Jul 12", label: "Netflix", amount: "-$15", color: "#3B82F6" },
    { day: "Jul 19", label: "Dinner", amount: "-$68", color: "#F59E0B" },
    { day: "Jul 28", label: "Rent", amount: "-$1,800", color: "#EF4444" },
  ];
  return (
    <div className="mt-6 relative pl-4">
      <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[#3B82F6] via-blue-500/50 to-transparent" />
      <div className="space-y-3.5">
        {events.map((e, i) => (
          <motion.div
            key={e.label}
            className="flex items-center gap-3 ml-4 relative"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div
              className="absolute -left-[17px] w-2.5 h-2.5 rounded-full border-2 border-[#09090b]"
              style={{ background: e.color }}
            />
            <span className="text-xs text-[#6B7280] w-12">{e.day}</span>
            <span className="text-xs font-semibold text-[#E5E7EB] flex-1">
              {e.label}
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: e.color }}
            >
              {e.amount}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MonthlyJourneyVisual() {
  const highlights = [
    { label: "Biggest Purchase", value: "MacBook Pro" },
    { label: "Total Savings", value: "$1,240 this month" },
    { label: "Peak Spend Day", value: "Jul 7, Monday" },
    { label: "Subscriptions", value: "7 active — $94/mo" },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-2.5">
      {highlights.map((h, i) => (
        <motion.div
          key={h.label}
          className="bg-black/60 backdrop-blur-[200px] backdrop-saturate-200 transition-all duration-500 rounded-xl p-3 flex flex-col justify-center"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="text-xs text-[#9CA3AF]">{h.label}</div>
          <div className="text-xs font-bold text-white mt-0.5">
            {h.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function DNAVisual() {
  const traits = [
    { label: "Consistent Saver", pct: 82, color: "#22C55E" },
    { label: "Weekend Shopper", pct: 67, color: "#F59E0B" },
    { label: "Subscription Heavy", pct: 71, color: "#3B82F6" },
    { label: "Budget Disciplined", pct: 58, color: "#8B5CF6" },
  ];
  return (
    <div className="mt-6 space-y-3">
      {traits.map((t, i) => (
        <div key={t.label}>
          <div className="flex justify-between mb-1">
            <span className="text-xs text-[#9CA3AF]">{t.label}</span>
            <span
              className="text-xs font-bold"
              style={{ color: t.color }}
            >
              {t.pct}%
            </span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: t.color }}
              initial={{ width: 0 }}
              whileInView={{ width: t.pct + "%" }}
              viewport={{ once: true }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1],
                delay: i * 0.12 + 0.2,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Core Experiences ─────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: TrendingUp,
    label: "Money Flow",
    tag: "Visualization",
    tagColor: "#3B82F6",
    description:
      "See exactly where every dollar goes. Income flows into spending categories through elegant, animated visualizations.",
    Visual: MoneyFlowVisual,
  },
  {
    icon: GitBranch,
    label: "Financial Timeline",
    tag: "Navigation",
    tagColor: "#22C55E",
    description:
      "A chronological journey through every transaction. Scroll and replay your entire month.",
    Visual: TimelineVisual,
  },
  {
    icon: CalendarDays,
    label: "Monthly Journey",
    tag: "Narrative",
    tagColor: "#F59E0B",
    description:
      "Your month as a story — biggest purchase, income events, savings milestones, and spending patterns.",
    Visual: MonthlyJourneyVisual,
  },
  {
    icon: Fingerprint,
    label: "Financial DNA",
    tag: "Identity",
    tagColor: "#8B5CF6",
    description:
      "A visual personality profile built from your actual behavior. Discover what kind of spender you truly are.",
    Visual: DNAVisual,
  },
];

function CoreExperiences() {
  return (
    <section id="features" className="px-6 mb-32">
      <div className="max-w-6xl mx-auto">
        <InView className="text-center mb-16">
          <p className="text-sm font-extrabold tracking-widest text-[#F59E0B] uppercase mb-3 drop-shadow-md">
            Experiences
          </p>
          <h2
            className="font-extrabold text-5xl md:text-6xl text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Your money,
            <br />
            finally legible.
          </h2>
        </InView>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <InView key={f.label} delay={i * 0.08}>
                <GlassPanel className="p-8 h-full hover:scale-[1.015] transition-transform duration-500">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: f.tagColor + "20" }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: f.tagColor }}
                      />
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        color: f.tagColor,
                        background: f.tagColor + "20",
                      }}
                    >
                      {f.tag}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-xl text-white mb-2"
                    style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                  >
                    {f.label}
                  </h3>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">
                    {f.description}
                  </p>
                  <f.Visual />
                </GlassPanel>
              </InView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Transaction Explorer ─────────────────────────────────────────────────────

const TX_ROWS = [
  { merchant: "Swiggy", category: "Food", amount: "-$12", date: "Today", debit: true },
  { merchant: "Credit Card Payment", category: "Payment", amount: "-$340", date: "Yesterday", debit: true },
  { merchant: "Salary Transfer", category: "Income", amount: "+$3,400", date: "Jul 1", debit: false },
  { merchant: "Amazon Prime", category: "Subscription", amount: "-$15", date: "Jun 30", debit: true },
  { merchant: "Grocery Store", category: "Grocery", amount: "-$86", date: "Jun 29", debit: true },
];

function ExplorerPreview() {
  return (
    <section className="px-6 mb-32">
      <div className="max-w-6xl mx-auto">
        <InView className="text-center mb-16">
          <p className="text-sm font-extrabold tracking-widest text-[#F59E0B] uppercase mb-3 drop-shadow-md">
            Transaction Explorer
          </p>
          <h2
            className="font-extrabold text-5xl md:text-6xl text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Every transaction.
            <br />
            Instantly searchable.
          </h2>
        </InView>
        <InView>
          <GlassPanel className="overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-white/10">
              <div 
                className="flex-1 flex items-center gap-2 bg-black/40 backdrop-blur-[100px] backdrop-saturate-200 transition-all duration-500 rounded-xl px-4 py-2.5"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Search className="w-4 h-4 text-[#9CA3AF]" />
                <span className="text-sm text-white/80 font-medium">
                  Search transactions...
                </span>
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-[200px] backdrop-saturate-200 text-sm text-[#E5E7EB] font-medium hover:bg-black/80 transition cursor-pointer"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur-[200px] backdrop-saturate-200 text-sm text-[#E5E7EB] font-medium hover:bg-black/80 transition cursor-pointer"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            {TX_ROWS.map((row, i) => (
              <motion.div
                key={row.merchant}
                className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] hover:bg-white/5 transition-colors cursor-pointer group"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                    {row.merchant[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {row.merchant}
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      {row.category}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-[#6B7280] hidden md:block">
                    {row.date}
                  </span>
                  <span
                    className={
                      "text-sm font-bold " +
                      (row.debit ? "text-[#EF4444]" : "text-[#22C55E]")
                    }
                  >
                    {row.amount}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#4B5563] group-hover:text-[#9CA3AF] transition-colors" />
                </div>
              </motion.div>
            ))}
          </GlassPanel>
        </InView>
      </div>
    </section>
  );
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

const PRIVACY_ITEMS = [
  {
    icon: Lock,
    title: "Encrypted Processing",
    body: "Your documents are encrypted end-to-end before they ever leave your device.",
  },
  {
    icon: Shield,
    title: "No Unnecessary Storage",
    body: "We do not retain your raw statement. Data is processed and discarded.",
  },
  {
    icon: Fingerprint,
    title: "You Control Everything",
    body: "Delete your data anytime, instantly, with no questions asked.",
  },
];

function Privacy() {
  return (
    <section id="privacy" className="px-6 mb-32">
      <div className="max-w-6xl mx-auto">
        <InView>
          <GlassPanel className="p-12 md:p-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-8">
              <Lock className="w-7 h-7 text-[#FBBF24]" />
            </div>
            <h2
              className="font-extrabold text-5xl md:text-6xl text-white tracking-tight mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Your Financial Data
              <br />
              Belongs To You.
            </h2>
            <p className="text-xl text-white/80 font-medium max-w-xl mx-auto leading-relaxed mb-12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              We believe financial data is profoundly personal. Our architecture
              ensures we never sell, share, or exploit your transaction history.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {PRIVACY_ITEMS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <InView key={item.title} delay={i * 0.1}>
                    <div 
                      className="bg-black/30 backdrop-blur-[100px] backdrop-saturate-200 transition-all duration-500 rounded-2xl p-6"
                      style={{
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Icon className="w-5 h-5 text-[#F59E0B] mb-4" />
                      <h4
                        className="font-bold text-white mb-2"
                        style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-sm text-[#9CA3AF] leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </InView>
                );
              })}
            </div>
          </GlassPanel>
        </InView>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="px-6 mb-24">
      <div className="max-w-4xl mx-auto text-center">
        <InView>
          <h2
            className="font-extrabold text-6xl md:text-7xl text-white tracking-tight mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            Your statement is
            <br />
            waiting to be read.
          </h2>
          <p className="text-xl text-white/80 font-medium mb-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            Upload in seconds. No account needed.
          </p>
          <Link href="/sign-in">
            <GlassButton className="px-10 py-5 text-lg inline-flex items-center gap-3">
              <Upload className="w-5 h-5" />
              Upload Statement
              <ArrowRight className="w-5 h-5" />
            </GlassButton>
          </Link>
        </InView>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <span
          className="text-base font-bold text-white"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          LedgerFlow
        </span>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-[#9CA3AF]">
          {["Documentation", "Privacy", "GitHub", "Contact"].map((link) => (
            <a
              key={link}
              href="#"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              {link === "GitHub" && <ExternalLink className="w-3.5 h-3.5" />}
              {link}
            </a>
          ))}
        </div>
        <span className="text-sm text-[#6B7280]">2024 LedgerFlow</span>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="min-h-screen relative"
      style={{ background: "#09090b", fontFamily: "Inter, sans-serif" }}
    >
      <Background />
      <div className="relative z-10">
        <ScrollProgressBar />
        <Nav />
        <Hero />
        <TrustBar />
        <StickyScrollSequence />
        <CoreExperiences />
        <ExplorerPreview />
        <Privacy />
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
