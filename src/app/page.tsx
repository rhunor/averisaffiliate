"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, CheckCircle, Star, ChevronDown } from "lucide-react";

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

  const scrollToSection = (id: string) => {
    setOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

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
          {[{ label: "What We Offer", id: "what-we-offer" }, { label: "How It Works", id: "how-it-works" }].map((item) => (
            <button key={item.id} onClick={() => scrollToSection(item.id)} className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
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
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-[#091820]/98 border-b border-white/10 px-6 pb-4 overflow-hidden">
            {[{ label: "What We Offer", id: "what-we-offer" }, { label: "How It Works", id: "how-it-works" }].map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="block w-full text-left py-3 text-white/70 text-sm border-b border-white/8">
                {item.label}
              </button>
            ))}
            <div className="mt-4">
              <Link href="/login" className="block text-center py-2.5 text-sm font-bold bg-[#40D457] text-[#122F38] rounded-xl">Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─── Hero photo slideshow with notification popups ─── */
function HeroVisual() {
  const images = ["/hero1.jpg", "/hero2.jpg"];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* Glow behind image */}
      <div className="absolute -inset-4 rounded-3xl bg-[#40D457]/10 blur-2xl" />

      {/* Slideshow */}
      <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={{ minHeight: "280px" }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt="Averis Academy member working online"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-auto object-cover absolute inset-0"
            style={{ maxHeight: "420px", objectPosition: "center top" }}
          />
        </AnimatePresence>
        {/* Spacer to maintain height */}
        <img src={images[0]} alt="" aria-hidden className="w-full h-auto object-cover opacity-0 pointer-events-none" style={{ maxHeight: "420px" }} />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Slide dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`transition-all duration-300 rounded-full ${i === current ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Popup 1 — top left: new sale notification */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.0, duration: 0.5, type: "spring", stiffness: 200 }}
        className="absolute top-4 left-4 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 max-w-[220px]"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#40D457]/15 border border-[#40D457]/30 flex items-center justify-center shrink-0 text-base">
          🎉
        </div>
        <div className="min-w-0">
          <p className="text-[#122F38] text-[11px] font-bold leading-tight">Emmanuel O. just made a sale!</p>
          <p className="text-[#40D457] text-xs font-black">+₦17,500 earned</p>
        </div>
      </motion.div>

      {/* Popup 2 — bottom right: commission alert */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, type: "spring", stiffness: 200 }}
        className="absolute bottom-4 right-4 bg-white rounded-2xl shadow-xl px-3.5 py-2.5 flex items-center gap-2.5 max-w-[230px]"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
      >
        <div className="w-8 h-8 rounded-full bg-[#122F38]/10 border border-[#122F38]/20 flex items-center justify-center shrink-0 text-base">
          💰
        </div>
        <div className="min-w-0">
          <p className="text-[#122F38] text-[11px] font-bold leading-tight">New Commission Alert!</p>
          <p className="text-[#555] text-[10px] leading-snug">You just earned ₦17,500 from a new subscriber</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Hero ─── */
function Hero() {
  const tags = [
    { label: "Phase 1: Make Money", color: "bg-[#40D457]/15 text-[#40D457] border-[#40D457]/20" },
    { label: "Phase 2: Grow Wealth", color: "bg-white/8 text-white/70 border-white/10" },
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
              <span className="text-white/65 text-xs font-semibold uppercase tracking-widest">100+ Africans Building Wealth</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.0] tracking-tight mb-5"
            >
              Your Income Has A Ceiling.
              <br />
              <span className="gradient-text">We Don&apos;t.</span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white/50 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Averis Academy is a wealth creation platform. We teach you to build real income selling digital products online,{" "}
              <span className="text-[#40D457] font-semibold">then show you how to invest that income</span> to build generational wealth.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
            >
              <Link href="/login" className="relative overflow-hidden group bg-[#40D457] hover:bg-[#2eb847] text-[#122F38] font-bold text-sm px-7 py-3.5 rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(64,212,87,0.5)] flex items-center justify-center gap-2">
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                <span className="absolute inset-0 bg-white/25 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-500" />
              </Link>
              <a href="#what-we-offer" className="glass hover:bg-white/8 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/15 hover:border-[#40D457]/40">
                <Play className="h-3.5 w-3.5 fill-[#40D457] text-[#40D457]" />
                See How It Works
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

          {/* ── RIGHT: hero photo ── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-md lg:max-w-none">
              <HeroVisual />
            </div>
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
    { value: 100, prefix: "", suffix: "+", label: "Active Members" },
    { value: 2, prefix: "", suffix: "", label: "Wealth Phases" },
  ];

  return (
    <section className="bg-[#091820] border-y border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-center gap-16 sm:gap-24 md:gap-40">
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
      title: "Register & Get Full Access",
      desc: "Register on Averis Academy, log in, and get 6 months full access to Phase 1: you'll get access to Averis Academy trainings, community, coaching and close guidance to help you succeed.",
      color: "bg-[#40D457]/10 border-[#40D457]/20",
      badge: "Step 1",
    },
    {
      num: "02",
      icon: "/Iconography/Pointer.svg",
      title: "Learn & Build Your Online Business",
      desc: "Study the trainings and we help you create your own digital product. Also, if you want, you start out as an affiliate; we give you access to a hot digital product you can start selling immediately and start making consistent online income.",
      color: "bg-blue-500/10 border-blue-500/20",
      badge: "Step 2",
    },
    {
      num: "03",
      icon: "/Iconography/Naira Sign.svg",
      title: "Invest & Build Generational Wealth",
      desc: "When your income is consistent, level up to Averis Wealth Club (Phase 2). We show you where to invest your earnings and build an investment portfolio that grows while you sleep, so you never go broke again and keep building wealth on the internet.",
      color: "bg-[#40D457]/10 border-[#40D457]/20",
      badge: "Step 3",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">The Process</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            How <span className="gradient-text">Averis Academy</span> Works
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
      title: "Averis Academy Video Trainings",
      desc: "Easy to understand video trainings covering digital products, affiliate marketing, paid advertising, and organic growth. Every video is created to help you make lots of money in your digital product business.",
      tag: "Learn",
    },
    {
      icon: "/Iconography/Naira Sign.svg",
      title: "A Hot Product to Promote",
      desc: "If you're not ready to create your own product yet, that's not a problem. We give you access to a high-converting product to promote as an affiliate and start earning from Day 1.",
      tag: "Earn",
    },
    {
      icon: "/Iconography/Badge.svg",
      title: "Accountability Group & Community",
      desc: "You gain access to the Averis community where we hold you accountable and make sure you succeed. We check in on you and help review what you are doing to make the journey easy for you.",
      tag: "Grow",
    },
    {
      icon: "/Iconography/Up arrow.svg",
      title: "Weekly Live Coaching",
      desc: "Every Sunday at 8 PM WAT, we have our weekly coaching calls where you can ask questions, share wins, and get direct answers from the founder and other top marketers who are actively building businesses.",
      tag: "Coach",
    },
  ];

  return (
    <section id="what-we-offer" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #f4f8f6 0%, #ffffff 100%)" }}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#40D457]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">What&apos;s Included</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            Everything You Need
            <br /><span className="gradient-text">Inside Phase 1</span>
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

/* ─── Averis Wealth Club (Phase 2) ─── */
function WealthClub() {
  const features = [
    { text: "Stock market investing: Nigerian & international" },
    { text: "Cryptocurrency the right way: investing in the right assets in crypto" },
    { text: "Portfolio allocation & risk management strategy" },
    { text: "Monthly curated investment guidance & alerts" },
    { text: "Private investor community & accountability" },
    { text: "Optional: Done-For-You portfolio management" },
  ];

  return (
    <section id="wealth-club" className="py-24 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <HexRings />

      {/* Decorative floating icons */}
      <motion.img
        src="/Iconography/Up arrow.svg"
        alt="" aria-hidden
        className="absolute left-8 top-1/4 h-24 opacity-[0.06] pointer-events-none select-none"
        animate={{ y: [0, -14, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.img
        src="/Iconography/Badge.svg"
        alt="" aria-hidden
        className="absolute right-8 bottom-1/4 h-28 opacity-[0.06] pointer-events-none select-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* Phase label + heading */}
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#40D457] shrink-0" />
            <span className="text-white/65 text-xs font-semibold uppercase tracking-widest">Phase 2</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
            Averis <span className="gradient-text">Wealth Club</span>
          </h2>
          <p className="text-white/55 text-lg max-w-2xl mx-auto leading-relaxed">
            Making money is step one. Keeping and growing it is step two. Most people skip step two, and that&apos;s why most people never build real wealth.
          </p>
        </FadeUp>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left — copy */}
          <FadeUp delay={0.1}>
            <div className="space-y-6">
              <p className="text-white/70 text-base leading-relaxed">
                Averis Wealth Club is our investment education and portfolio management platform. When you&apos;re consistently earning from Phase 1, you join Phase 2 and learn to put your money to work in stocks, crypto, and other assets.
              </p>
              <p className="text-white/70 text-base leading-relaxed">
                This is where income becomes generational wealth.
              </p>

              {/* Phase comparison cards */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="glass border border-white/10 rounded-2xl p-5">
                  <p className="text-[#40D457] text-xs font-black uppercase tracking-widest mb-2">Phase 1</p>
                  <p className="text-white font-bold text-base mb-1">Make Money</p>
                  <p className="text-white/50 text-xs leading-relaxed">Sell digital products, earn affiliate commissions, build consistent income.</p>
                  <p className="text-[#40D457] font-bold text-sm mt-3">₦500K–₦1M / month</p>
                </div>
                <div className="glass border border-[#40D457]/30 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#40D457] to-[#40D457]/0" />
                  <p className="text-[#40D457] text-xs font-black uppercase tracking-widest mb-2">Phase 2</p>
                  <p className="text-white font-bold text-base mb-1">Grow Wealth</p>
                  <p className="text-white/50 text-xs leading-relaxed">Invest your income into stocks, crypto, and assets that compound over time.</p>
                  <p className="text-[#40D457] font-bold text-sm mt-3">₦10M–₦50M portfolio</p>
                </div>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-[#40D457] hover:bg-[#2eb847] text-[#122F38] font-bold text-sm px-7 py-3.5 rounded-2xl transition-all hover:shadow-[0_0_40px_rgba(64,212,87,0.4)] mt-2"
              >
                Get Started with Phase 2
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </FadeUp>

          {/* Right — feature card */}
          <FadeUp delay={0.2}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative glass border border-white/15 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Card top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#40D457]/0 via-[#40D457] to-[#40D457]/0" />

              {/* Card header */}
              <div className="px-7 pt-7 pb-5 border-b border-white/8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-[#40D457]/15 border border-[#40D457]/25 flex items-center justify-center">
                    <img src="/Iconography/Up arrow.svg" alt="" className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">Build a Portfolio That Lasts</p>
                    <p className="text-white/45 text-xs mt-0.5">Averis Wealth Club: Phase 2</p>
                  </div>
                </div>
              </div>

              {/* Feature list */}
              <div className="px-7 py-5 space-y-3.5">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.45 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#40D457]/15 border border-[#40D457]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-[#40D457]" />
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{f.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Target outcome */}
              <div className="mx-7 mb-7 px-4 py-3.5 bg-[#40D457]/10 border border-[#40D457]/20 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[#40D457] text-base shrink-0">🎯</span>
                  <p className="text-[#40D457] text-sm font-semibold">
                    Target outcome: ₦10M – ₦50M portfolio in 1–5 years
                  </p>
                </div>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const testimonials = [
    { name: "Emmanuel O.", location: "Lagos", text: "I joined with zero experience. By Week 4 I made my first ₦50,000. By Month 3 I'm consistently earning ₦400,000 per month. The accountability system is what made the difference; I couldn't slack even when I wanted to.", stars: 5 },
    { name: "Chidinma A.", location: "Abuja", text: "Every other course gave me information. Averis gave me results. The weekly calls keep you accountable, the community keeps you motivated, and the system actually works in Nigeria. I made back my ₦35,000 in 10 days.", stars: 5 },
    { name: "Tunde B.", location: "Port Harcourt", text: "What separates Averis is the two-phase system. I'm not just making money; I'm learning to invest it. For the first time I have a real financial plan, not just a hustle. That's the difference between income and wealth.", stars: 5 },
    { name: "Aisha M.", location: "Kano", text: "As a stay-at-home mum, this is the perfect platform. I work 2 hours a day, earn consistent income from affiliate sales, and now I'm learning how to invest it properly through the Wealth Club.", stars: 5 },
    { name: "Rotimi K.", location: "Ibadan", text: "Most courses teach you to hustle forever. Averis teaches you to build: first an income, then a portfolio. I have a real financial plan for the first time in my life.", stars: 5 },
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
            Real People.<br /><span className="gradient-text">Real Results.</span>
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
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Simple Pricing</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            One Plan. <span className="gradient-text">Everything Included.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#40D457]/30 to-[#122F38]/20 blur-sm" />
            <div className="relative bg-white border border-[#40D457]/20 rounded-3xl overflow-hidden">
              {/* Header */}
              <div className="gradient-averis px-6 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
                <motion.img src="/Iconography/Badge.svg" alt="" aria-hidden className="absolute -right-4 -top-4 h-32 opacity-10 pointer-events-none select-none" animate={{ rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} />
                <span className="inline-block glass text-[#40D457] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 border border-[#40D457]/20">Full Access</span>
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mb-3">
                  <span className="text-5xl sm:text-6xl font-black text-white leading-none">₦35,000</span>
                  <span className="text-white/50 text-base sm:text-lg pb-1">/ 6 months</span>
                </div>
                <p className="text-white/60 text-sm">One flat payment. No hidden fees. No monthly charges.</p>
              </div>

              {/* Features list */}
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Access to Averis Academy account",
                    "4 professional video training modules",
                    "A hot digital product to promote as an affiliate",
                    "Accountability group & weekly live coaching",
                    "Real-time affiliate sales dashboard",
                    "Instant bank withdrawals",
                    "QR code & shareable affiliate links",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0" />
                      <span className="text-[#122F38] text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <Link href="/login" className="relative overflow-hidden group block w-full text-center bg-[#122F38] hover:bg-[#1a3f4d] text-white font-bold text-base py-4 rounded-2xl transition-all hover:shadow-[0_8px_30px_rgba(18,47,56,0.35)]">
                  <span className="relative z-10">Join Averis Academy Now</span>
                  <span className="absolute inset-0 bg-[#40D457]/10 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-500" />
                </Link>
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
    { icon: "/Iconography/Human.svg", title: "Accessibility", desc: "World-class wealth education made affordable for every African, regardless of background or location." },
    { icon: "/Iconography/Shield.svg", title: "Integrity", desc: "We value our users and we are always committed to giving them the best and helping them scale their income." },
    { icon: "/Iconography/Pointer.svg", title: "Execution", desc: "We don't just teach theory; we ensure our users take action through our accountability system that turns learning into online income." },
    { icon: "/Iconography/Community.svg", title: "Community", desc: "Join a network of serious Africans building wealth together. We don't just train you; we grow with you." },
  ];

  return (
    <section className="py-24 bg-[#f4f8f6]">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Our Foundation</p>
          <h2 className="text-4xl md:text-5xl font-black text-[#122F38] leading-tight">
            Built on <span className="gradient-text">Trust</span>
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
            Your Wealth Journey<br /><span className="gradient-text">Starts Here.</span>
          </h2>
          <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto">
            Join 100+ Africans learning to make money, invest it, and build wealth that lasts. Both phases. One platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="relative overflow-hidden group bg-[#40D457] hover:bg-[#2eb847] text-[#122F38] font-bold text-base px-10 py-4 rounded-2xl transition-all hover:shadow-[0_0_50px_rgba(64,212,87,0.4)] flex items-center justify-center gap-2">
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <span className="absolute inset-0 bg-white/25 translate-x-[-110%] skew-x-[-20deg] group-hover:translate-x-[110%] transition-transform duration-600" />
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
const footerSocials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/averisacademy?igsh=aXNhNnp1bjBpY29l",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "Twitter / X",
    href: "https://x.com/averisacademy?s=21",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@calebekenenwanneka1829?si=dFirxJzQtriHSFO6",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/2348148818354",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
];

function Footer() {
  return (
    <footer className="bg-[#091820] border-t border-white/8">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <AverisLogoMark size={32} white />
              <div className="leading-none">
                <div className="font-black text-[15px] text-white tracking-[0.18em]">AVERIS</div>
                <div className="font-black text-[15px] text-[#40D457] tracking-[0.18em] -mt-0.5">ACADEMY</div>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed max-w-[240px]">
              Africa&apos;s premier wealth creation platform. Make money, invest it, and build generational wealth.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-4">
              {footerSocials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {[
              { label: "Sign In", href: "/login" },
              { label: "What We Offer", href: "#what-we-offer" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms-of-service" },
            ].map((l) => (
              <a key={l.label} href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">{l.label}</a>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© 2026 Averis Global Limited. All rights reserved.</p>
          <a
            href="mailto:hello@averisacademy.com"
            className="text-[#40D457]/70 hover:text-[#40D457] text-xs font-semibold transition-colors"
          >
            Contact Support →
          </a>
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
      <WealthClub />
      <Testimonials />
      <Pricing />
      <Values />
      <CTABanner />
      <Footer />
    </main>
  );
}
