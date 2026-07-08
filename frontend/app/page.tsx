"use client";

import Link from "next/link";
import { useEffect } from "react";

const pillars = [
  {
    number: "01",
    title: "Statement-first",
    copy: "Start with the document you already have, then let the system build the map.",
    visual: "bars",
    featured: true,
  },
  {
    number: "02",
    title: "Financial Intelligence",
    copy: "Transactions become patterns, and patterns become a readable financial narrative.",
    visual: "orbit",
  },
  {
    number: "03",
    title: "Money Flow",
    copy: "Follow salary into categories, merchants, and individual decisions.",
    visual: "flow",
    featured: true,
  },
  {
    number: "04",
    title: "Financial Timeline",
    copy: "Every transaction keeps its place in the larger rhythm of the month.",
    visual: "timeline",
  },
  {
    number: "05",
    title: "Monthly Journey",
    copy: "See each month as a connected sequence of moments, not a flat table.",
    visual: "journey",
  },
  {
    number: "06",
    title: "Financial DNA",
    copy: "Traits emerge from behavior and evolve as your history becomes richer.",
    visual: "traits",
  },
];

const journey = [
  ["01", "Salary received", "+$4,850"],
  ["03", "Rent paid", "-$1,600"],
  ["09", "Weekend shopping", "-$248"],
  ["14", "Trip booked", "-$720"],
  ["21", "Refund cleared", "+$86"],
  ["28", "Savings moved", "-$900"],
];

const steps = [
  ["Upload", "A statement enters the secure workspace."],
  ["Processing", "Pages become clean transaction records."],
  ["Understanding", "Merchants, categories, and signals connect."],
  ["Interactive Story", "Your money becomes navigable."],
];

const traits = [
  "Weekend Shopper",
  "Night Spender",
  "Subscription Heavy",
  "Food Enthusiast",
  "Budget Conscious",
  "Investor",
];

