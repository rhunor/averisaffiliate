"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Star, TrendingUp, Users, Zap, Shield, BookOpen, Gift, ChevronDown } from "lucide-react";

/* ─── Logo ─── */
function AverisLogoMark({ size = 40, white = false }: { size?: number; white?: boolean }) {
  const h = Math.round(size * (51 / 65));
  return (
    <svg width={size} height={h} viewBox="0 0 65 51" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill={white ? "white" : "#122F38"} />
      <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457" />
    </svg>
  );
}

/* ─── Animated counter ─── */
function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView) raw.set(to);
  }, [inView, to, raw]);

  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

/* ─── Dot-grid background ─── */
const dotGrid = {
  backgroundImage: "radial-gradient(circle, rgba(64,212,87,0.15) 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

/* ─── Hexagon SVG (decorative) ─── */
function HexRings() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      {[120, 200, 280, 360, 440].map((r, i) => (
        <polygon key={i} points={`400,${300 - r} ${400 + r * 0.866},${300 - r * 0.5} ${400 + r * 0.866},${300 + r * 0.5} 400,${300 + r} ${400 - r * 0.866},${300 + r * 0.5} ${400 - r * 0.866},${300 - r * 0.5}`} fill="none" stroke="#40D457" strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ─── Section fade-up wrapper ─── */
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#091820]/95 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
            <AverisLogoMark size={36} white />
          </motion.div>
          <div className="leading-none">
            <div className="font-black text-[16px] text-white tracking-[0.18em]">AVERIS</div>
            <div className="font-black text-[16px] text-[#40D457] tracking-[0.18em] -mt-0.5">ACADEMY</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "Pricing"].map((item) => (
            <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
            Sign In
          </Link>
          <Link href="/login" className="relative overflow-hidden bg-[#40D457] text-[#122F38] text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:bg-[#2eb847] group">
            <span className="relative z-10">Get Started</span>
            <span className="absolute inset-0 bg-white/20 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-500" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2">
          <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-5 h-0.5 bg-white mb-1.5 transition-all ${open ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-white transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#091820]/98 border-b border-white/10 px-6 pb-4">
            {["Features", "How It Works", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, "-")}`} onClick={() => setOpen(false)} className="block py-3 text-white/70 text-sm border-b border-white/8">
                {item}
              </a>
            ))}
            <div className="flex gap-3 mt-4">
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-medium text-white/70 border border-white/20 rounded-xl">Sign In</Link>
              <Link href="/login" className="flex-1 text-center py-2.5 text-sm font-bold bg-[#40D457] text-[#122F38] rounded-xl">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── Earnings toast (used inline on mobile, absolute on desktop) ─── */
function EarningsToast({ name, amount, time, delay, compact = false }: { name: string; amount: string; time: string; delay: number; compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 180 }}
      className={`flex items-center gap-3 glass border border-white/10 rounded-2xl shadow-lg ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
    >
      <div className={`rounded-full bg-[#40D457]/20 border border-[#40D457]/30 flex items-center justify-center shrink-0 ${compact ? "w-8 h-8" : "w-9 h-9"}`}>
        <span className={`text-[#40D457] font-bold ${compact ? "text-xs" : "text-sm"}`}>{name[0]}</span>
      </div>
      <div className="min-w-0">
        <p className="text-white text-xs font-semibold truncate">{name} earned</p>
        <p className={`text-[#40D457] font-black ${compact ? "text-xs" : "text-sm"}`}>{amount}</p>
        {!compact && <p className="text-white/35 text-[10px]">{time}</p>}
      </div>
    </motion.div>
  );
}

/* ─── Mock earnings dashboard card ─── */
function EarningsDashCard({ showFloating = false }: { showFloating?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Glow */}
      <div className="absolute -inset-3 rounded-3xl bg-[#40D457]/12 blur-2xl" />

      <div className="relative glass border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#40D457]/10 border-b border-white/8 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#40D457] animate-pulse" />
            <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Live Earnings</span>
          </div>
          <span className="text-white/30 text-[10px]">Today</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Balance */}
          <div>
            <p className="text-white/45 text-xs mb-1">Available balance</p>
            <motion.p className="text-3xl md:text-4xl font-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
              ₦<Counter to={245000} />
            </motion.p>
            <p className="text-[#40D457] text-xs font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +₦17,500 this week
            </p>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-1 h-12">
            {[30, 55, 40, 80, 65, 90, 75].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{ background: i === 5 ? "#40D457" : "rgba(64,212,87,0.25)" }}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 0.85 + i * 0.06, duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </div>
          <div className="flex justify-between text-white/25 text-[10px]">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/8">
            <div className="text-center">
              <p className="text-white/35 text-[10px] mb-0.5">Referrals</p>
              <p className="text-white font-bold text-base">14</p>
            </div>
            <div className="text-center border-x border-white/8">
              <p className="text-white/35 text-[10px] mb-0.5">Commission</p>
              <p className="text-[#40D457] font-bold text-base">50%</p>
            </div>
            <div className="text-center">
              <p className="text-white/35 text-[10px] mb-0.5">Per ref</p>
              <p className="text-[#40D457] font-bold text-sm">₦17.5k</p>
            </div>
          </div>

          <Link href="/login" className="block w-full text-center bg-[#40D457] hover:bg-[#2eb847] text-[#122F38] font-bold text-xs py-2.5 rounded-xl transition-colors">
            Sign in to start earning →
          </Link>
        </div>
      </div>

      {/* Desktop-only floating chips */}
      {showFloating && (
        <>
          <motion.div
            className="absolute -left-16 top-10 glass border border-white/10 rounded-xl px-3 py-2 shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <p className="text-white/55 text-[10px] leading-none mb-0.5">Commission</p>
            <p className="text-[#40D457] font-black text-base">50%</p>
          </motion.div>
          <motion.div
            className="absolute -right-12 bottom-24 glass border border-white/10 rounded-xl px-3 py-2 shadow-lg"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <p className="text-white/55 text-[10px] leading-none mb-0.5">Per referral</p>
            <p className="text-[#40D457] font-black text-sm">₦17,500</p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

/* ─── Spinning badge (desktop only) ─── */
function SpinBadge() {
  const text = "AVERIS ACADEMY · MARKETING MADE EASY · ";
  const chars = text.split("");
  const r = 48;
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="relative w-24 h-24">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <path id="spinCircle" d={`M 60,60 m -${r},0 a ${r},${r} 0 1,1 ${r * 2},0 a ${r},${r} 0 1,1 -${r * 2},0`} fill="none" />
        {chars.map((ch, i) => (
          <text key={i} fontSize="7.5" fill="rgba(255,255,255,0.5)" fontWeight="600" letterSpacing="0.5">
            <textPath href="#spinCircle" startOffset={`${(i / chars.length) * 100}%`}>{ch}</textPath>
          </text>
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="28" height="22" viewBox="0 0 65 51" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="white" />
          <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457" />
        </svg>
      </div>
    </motion.div>
  );
}

/* ─── Hero ─── */
function Hero() {
  const tags = [
    { label: "Learn It", color: "bg-[#40D457]/15 text-[#40D457] border-[#40D457]/20" },
    { label: "Sell Products", color: "bg-white/8 text-white/70 border-white/10" },
    { label: "Build Wealth", color: "bg-white/8 text-white/70 border-white/10" },
    { label: "50% Commission", color: "bg-[#40D457]/15 text-[#40D457] border-[#40D457]/20" },
    { label: "Earn Daily", color: "bg-white/8 text-white/70 border-white/10" },
  ];

  const toasts = [
    { name: "Emmanuel O.", amount: "₦17,500", time: "2 min ago" },
    { name: "Chidinma A.", amount: "₦35,000", time: "14 min ago" },
    { name: "Tunde B.", amount: "₦17,500", time: "1 hr ago" },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero pt-16">
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <HexRings />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#40D457]/6 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#1a3f4d]/80 blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">

          {/* ── LEFT: text content ── */}
          <div className="text-center lg:text-left">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-white/10"
            >
              <span className="w-2 h-2 rounded-full bg-[#40D457] animate-pulse shrink-0" />
              <span className="text-white/65 text-xs font-semibold uppercase tracking-widest">Nigeria&apos;s #1 Affiliate Academy</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.0] tracking-tight mb-5"
            >
              Marketing
              <br />
              <span className="gradient-text">Made Easy.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Learn digital marketing, promote premium products, and earn{" "}
              <span className="text-[#40D457] font-semibold">50% commission</span> on every sale. Join 70+ Nigerians already building real online income.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
            >
              <Link href="/login" className="relative overflow-hidden group bg-[#40D457] hover:bg-[#2eb847] text-[#122F38] font-bold text-sm px-7 py-3.5 rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(64,212,87,0.5)] flex items-center justify-center gap-2">
                <span className="relative z-10">Sign In to Get Started</span>
                <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 bg-white/25 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-500" />
              </Link>
              <a href="https://wa.me/2348085300040" target="_blank" rel="noopener noreferrer" className="glass hover:bg-white/8 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/15 hover:border-[#40D457]/40">
                <Play className="h-3.5 w-3.5 fill-[#40D457] text-[#40D457]" />
                Contact Support
              </a>
            </motion.div>

            {/* Tag pills */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {tags.map((tag, i) => (
                <motion.span
                  key={tag.label}
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.07, type: "spring", stiffness: 240 }}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border ${tag.color}`}
                >
                  {tag.label}
                </motion.span>
              ))}
            </div>
          </div>

          {/* ── RIGHT: visual section ── */}
          <div className="relative flex flex-col items-center lg:items-end gap-4">

            {/* Spinning badge — desktop only, floats top-left of card area */}
            <div className="hidden lg:block absolute -top-4 left-0 z-20">
              <SpinBadge />
            </div>

            {/* Dashboard card — full width on mobile, capped on desktop */}
            <div className="w-full max-w-sm lg:max-w-[300px] lg:ml-16 relative z-10">
              {/* showFloating only renders the offset chips on desktop where there's room */}
              <div className="lg:hidden">
                <EarningsDashCard showFloating={false} />
              </div>
              <div className="hidden lg:block">
                <EarningsDashCard showFloating={true} />
              </div>
            </div>

            {/* Toast notifications */}
            {/* Mobile: 2-column grid below card, compact style */}
            <div className="lg:hidden w-full max-w-sm grid grid-cols-2 gap-2">
              {toasts.slice(0, 2).map((t, i) => (
                <EarningsToast key={t.name} name={t.name} amount={t.amount} time={t.time} delay={0.9 + i * 0.15} compact />
              ))}
              {/* Third toast spans full width */}
              <div className="col-span-2">
                <EarningsToast name={toasts[2].name} amount={toasts[2].amount} time={toasts[2].time} delay={1.2} compact />
              </div>
            </div>

            {/* Desktop: absolute positioned stack to left of card */}
            <div className="hidden lg:flex lg:flex-col gap-2.5 absolute left-0 bottom-8 z-20">
              {toasts.map((t, i) => (
                <EarningsToast key={t.name} name={t.name} amount={t.amount} time={t.time} delay={1.0 + i * 0.18} />
              ))}
            </div>

            {/* Rocket icon — desktop only, top right */}
            <motion.img
              src="/Iconography/Rocket.svg"
              alt="" aria-hidden
              className="hidden lg:block absolute -top-6 right-0 h-16 opacity-20 pointer-events-none select-none"
              animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ChevronDown className="h-5 w-5 text-white/25" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Stats bar ─── */
function StatsBar() {
  const stats = [
    { value: 70, prefix: "", suffix: "+", label: "Members" },
    { value: 35000, prefix: "₦", suffix: "", label: "For 6 months" },
    { value: 50, prefix: "", suffix: "%", label: "Commission rate" },
    { value: 17500, prefix: "₦", suffix: "", label: "Per new referral" },
  ];

  return (
    <section className="bg-[#091820] border-y border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white mb-1">
                <Counter to={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="text-white/45 text-sm font-medium">{s.label}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "/Iconography/Rocket.svg",
      title: "Subscribe & Learn",
      desc: "Pay ₦35,000 for 6 months of full access. Dive into our video courses on affiliate marketing, digital sales, and wealth-building strategies.",
      color: "bg-[#40D457]/10 border-[#40D457]/20",
      badge: "Step 1",
    },
    {
      num: "02",
      icon: "/Iconography/Pointer.svg",
      title: "Promote & Earn",
      desc: "Get your unique referral links for every product. Share on WhatsApp, Instagram, Telegram, or wherever your audience lives. Every sale earns you 50%.",
      color: "bg-blue-500/10 border-blue-500/20",
      badge: "Step 2",
    },
    {
      num: "03",
      icon: "/Iconography/Naira Sign.svg",
      title: "Withdraw & Grow",
      desc: "₦17,500 per new subscriber. ₦15,000 per renewal. Instant bank transfers via Korapay. The more you refer, the more you earn — no cap.",
      color: "bg-[#40D457]/10 border-[#40D457]/20",
      badge: "Step 3",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            Three steps to your
            <br />
            <span className="gradient-text">financial freedom</span>
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-[#40D457]/0 via-[#40D457]/40 to-[#40D457]/0" />

          {steps.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.15}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 24px 60px rgba(18,47,56,0.12)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative bg-white border border-[#deeae5] rounded-3xl p-8 h-full"
              >
                <div className={`w-16 h-16 rounded-2xl ${step.color} border flex items-center justify-center mb-6`}>
                  <img src={step.icon} alt="" className="h-9 w-9" />
                </div>
                <div className="absolute top-6 right-6 text-5xl font-black text-[#122F38]/5">{step.num}</div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#40D457] mb-3">{step.badge}</span>
                <h3 className="text-xl font-bold text-[#122F38] mb-3">{step.title}</h3>
                <p className="text-[#5f7268] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const features = [
    {
      icon: "/Iconography/Rocket.svg",
      title: "Averis Academy",
      desc: "Professionally produced video courses on affiliate marketing, social media sales, WhatsApp business, and digital wealth strategies.",
      tag: "Learn",
    },
    {
      icon: "/Iconography/Naira Sign.svg",
      title: "50% Affiliate Commission",
      desc: "The highest commission rate in Nigerian EdTech. Earn ₦17,500 on every new subscription and ₦15,000 on every renewal — automatically tracked.",
      tag: "Earn",
    },
    {
      icon: "/Iconography/Badge.svg",
      title: "Multi-Product Links",
      desc: "Promote multiple premium products with unique, trackable referral links. QR codes included. Share across any platform, any time.",
      tag: "Promote",
    },
    {
      icon: "/Iconography/Up arrow.svg",
      title: "Instant Withdrawals",
      desc: "Your earnings, your timeline. Withdraw directly to any Nigerian bank account. Powered by Korapay for secure, instant transfers.",
      tag: "Withdraw",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)" }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#40D457]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Platform Features</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            Everything you need to
            <br />earn <span className="gradient-text">serious money</span>
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 0 0 2px rgba(64,212,87,0.3), 0 20px 50px rgba(18,47,56,0.1)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white border border-[#deeae5] rounded-3xl p-7 h-full flex flex-col group cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#122F38]/5 flex items-center justify-center mb-5 group-hover:bg-[#40D457]/10 transition-colors">
                  <img src={f.icon} alt="" className="h-8 w-8" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#40D457] mb-2">{f.tag}</span>
                <h3 className="text-lg font-bold text-[#122F38] mb-3 leading-snug">{f.title}</h3>
                <p className="text-[#5f7268] text-sm leading-relaxed flex-1">{f.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const testimonials = [
    { name: "Emmanuel O.", location: "Lagos", text: "I joined Averis Academy three months ago and I'm now making over ₦500,000 per month from referrals alone. The courses showed me exactly how to close sales on WhatsApp.", stars: 5 },
    { name: "Chidinma A.", location: "Abuja", text: "₦800,000 in my second month. I didn't believe it at first but the system works perfectly. The withdrawal to my account was instant every single time.", stars: 5 },
    { name: "Tunde B.", location: "Port Harcourt", text: "Financial freedom is real and Averis Academy made it happen for me. I've referred 47 people and earn passive income every time they renew.", stars: 5 },
    { name: "Aisha M.", location: "Kano", text: "As a stay-at-home mum, this is the perfect side income. I work 2 hours a day and consistently earn ₦200K+ monthly just from sharing my referral link.", stars: 5 },
    { name: "Rotimi K.", location: "Ibadan", text: "The academy courses are world-class. I learned digital marketing from zero and now I have a full-time income online. Best investment I ever made.", stars: 5 },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  return (
    <section className="py-24 gradient-hero overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <HexRings />

      <motion.img
        src="/Iconography/Community.svg"
        alt=""
        aria-hidden
        className="absolute right-8 md:right-24 top-1/2 -translate-y-1/2 h-48 opacity-[0.08] pointer-events-none select-none"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <FadeUp className="text-center mb-14">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Member Stories</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Real people,<br /><span className="gradient-text">real results</span>
          </h2>
        </FadeUp>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="glass rounded-3xl p-8 md:p-10 border border-white/10"
            >
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonials[index].stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#40D457] text-[#40D457]" />
                ))}
              </div>
              <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed mb-8">
                &ldquo;{testimonials[index].text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#40D457]/20 border border-[#40D457]/30 flex items-center justify-center">
                  <span className="text-[#40D457] font-bold text-sm">{testimonials[index].name[0]}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonials[index].name}</p>
                  <p className="text-white/45 text-xs">{testimonials[index].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all duration-300 rounded-full ${i === index ? "w-6 h-2 bg-[#40D457]" : "w-2 h-2 bg-white/25 hover:bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#122F38]/3 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Transparent Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            One plan. <span className="gradient-text">Everything included.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#40D457]/30 to-[#122F38]/20 blur-sm" />
            <div className="relative bg-white border border-[#40D457]/20 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="gradient-averis px-8 py-10 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
                <motion.img src="/Iconography/Badge.svg" alt="" aria-hidden className="absolute -right-4 -top-4 h-32 opacity-10 pointer-events-none select-none" animate={{ rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} />
                <span className="inline-block glass text-[#40D457] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 border border-[#40D457]/20">Full Access</span>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-6xl font-black text-white">₦35,000</span>
                  <span className="text-white/50 text-lg pb-2">/ 6 months</span>
                </div>
                <p className="text-white/60 text-sm">One flat payment. No hidden fees. No monthly charges.</p>
              </div>

              {/* Features list */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Full Academy video course access",
                    "Unique referral links for all products",
                    "50% commission on every new sale",
                    "₦15,000 commission on renewals",
                    "Real-time earnings dashboard",
                    "Instant bank withdrawals",
                    "QR code generator for offline sharing",
                    "WhatsApp & community support",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0" />
                      <span className="text-[#122F38] text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Commission breakdown */}
                <div className="bg-[#f4f8f6] rounded-2xl p-5 mb-8 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-[#5f7268] mb-1">New subscription</p>
                    <p className="text-2xl font-black text-[#16a34a]">₦17,500</p>
                    <p className="text-xs text-[#5f7268]">per referral</p>
                  </div>
                  <div className="text-center border-l border-[#deeae5]">
                    <p className="text-xs text-[#5f7268] mb-1">Renewal commission</p>
                    <p className="text-2xl font-black text-[#40D457]">₦15,000</p>
                    <p className="text-xs text-[#5f7268]">per renewal</p>
                  </div>
                </div>

                <Link href="/login" className="relative overflow-hidden group block w-full text-center bg-[#122F38] hover:bg-[#1a3f4d] text-white font-bold text-base py-4 rounded-2xl transition-all hover:shadow-[0_8px_30px_rgba(18,47,56,0.35)]">
                  <span className="relative z-10">Join Averis Academy Now</span>
                  <span className="absolute inset-0 bg-[#40D457]/10 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-500" />
                </Link>
                <p className="text-center text-xs text-[#5f7268] mt-3">Min. withdrawal: ₦10,000 · Instant bank transfer</p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Values ─── */
function Values() {
  const vals = [
    { icon: "/Iconography/Human.svg", title: "Accessibility", desc: "World-class training made affordable for every Nigerian, regardless of background or location." },
    { icon: "/Iconography/Shield.svg", title: "Integrity", desc: "Transparent commissions, honest earnings data, and instant verified payouts. No games." },
    { icon: "/Iconography/Pointer.svg", title: "Simplicity", desc: "Log in, share your link, earn money. We remove every barrier between you and your income." },
    { icon: "/Iconography/Community.svg", title: "Community", desc: "Join a network of driven entrepreneurs all helping each other win. We grow together." },
  ];

  return (
    <section className="py-24 bg-[#f4f8f6]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Our Values</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            Built on a <span className="gradient-text">foundation of trust</span>
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vals.map((v, i) => (
            <FadeUp key={v.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center p-8 bg-white rounded-3xl border border-[#deeae5] hover:border-[#40D457]/30 transition-colors"
              >
                <motion.img
                  src={v.icon}
                  alt=""
                  className="h-16 w-16 mx-auto mb-5"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                />
                <h3 className="text-lg font-bold text-[#122F38] mb-2">{v.title}</h3>
                <p className="text-[#5f7268] text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA banner ─── */
function CTABanner() {
  return (
    <section className="py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <HexRings />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#40D457]/6 blur-[120px]" />
      </div>

      <motion.img src="/Iconography/Rocket.svg" alt="" aria-hidden className="absolute left-12 top-1/2 -translate-y-1/2 h-32 opacity-[0.08] pointer-events-none select-none" animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }} transition={{ duration: 7, repeat: Infinity }} />
      <motion.img src="/Iconography/Naira Sign.svg" alt="" aria-hidden className="absolute right-12 top-1/2 -translate-y-1/2 h-28 opacity-[0.08] pointer-events-none select-none" animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 1.5 }} />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
        <FadeUp>
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-4">Start Today</p>
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
            Your first ₦17,500<br /><span className="gradient-text">is one share away</span>
          </h2>
          <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto">
            Join over 70 members already earning consistent income from Averis Academy&apos;s affiliate program. No experience needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="relative overflow-hidden group bg-[#40D457] hover:bg-[#2eb847] text-[#122F38] font-bold text-base px-10 py-4 rounded-2xl transition-all hover:shadow-[0_0_50px_rgba(64,212,87,0.4)] flex items-center justify-center gap-2">
              <span className="relative z-10">Sign In to Dashboard</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-white/25 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-600" />
            </Link>
            <a href="https://wa.me/2348085300040" target="_blank" rel="noopener noreferrer" className="glass hover:bg-white/8 text-white font-semibold text-base px-10 py-4 rounded-2xl transition-all border border-white/15 hover:border-white/30 flex items-center justify-center">
              Get Access via Support
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="bg-[#091820] border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <AverisLogoMark size={36} white />
              <div className="leading-none">
                <div className="font-black text-[16px] text-white tracking-[0.18em]">AVERIS</div>
                <div className="font-black text-[16px] text-[#40D457] tracking-[0.18em] -mt-0.5">ACADEMY</div>
              </div>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Nigeria&apos;s premier digital marketing and affiliate income platform. Learn, promote, and earn.
            </p>
            <p className="text-[#40D457]/70 text-xs font-semibold mt-3 uppercase tracking-widest">Marketing Made Easy</p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Platform</p>
            <div className="space-y-3">
              {[
                { label: "Sign In", href: "/login" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
              ].map((l) => (
                <a key={l.label} href={l.href} className="block text-white/50 hover:text-white text-sm transition-colors">{l.label}</a>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Why Averis</p>
            <div className="space-y-3">
              {[
                { icon: Shield, text: "Secure payments via Korapay" },
                { icon: Zap, text: "Instant bank withdrawals" },
                { icon: TrendingUp, text: "Proven 50% commission model" },
                { icon: Users, text: "Growing community of 70+ earners" },
                { icon: BookOpen, text: "Professional video courses" },
                { icon: Gift, text: "Earn on every renewal too" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <Icon className="h-3.5 w-3.5 text-[#40D457] shrink-0" />
                  <span className="text-white/50 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© 2026 Averis Global Limited. All rights reserved.</p>
          <p className="text-white/20 text-xs">Made for Nigerian entrepreneurs</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function MarketingPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Pricing />
      <Values />
      <CTABanner />
      <Footer />
    </main>
  );
}