export default function LandingPage() {
  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item, index) => {
      item.style.setProperty("--reveal-delay", `${Math.min(index % 5, 4) * 70}ms`);
      observer.observe(item);
    });

    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = Math.abs(currentScrollY - lastScrollY);
      
      const header = document.querySelector(".landing-header");
      if (header) {
        if (currentScrollY > 20) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      }

      // Motion blur effect
      const blurAmount = Math.min(velocity * 0.08, 12);
      const blurTarget = document.querySelector(".motion-blur-target") as HTMLElement;
      
      if (blurTarget) {
        blurTarget.style.transition = "none";
        blurTarget.style.filter = `blur(${blurAmount}px)`;
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          blurTarget.style.transition = "filter 0.3s ease-out";
          blurTarget.style.filter = "blur(0px)";
        }, 80);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="landing-page min-h-screen overflow-hidden text-[var(--landing-text)]">
      <div className="ledger-terrain" aria-hidden="true" />

      <header className="landing-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-display text-xl font-medium text-[var(--landing-text)]">
            LedgerFlow
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--landing-muted)] md:flex">
            <a href="#pillars" className="transition hover:text-[var(--landing-text)]">Pillars</a>
            <a href="#journey" className="transition hover:text-[var(--landing-text)]">Journey</a>
            <a href="#dna" className="transition hover:text-[var(--landing-text)]">DNA</a>
            <a href="#works" className="transition hover:text-[var(--landing-text)]">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden text-sm font-medium text-[var(--landing-muted)] transition hover:text-[var(--landing-text)] sm:inline">
              Sign in
            </Link>
            <Link href="/sign-up" className="primary-button">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <div className="motion-blur-target">
        <div className="relative w-full border-b border-black/10 bg-[#EAEAE7] min-h-[66.66vw] flex items-center">
        {/* Background image layer */}
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }} 
        />
        {/* Gradient overlay to blend seamlessly into the rest of the page */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#EAEAE7]/20 to-[#EAEAE7]" />

        <section className="landing-hero relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-12 px-5 py-20 text-center">
          <div data-reveal className="flex flex-col items-center">
            <p className="eyebrow">Financial intelligence from one upload</p>
            <h1 className="mt-5 max-w-3xl font-display text-[clamp(3rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.03em] text-[var(--landing-text)]">
              Your statement is a story.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--landing-muted)]">
              Upload a bank statement and explore your money through flows, timelines, monthly journeys, and evolving financial traits.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/sign-up" className="primary-button px-5 py-3">
                Upload a statement
              </Link>
              <a href="#works" className="quiet-link">
                See how it works
              </a>
            </div>
          </div>

          <div data-reveal className="hero-panel relative w-full overflow-hidden rounded-2xl p-5 sm:p-7 max-w-[640px]">
            <div className="hero-panel-inner relative flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-black/10 pb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--landing-muted)]">
                <span>Money flow</span>
                <span>One statement</span>
              </div>
              <div className="flow-map relative mx-auto w-full max-w-[560px]">
                <FlowNode className="flow-salary" label="Salary" value="+$4,850" />
                <FlowNode className="flow-housing" label="Housing" value="$1,600" />
                <FlowNode className="flow-food" label="Food" value="$612" />
                <FlowNode className="flow-travel" label="Travel" value="$720" />
                <FlowNode className="flow-rent" label="Rent" value="1 txn" small />
                <FlowNode className="flow-merchants" label="Merchants" value="18" small />
                <FlowNode className="flow-timeline" label="Timeline" value="31 days" small />
                <div className="flow-line line-a" />
                <div className="flow-line line-b" />
                <div className="flow-line line-c" />
                <div className="flow-line line-d" />
                <div className="flow-line line-e" />
                <div className="flow-line line-f" />
              </div>
              <div className="grid grid-cols-3 border-t border-black/10 pt-4 text-xs text-[var(--landing-muted)]">
                <Metric label="inflow" value="$4.8k" />
                <Metric label="signals" value="42" />
                <Metric label="traits" value="6" />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section data-reveal className="relative z-10 mx-auto max-w-6xl border-y border-black/10 px-5 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-baseline md:justify-between">
          <span className="font-display text-3xl text-[#746F66] line-through decoration-[#746F66]/70">
            How much did you spend?
          </span>
          <span className="hidden h-px flex-1 bg-black/10 md:block" />
          <span className="font-display text-3xl text-[var(--landing-accent)]">
            What happened to your money?
          </span>
        </div>
      </section>

      <section id="pillars" className="relative z-10 mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionIntro eyebrow="Six product pillars" title="A statement becomes a financial landscape." />
        <div className="pillar-grid mt-12 grid border-t border-black/10 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <article key={pillar.title} data-reveal className={`pillar-item ${pillar.featured ? "pillar-featured" : ""}`}>
              <div className="pillar-meta">
                <span className="text-xs font-semibold tabular-nums text-[var(--landing-accent)]">{pillar.number}</span>
                <MiniVisual type={pillar.visual} />
              </div>
              <h3 className="mt-8 max-w-[12rem] font-display text-[1.65rem] leading-tight text-[var(--landing-text)]">{pillar.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--landing-muted)]">{pillar.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="journey" className="relative z-10 mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionIntro eyebrow="Monthly journey" title="A month should read like a sequence, not a spreadsheet." />
        <div data-reveal className="journey-panel mt-12 grid gap-10 rounded-2xl p-6 md:grid-cols-[0.72fr_1.28fr] md:p-9">
          <div>
            <p className="text-sm leading-7 text-[var(--landing-muted)]">
              LedgerFlow connects events across time so income, obligations, choices, corrections, and savings keep their original order.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Income", "Obligations", "Choices", "Corrections", "Savings"].map((tag) => (
                <span key={tag} className="outline-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="journey-list relative space-y-3">
            {journey.map(([day, label, amount]) => (
              <div key={label} className="journey-row">
                <span className="journey-day">{day}</span>
                <span className="text-sm font-semibold text-[var(--landing-text)]">{label}</span>
                <span className="text-sm font-medium tabular-nums text-[var(--landing-muted)]">{amount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="dna" className="relative z-10 mx-auto max-w-6xl border-y border-black/10 px-5 py-20">
        <div data-reveal className="grid gap-8 md:grid-cols-[0.6fr_1.4fr] md:items-end">
          <div>
            <p className="eyebrow">Financial DNA</p>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,4.5vw,4.5rem)] font-medium leading-[0.98] tracking-[-0.025em] text-[var(--landing-text)]">
              Traits that keep learning.
            </h2>
            <p className="mt-5 text-sm leading-7 text-[var(--landing-muted)]">
              Traits evolve as more statements are uploaded.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {traits.map((trait) => (
              <span key={trait} className="outline-pill text-sm">
                {trait}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="works" className="relative z-10 mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <SectionIntro eyebrow="How it works" title="Four steps from statement to story." />
        <div className="proof-line mt-12 grid gap-8 border-t border-black/10 pt-10 md:grid-cols-4">
          {steps.map(([title, copy], index) => (
            <article key={title} data-reveal className="proof-item">
              <span className="text-sm font-semibold tabular-nums text-[var(--landing-accent)]">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 font-display text-2xl text-[var(--landing-text)]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--landing-muted)]">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-20 lg:py-24">
        <div data-reveal className="final-panel rounded-2xl px-6 py-14 text-center md:px-12 md:py-20">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(2.7rem,6vw,5.5rem)] font-medium leading-[0.94] tracking-[-0.03em] text-[var(--landing-text)]">
            See the shape of your money.
          </h2>
          <div className="mt-9 flex justify-center">
            <Link href="/sign-up" className="primary-button px-5 py-3">
              Create secure account
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex max-w-6xl flex-col gap-5 border-t border-black/10 px-5 py-9 text-sm text-[var(--landing-muted)] md:flex-row md:items-center md:justify-between">
        <span className="font-display text-xl text-[var(--landing-text)]">LedgerFlow</span>
        <div className="flex flex-wrap gap-5">
          <Link href="/sign-in" className="hover:text-[var(--landing-text)]">Sign in</Link>
          <Link href="/sign-up" className="hover:text-[var(--landing-text)]">Sign up</Link>
          <Link href="/app/upload" className="hover:text-[var(--landing-text)]">Upload</Link>
          <a href="#pillars" className="hover:text-[var(--landing-text)]">Pillars</a>
        </div>
        <span>2026 LedgerFlow</span>
      </footer>
      </div>
    </main>
  );
}

function FlowNode({
  label,
  value,
  small = false,
  className,
}: {
  label: string;
  value: string;
  small?: boolean;
  className: string;
}) {
  return (
    <div className={`flow-node absolute z-10 ${small ? "flow-node-small" : ""} ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--landing-muted)]">{label}</span>
      <strong className="mt-1 block text-lg font-semibold tabular-nums text-[var(--landing-text)]">{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <strong className="block text-base font-semibold tabular-nums text-[var(--landing-text)]">{value}</strong>
      {label}
    </div>
  );
}

function SectionIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div data-reveal className="max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.8rem)] font-medium leading-[0.96] tracking-[-0.03em] text-[var(--landing-text)]">
        {title}
      </h2>
    </div>
  );
}

function MiniVisual({ type }: { type: string }) {
  return (
    <div className={`mini-visual ${type}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}
