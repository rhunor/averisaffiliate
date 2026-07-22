"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle, ArrowRight, Star, Clock, X } from "lucide-react";

const IMG = (n: number) => `/fx%20income/${n}.PNG`;

function Screenshot({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`rounded-2xl overflow-hidden border border-white/12 shadow-2xl ${className}`}>
      <img src={src} alt={alt} className="w-full h-auto block" loading="lazy" />
    </div>
  );
}

function AverisLogoMark({ size = 40 }: { size?: number }) {
  const h = Math.round(size * (51 / 65));
  return (
    <svg width={size} height={h} viewBox="0 0 65 51" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="white" />
      <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457" />
    </svg>
  );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const dotGrid = {
  backgroundImage: "radial-gradient(circle, rgba(64,212,87,0.12) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

const inputCls = "w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#40D457]/40 focus:border-[#40D457]/50 transition-colors";

/* ─── Payment Modal ─── */
function PaymentModal({ affiliateCode, onClose }: { affiliateCode?: string; onClose: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/forex/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, affiliateCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Payment initialization failed."); return; }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.25 }}
        className="w-full max-w-md"
        style={{ background: "#0d1f2b", border: "1px solid rgba(64,212,87,0.25)", borderRadius: "24px", overflow: "hidden" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <div>
            <p className="text-white font-bold text-base">Get Access Now</p>
            <p className="text-white/50 text-xs mt-0.5">Forex Income Blueprint — ₦50,000</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
        <div className="px-6 py-6">
          {error && <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}
          <form onSubmit={handlePay} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">First Name</label>
                <input placeholder="John" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 mb-1.5">Last Name</label>
                <input placeholder="Doe" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1.5">Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required />
              <p className="mt-1.5 text-[11px] text-white/30">Your course access will be sent here. Double-check it.</p>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-xl font-black text-sm text-[#0a1a20] transition-all disabled:opacity-60 hover:shadow-[0_0_40px_rgba(64,212,87,0.35)]"
              style={{ background: "linear-gradient(138deg, #2ec97a 0%, #40D457 100%)" }}>
              {loading ? "Redirecting to payment…" : "Pay ₦50,000 & Get Access →"}
            </button>
          </form>
          <p className="text-center text-[11px] text-white/25 mt-4">Secure payment via Korapay. Course access sent to your email after payment.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SuccessBanner() {
  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#40D457] text-[#0a1a20] text-sm font-bold px-6 py-3 text-center">
      Payment confirmed! Check your email for course access details.
    </motion.div>
  );
}

/* ─── Navbar ─── */
function Navbar({ onGetAccess }: { onGetAccess: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-[#070f14]/95 backdrop-blur-md border-b border-white/8 shadow-lg" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <AverisLogoMark size={34} />
          <div className="leading-none">
            <div className="font-black text-[14px] text-white tracking-[0.18em]">AVERIS</div>
            <div className="font-black text-[14px] text-[#40D457] tracking-[0.18em] -mt-0.5">ACADEMY</div>
          </div>
        </Link>
        <button onClick={onGetAccess} className="bg-[#40D457] hover:bg-[#2eb847] text-[#0a1a20] font-bold text-sm px-5 py-2.5 rounded-xl transition-all">
          Get Access — ₦50,000
        </button>
      </div>
    </header>
  );
}

/* ─── Hero ─── */
function Hero({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16"
      style={{ background: "linear-gradient(160deg, #070f14 0%, #0d1f2b 40%, #0a2210 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-[#40D457]/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 w-full">
        <div className="text-center mb-12">
          <FadeUp>
            <div className="inline-flex items-center gap-2 bg-[#40D457]/10 border border-[#40D457]/25 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#40D457] animate-pulse shrink-0" />
              <span className="text-[#40D457] text-xs font-bold uppercase tracking-widest">Forex Income Blueprint — Averis Academy</span>
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              The Game Is Rigged<br /><span className="text-[#40D457]">Against YOU!</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.14}>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-3">
              You <span className="text-white font-semibold">cannot</span> make life-changing money as a forex trader by simply relying on old strategies and depending on signals…
            </p>
          </FadeUp>
          <FadeUp delay={0.18}>
            <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-3">
              …If you want to make <span className="text-[#40D457] font-bold">$500, $1,000, and $3,000 Monthly</span> from the Forex market as a small trader without getting robbed of your capital…
            </p>
          </FadeUp>
          <FadeUp delay={0.22}>
            <p className="text-white text-xl md:text-2xl font-black mb-10">
              Your only option is to <span className="text-[#40D457]">CHEAT</span>
            </p>
          </FadeUp>
          <FadeUp delay={0.28}>
            <button onClick={onGetAccess}
              className="inline-flex items-center gap-2 bg-[#40D457] hover:bg-[#2eb847] text-[#0a1a20] font-black text-base px-10 py-4 rounded-2xl transition-all hover:shadow-[0_0_60px_rgba(64,212,87,0.4)] mb-4">
              Show Me How To CHEAT The Market <ArrowRight className="h-5 w-5" />
            </button>
          </FadeUp>
        </div>

        {/* Proof screenshots — images 1, 2, 3 */}
        <FadeUp delay={0.35}>
          <p className="text-center text-white/40 text-xs uppercase tracking-widest font-semibold mb-6">Real profits using this exact system</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <Screenshot src={IMG(1)} alt="Forex profit screenshot" className="hover:scale-[1.02] transition-transform duration-300" />
            <Screenshot src={IMG(2)} alt="$3,000 in a day profit" className="hover:scale-[1.02] transition-transform duration-300" />
            <Screenshot src={IMG(3)} alt="$1,700 Binance withdrawal" className="hover:scale-[1.02] transition-transform duration-300" />
          </div>
          <p className="text-center text-white/25 text-xs mt-4">
            Imagine making as little as $250 a week — that&apos;s $1,000/month. At today&apos;s rate, that&apos;s over <span className="text-[#40D457]">₦1.6 million monthly.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Problem Section ─── */
function ProblemSection() {
  const problems = [
    { icon: "📉", title: "Old Strategies Are Dead", desc: "RSI, MACD, moving averages — these are lagging tools that retail traders follow while smart money already moved. By the time the signal fires, the move is over." },
    { icon: "🚨", title: "Signal Groups Are a Trap", desc: "You're not learning anything. You're depending on someone else's entries while they manage their own risk. The moment the signal provider disappears, so does your account." },
    { icon: "🎯", title: "The Market Knows Where You Are", desc: "Big banks and institutions can see clusters of retail stop losses. They deliberately hunt those levels, trigger your stops, then move in the direction you originally predicted." },
  ];

  return (
    <section className="py-20" style={{ background: "#070f14" }}>
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp className="text-center mb-5">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">The Brutal Truth</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            Here&apos;s Why Most Traders <span className="text-[#40D457]">Never Succeed</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.05} className="text-center mb-12">
          <p className="text-white/55 text-base max-w-2xl mx-auto">
            You&apos;ve felt it before, right? You jump in with high hopes… only to painfully watch your capital slowly disappear. You follow the signals, you stick to the strategies — and still end up with nothing.
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {problems.map((p, i) => (
            <FadeUp key={p.title} delay={i * 0.1}>
              <div className="bg-white/4 border border-white/10 rounded-2xl p-7 h-full">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="text-white font-bold text-lg mb-3">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.35}>
          <div className="bg-[#40D457]/8 border border-[#40D457]/20 rounded-2xl p-8 text-center">
            <p className="text-white text-lg md:text-xl font-semibold leading-relaxed">
              The market is not designed to make you money. It&apos;s designed to make big players like banks even richer — they control the moves, the liquidity, and the flow, leaving retail traders fighting for scraps.<br /><br />
              <span className="text-[#40D457] font-bold">Your only way to win is to know exactly what they&apos;re doing — and ride their wave instead of getting crushed by it.</span>
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Educator Full Story Section ─── */
function EducatorSection({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #070f14 0%, #0d1f2b 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-20">

        {/* Who is Caleb */}
        <div>
          <FadeUp className="text-center mb-10">
            <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-2">From the Desk of</p>
            <h2 className="text-3xl md:text-4xl font-black text-white">Nwanneka Caleb</h2>
            <p className="text-[#40D457] text-sm font-semibold mt-1">Online Entrepreneur & Forex Trader</p>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Image 4: Caleb's photo */}
            <FadeUp>
              <Screenshot src={IMG(4)} alt="Nwanneka Caleb — Forex educator" className="max-w-sm mx-auto md:mx-0" />
            </FadeUp>
            <FadeUp delay={0.12}>
              <div className="space-y-4 text-white/60 text-base leading-relaxed">
                <p className="text-white text-xl font-bold">Hi, I&apos;m Caleb.</p>
                <p>I am not one of those forex gurus who claim they know it all. I&apos;m just a regular guy who struggled with the same frustrations you&apos;ve likely experienced — until I found a secret trading system that now makes me <span className="text-[#40D457] font-semibold">$500–$1k a day</span> in the Forex market.</p>
                <p>Thanks to this system, I&apos;ve been able to pull profits like these, consistently:</p>
              </div>
            </FadeUp>
          </div>

          {/* Images 5, 6, 7, 8: his profit results */}
          <FadeUp delay={0.15} className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Screenshot src={IMG(5)} alt="$426 profit — 2 trades" />
                <p className="text-white/40 text-xs text-center mt-2">$426 — 2 trades</p>
              </div>
              <div>
                <Screenshot src={IMG(6)} alt="$405 profit — 1 trade" />
                <p className="text-white/40 text-xs text-center mt-2">$405 — 1 trade</p>
              </div>
              <div>
                <Screenshot src={IMG(7)} alt="$1,500 in 24hrs — trade 1" />
                <p className="text-white/40 text-xs text-center mt-2">$1,500 in 24hrs</p>
              </div>
              <div>
                <Screenshot src={IMG(8)} alt="$1,500 in 24hrs — trade 2" />
                <p className="text-white/40 text-xs text-center mt-2">$1,500 in 24hrs</p>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Personal story: 2019 */}
        <div>
          <FadeUp>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-2 mb-8">
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-6 py-4">
                <p className="text-amber-400 font-black text-xl text-center">But The Truth Is… It Wasn&apos;t Always Like This</p>
              </div>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <FadeUp delay={0.08}>
              <div className="space-y-4 text-white/60 text-base leading-relaxed">
                <p>This was me in 2019 — a broke student at the lowest point in my life.</p>
                <p>As an undergraduate, I spent countless sleepless nights asking myself: <em>What went wrong? How did I end up here?</em> I was worried about life after graduation — no jobs in Nigeria, so how would I survive?</p>
                <p>Then in July 2020, I stumbled upon Affiliate Marketing — and it made me my <span className="text-white font-semibold">first ever million naira on the internet.</span> Thanks to this, I could travel to places like Seychelles, Egypt, and Qatar. It was life-changing.</p>
                <p className="text-white font-semibold">But then I left it all behind — and here&apos;s why.</p>
              </div>
            </FadeUp>
            {/* Image 9: Caleb 2019 */}
            <FadeUp delay={0.15}>
              <Screenshot src={IMG(9)} alt="Caleb in 2019 — a broke student" />
            </FadeUp>
          </div>
        </div>

        {/* The Nigerian economy — images 10, 11 */}
        <div>
          <FadeUp>
            <h3 className="text-white font-black text-2xl text-center mb-8">
              The <span className="text-[#40D457]">Naija Economy</span> Was Eating My Profits Alive
            </h3>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <p className="text-white/50 text-sm mb-3">Last year — $1 was equal to:</p>
                <Screenshot src={IMG(10)} alt="$1 = N869 naira exchange rate" />
              </div>
              <div className="text-center">
                <p className="text-white/50 text-sm mb-3">But today — $1 is equal to:</p>
                <Screenshot src={IMG(11)} alt="$1 = N1,600 naira exchange rate" />
              </div>
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-7">
              <p className="text-white/70 leading-relaxed text-base">
                Making money as an affiliate marketer was good — but it had become extremely stressful. I was barely sleeping 4 hours a night. And then the Naira kept falling. A million naira I made last year? Now worth 500k. I was working harder, but getting poorer.
                <br /><br />
                At that point you realise — <span className="text-white font-semibold">no matter how much you make in naira, the falling exchange rate and rising costs will eat away your efforts.</span>
                <br /><br />
                So I quit — and decided to earn in dollars through Forex trading.
              </p>
            </div>
          </FadeUp>
        </div>

        {/* The costly mistake — image 12 */}
        <div>
          <FadeUp>
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-6 mb-8 text-center">
              <p className="text-red-400 font-black text-2xl">I Made A Costly Mistake</p>
              <p className="text-white/50 text-sm mt-2">(The #1 mistake that will cause you to lose your hard-earned money in Forex Trading)</p>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <FadeUp delay={0.08}>
              <div className="space-y-4 text-white/60 text-base leading-relaxed">
                <p>I watched some YouTube videos, took some of the money I made from affiliate marketing, put it into an Exness trading account — and tried my luck.</p>
                <p className="text-red-400 font-semibold">In less than 24 hours, I blew the account. All my money was gone.</p>
                <p>It was extremely painful. But I soon realised it was because I didn&apos;t take the time to learn properly first. <span className="text-white font-semibold">This one mistake will always rob you of your capital.</span></p>
                <p>So I took a step back. I spent 8 hours each day for the rest of that year, locked in my room — reading books, learning from mentors, studying courses, making trades over and over again. After lots of backtesting, losses, and burning over <span className="text-white font-semibold">$3,500 (5 million naira)</span>… I finally found the system.</p>
              </div>
            </FadeUp>
            <FadeUp delay={0.15}>
              <Screenshot src={IMG(12)} alt="Blowing my first trading account" />
            </FadeUp>
          </div>
        </div>

        {/* Found the system — images 13, 14, 15 */}
        <div>
          <FadeUp>
            <div className="bg-[#40D457]/8 border border-[#40D457]/20 rounded-2xl p-6 mb-8 text-center">
              <p className="text-[#40D457] font-black text-xl">A 2-Step Trading System That Makes You $500, $1,000, or $3,000 Monthly</p>
              <p className="text-white/50 text-sm mt-1">Even if you&apos;re completely new to forex</p>
            </div>
          </FadeUp>
          <FadeUp delay={0.08}>
            <p className="text-white/60 text-base leading-relaxed mb-6 text-center max-w-2xl mx-auto">
              Not only has this winning system worked for me — even beginners I shared this strategy with began making serious profits:
            </p>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <FadeUp delay={0.1}>
              <Screenshot src={IMG(13)} alt="Student results using the 2-step trading system" />
            </FadeUp>
            <FadeUp delay={0.15}>
              <Screenshot src={IMG(14)} alt="Beginners making crazy profits with this system" />
            </FadeUp>
          </div>
          <FadeUp delay={0.2}>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-5">
              <p className="text-white/60 text-sm mb-4">See how Florence — a completely new trader — made $189 (over ₦300k) in profit after implementing this system:</p>
              <Screenshot src={IMG(15)} alt="Florence made $189 profit as a brand new trader" className="max-w-sm" />
            </div>
          </FadeUp>
        </div>

        {/* WhatsApp class + social proof — images 17, 18 */}
        <div>
          <FadeUp>
            <p className="text-white/60 text-base leading-relaxed mb-6">
              So I held a small WhatsApp class and shared this strategy — and in a few weeks, those who joined got results like this:
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Screenshot src={IMG(17)} alt="WhatsApp class student trading results" className="mb-8" />
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="text-white/60 text-base leading-relaxed mb-5">
              But even after the class, I kept seeing comments like this from people everywhere — eager to learn how to make life-changing money from the Forex market:
            </p>
            <Screenshot src={IMG(18)} alt="Social media comments requesting the forex system" />
          </FadeUp>
        </div>

        {/* Mid-page CTA */}
        <FadeUp>
          <div className="text-center">
            <p className="text-white/60 text-base mb-6">
              That&apos;s when I realised how many people needed this — people just like you, who want to escape the daily grind, spend confidently, and live life on their own terms.
            </p>
            <button onClick={onGetAccess}
              className="inline-flex items-center gap-2 bg-[#40D457] hover:bg-[#2eb847] text-[#0a1a20] font-black text-base px-10 py-4 rounded-2xl transition-all hover:shadow-[0_0_50px_rgba(64,212,87,0.4)]">
              I Want In — Show Me the System <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── The 2-Step System ─── */
function TwoStepSystem() {
  return (
    <section className="py-20" style={{ background: "#070f14" }}>
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp className="text-center mb-14">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">The Method</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            Here&apos;s What You Need to Know About This <span className="text-[#40D457]">2-Step Trading System</span>
          </h2>
          <p className="text-white/50 text-base max-w-2xl mx-auto">
            It&apos;s built on the same principles that major market players — like banks and institutions — use to influence the market. Two core elements:
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <FadeUp delay={0.1}>
            <div className="relative bg-[#40D457]/8 border border-[#40D457]/25 rounded-3xl p-8 overflow-hidden h-full">
              <div className="absolute top-4 right-6 text-7xl font-black text-[#40D457]/10 pointer-events-none select-none">1</div>
              <div className="w-12 h-12 rounded-2xl bg-[#40D457]/15 border border-[#40D457]/30 flex items-center justify-center mb-5">
                <span className="text-[#40D457] font-black text-lg">S</span>
              </div>
              <h3 className="text-white font-black text-2xl mb-3">Structure</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                The overall direction of the market. Structure tells you <span className="text-white font-semibold">where</span> the market is actually going — not what a lagging indicator shows. When you know the structure, you never trade against the flow again.
              </p>
              <ul className="space-y-2">
                {["Identify bullish vs. bearish market phases", "Spot break of structure (BOS) and change of character (CHoCH)", "Trade in alignment with where price is actually headed"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-white/60 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="relative bg-[#40D457]/8 border border-[#40D457]/25 rounded-3xl p-8 overflow-hidden h-full">
              <div className="absolute top-4 right-6 text-7xl font-black text-[#40D457]/10 pointer-events-none select-none">2</div>
              <div className="w-12 h-12 rounded-2xl bg-[#40D457]/15 border border-[#40D457]/30 flex items-center justify-center mb-5">
                <span className="text-[#40D457] font-black text-lg">L</span>
              </div>
              <h3 className="text-white font-black text-2xl mb-3">Liquidity</h3>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                The money flowing in and out of the market. Liquidity is where the big players go to fill their orders. When you know where liquidity sits, you know exactly where price is about to move — <span className="text-white font-semibold">before it gets there.</span>
              </p>
              <ul className="space-y-2">
                {["Identify buy-side and sell-side liquidity zones", "Anticipate stop hunts before they happen", "Enter trades where smart money is entering — not after"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-white/60 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.2}>
          <div className="bg-white/4 border border-white/10 rounded-2xl p-7 mb-8">
            <p className="text-white text-base font-semibold mb-3">Here&apos;s how this simple strategy combination works to make you $1,000 in a month:</p>
            <p className="text-white/55 text-sm leading-relaxed mb-2">
              <span className="text-[#40D457] font-bold">Step 1:</span> Use structure and liquidity to understand what&apos;s really happening — where the big players are moving and where liquidity is hiding.
            </p>
            <p className="text-white/55 text-sm leading-relaxed">
              <span className="text-[#40D457] font-bold">Step 2:</span> Use my 4 &ldquo;Greenlight Pairs&rdquo; — 4 special timeframe combinations that keep you 1 step ahead of the market — to mark out safe entry zones with high-profit potential, like in the chart below:
            </p>
          </div>
        </FadeUp>

        {/* Image 16: Greenlight Pairs chart */}
        <FadeUp delay={0.25}>
          <Screenshot src={IMG(16)} alt="Greenlight Pairs chart showing high-probability entry zones" className="max-w-2xl mx-auto mb-4" />
          <p className="text-center text-white/35 text-xs">These Greenlight Pairs show you the best places to make a trade — a higher chance to profit with less risk. Like getting a green light for your trades.</p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Curriculum ─── */
function Curriculum() {
  const parts = [
    {
      num: "Part 1", title: "Foundation & Market Structure",
      items: [
        "The #1 insider knowledge you MUST have before trading the forex market",
        "The 3 best tools you need to become profitable in Forex trading",
        "Step-by-step: how to set up and verify your live trading account",
        "The easiest way to analyse the Forex market with 5 basic tools",
        "8 basic concepts you NEED to know before technical analysis",
        "Understanding market trends and the simple way to identify them",
      ],
    },
    {
      num: "Part 2", title: "The 2-Step System: Structure, Liquidity & Entries",
      items: [
        "The #1 ugly reason why most traders hit stop loss and lose their money",
        "How to find the market 'sweet spot' under 3 conditions",
        "The 2 'structure scenarios' that expose a High Probability Trade",
        "My 4 'Greenlight Pairs' to find an entry zone in the market sweet spot",
        "How to set up your Entry, Take Profit (TP), and Stop Loss (SL)",
        "My Secret 2SP framework to find a profitable Buy/Sell setup",
      ],
    },
    {
      num: "Part 3", title: "Trading Plan, Psychology & Consistency",
      items: [
        "How to perform a Top-down Analysis before entering any trade",
        "How to minimise your risk using Confirmation Entries",
        "How to calculate your lot size easily for any capital size",
        "Building your complete personal trading plan",
        "Trading psychology: dealing with losses, discipline, and patience",
        "Live trade walkthroughs and real market analysis with Caleb",
      ],
    },
  ];

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #070f14 0%, #0d1f2b 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <FadeUp className="text-center mb-14">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">The Curriculum</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            What You&apos;ll Learn in the <span className="text-[#40D457]">Forex Income Blueprint</span>
          </h2>
        </FadeUp>
        <div className="space-y-4">
          {parts.map((part, i) => (
            <FadeUp key={part.num} delay={i * 0.1}>
              <div className={`border rounded-2xl overflow-hidden transition-colors ${open === i ? "border-[#40D457]/40 bg-[#40D457]/5" : "border-white/10 bg-white/3"}`}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-6 py-5 text-left">
                  <div className="flex items-center gap-4">
                    <span className="text-[#40D457] text-xs font-black uppercase tracking-widest w-14 shrink-0">{part.num}</span>
                    <span className="text-white font-bold text-base">{part.title}</span>
                  </div>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="h-5 w-5 text-white/40" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <div className="px-6 pb-6 grid sm:grid-cols-2 gap-2.5">
                        {part.items.map((item) => (
                          <div key={item} className="flex items-start gap-2.5">
                            <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0 mt-0.5" />
                            <span className="text-white/60 text-sm leading-relaxed">{item}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── What's Included ─── */
function WhatsIncluded({ onGetAccess }: { onGetAccess: () => void }) {
  return (
    <section className="py-20" style={{ background: "#070f14" }}>
      <div className="max-w-5xl mx-auto px-6">
        <FadeUp className="text-center mb-6">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Everything You Get</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            Here&apos;s What&apos;s Inside the <span className="text-[#40D457]">Forex Income System</span>
          </h2>
        </FadeUp>

        {/* Image 19: FIS graphic */}
        <FadeUp delay={0.08} className="mb-14">
          <Screenshot src={IMG(19)} alt="The Forex Income System overview graphic" className="max-w-xl mx-auto" />
        </FadeUp>

        {/* Part 1 */}
        <div className="mb-14">
          <FadeUp>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-[#40D457]/15 border border-[#40D457]/30 text-[#40D457] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Part 1</span>
              <h3 className="text-white font-black text-xl">The Forex Income Blueprint (FIB)</h3>
              <span className="text-white/30 text-sm line-through ml-auto">₦1,265,000</span>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Image 20: Part 1 graphic */}
            <FadeUp delay={0.08}>
              <Screenshot src={IMG(20)} alt="Forex Income Blueprint Part 1 course content" />
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>I break down everything you need to succeed — from beginner-friendly basics to advanced concepts — so you can understand the market, take profits, and avoid losses, even if you&apos;ve never read a chart before.</p>
                {["Beginner-Friendly Basics (Value ₦345,000)", "Understanding Technical Analysis in its simplest form (Value ₦150,000)", "Introduction to the 2-Step Trading System (Value ₦635,000)", "Market Timeframe Uses and Secrets", "Top-down Analysis for complete market overview (Value ₦70,000)", "Confirmation Entries to minimise risk (Value ₦55,000)", "Lot size calculation and risk management (Value ₦10,000)"].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
          {/* Image 21: Dayo testimonial */}
          <FadeUp delay={0.2} className="mt-8">
            <p className="text-white/50 text-sm mb-4">Here&apos;s what my student Dayo has to say after going through the FIB:</p>
            <Screenshot src={IMG(21)} alt="Dayo's testimonial after completing the Forex Income Blueprint" className="max-w-md" />
          </FadeUp>
        </div>

        {/* Part 2 */}
        <div className="mb-14">
          <FadeUp>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-[#40D457]/15 border border-[#40D457]/30 text-[#40D457] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Part 2</span>
              <h3 className="text-white font-black text-xl">The Exclusive 24/7 Support Community</h3>
              <span className="text-white/30 text-sm line-through ml-auto">₦300,000</span>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Image 22: Part 2 community */}
            <FadeUp delay={0.08}>
              <Screenshot src={IMG(22)} alt="FIB 24/7 support community on Telegram" />
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="space-y-3 text-white/60 text-sm leading-relaxed">
                <p>Whenever you get confused or need help, just drop your message in this private, always-active Telegram support community and we&apos;ll help within 24 hours.</p>
                {["Real-time feedback on your analysis from experienced traders", "Exclusive tips, strategies, and updates you won't find anywhere else", "Regular live trading sessions with Q&A periods (+ recordings)", "A supportive environment where no question is too small"].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Part 3 */}
        <div className="mb-10">
          <FadeUp>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-[#40D457]/15 border border-[#40D457]/30 text-[#40D457] text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">Part 3</span>
              <h3 className="text-white font-black text-xl">The Copy Trade Group</h3>
              <span className="text-white/30 text-sm line-through ml-auto">₦100,000</span>
            </div>
          </FadeUp>
          {/* Image 23: Part 3 copy trade group */}
          <FadeUp delay={0.08}>
            <Screenshot src={IMG(23)} alt="FIM Copy Trade Group" className="max-w-xl mx-auto mb-6" />
          </FadeUp>
          <FadeUp delay={0.12}>
            <p className="text-white/60 text-sm leading-relaxed mb-6 text-center max-w-2xl mx-auto">
              You get 2 months free access to this Copy Trade Group. We send you market analysis, updates, and instructions for each trade — so you understand the setup, know when to avoid losses early, and get profitable results.
            </p>
          </FadeUp>
          {/* Images 24, 25: copy trade instructions + results */}
          <div className="grid md:grid-cols-2 gap-6">
            <FadeUp delay={0.15}>
              <div>
                <p className="text-white/40 text-xs text-center mb-2">Copy trade instructions we send you:</p>
                <Screenshot src={IMG(24)} alt="Copy trade market analysis and instructions" />
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div>
                <p className="text-white/40 text-xs text-center mb-2">Results members are getting:</p>
                <Screenshot src={IMG(25)} alt="Copy trade profitable results from members" />
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Value summary + CTA */}
        <FadeUp delay={0.3}>
          <div className="bg-[#40D457]/8 border border-[#40D457]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <p className="text-white font-semibold text-base">Total value of Parts 1, 2 & 3:</p>
            <div className="flex items-center gap-3">
              <span className="text-white/40 text-lg line-through">₦1,665,000</span>
              <span className="text-[#40D457] text-2xl font-black">₦50,000</span>
            </div>
          </div>
          <div className="text-center">
            <button onClick={onGetAccess}
              className="inline-flex items-center gap-2 bg-[#40D457] hover:bg-[#2eb847] text-[#0a1a20] font-black text-base px-10 py-4 rounded-2xl transition-all hover:shadow-[0_0_50px_rgba(64,212,87,0.4)]">
              Get Everything for ₦50,000 <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Bonuses ─── */
function Bonuses() {
  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #0d1f2b 0%, #070f14 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">

        {/* 3 Trading Secrets */}
        <FadeUp className="text-center mb-10">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Included Free with Your Membership</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
            The 3 Trading Secrets to Become <span className="text-[#40D457]">Consistently Profitable</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">Used by the top 4% of traders who are constantly profitable. You get these free when you join.</p>
        </FadeUp>

        {/* Secret 1 — image 26 */}
        <FadeUp delay={0.08}>
          <div className="bg-white/4 border border-white/10 rounded-2xl p-7 mb-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-[#40D457] text-xs font-black uppercase tracking-widest mb-2">Secret 1</p>
                <h3 className="text-white font-black text-xl mb-3">Strict Risk Management</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  95% of my success has been thanks to strict risk management. Without this, it doesn&apos;t matter the strategy you use — you will always lose your capital. I&apos;ll show you my secret to controlling your risk appetite so you make the most profit while taking the least losses.
                </p>
                <p className="text-white/40 text-xs mt-4">A student testifying how applying this helped their journey:</p>
              </div>
              <Screenshot src={IMG(26)} alt="Student testimonial about risk management results" />
            </div>
          </div>
        </FadeUp>

        {/* Secret 2 — image 27 */}
        <FadeUp delay={0.1}>
          <div className="bg-white/4 border border-white/10 rounded-2xl p-7 mb-6">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="text-[#40D457] text-xs font-black uppercase tracking-widest mb-2">Secret 2</p>
                <h3 className="text-white font-black text-xl mb-3">Psychology Control</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Most traders never become consistently profitable because they let emotions control them — closing a trade approaching TP out of fear, or revenge trading after a loss. I will show you how to develop a strong trading mind that won&apos;t allow emotions to ruin your profitability.
                </p>
                <p className="text-white/40 text-xs mt-4">See how Muhammad celebrated becoming profitable:</p>
              </div>
              <Screenshot src={IMG(27)} alt="Muhammad's testimonial about psychology control" />
            </div>
          </div>
        </FadeUp>

        {/* Secret 3 */}
        <FadeUp delay={0.12}>
          <div className="bg-white/4 border border-white/10 rounded-2xl p-7 mb-16">
            <p className="text-[#40D457] text-xs font-black uppercase tracking-widest mb-2">Secret 3</p>
            <h3 className="text-white font-black text-xl mb-3">Journaling</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
              A lot of traders don&apos;t take this seriously and wonder why they&apos;re not profitable. Journaling your trades helps you spot patterns, improve your strategy, and avoid repeating mistakes. There&apos;s an easy way to do it — you&apos;ll discover it once you join.
            </p>
          </div>
        </FadeUp>

        {/* Fast-Action Bonuses */}
        <FadeUp>
          <div className="text-center mb-10">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">Fast-Action Bonuses</p>
            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              4 Bonuses for the <span className="text-[#40D457]">First Members Only</span>
            </h2>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-full px-5 py-2">
              <Clock className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-amber-400 text-sm font-bold">Only for the first 10 traders — once spots are filled, bonuses are removed.</span>
            </div>
          </div>
        </FadeUp>

        <div className="space-y-8">
          {/* Bonus 1 */}
          <FadeUp delay={0.08}>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-black text-xs">B1</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Free Journaling Software</h3>
                  <span className="text-white/30 text-xs line-through">Value ₦30,000</span>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed">I will share the free software that makes it super easy to journal and record your trading progress — so you can track every trade, spot patterns in your performance, and improve week over week. Most traders never journal. That&apos;s why most traders never improve.</p>
            </div>
          </FadeUp>

          {/* Bonus 2 — image 28 */}
          <FadeUp delay={0.1}>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-black text-xs">B2</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Secrets to Passing Prop Firm Accounts</h3>
                  <span className="text-white/30 text-xs line-through">Value ₦120,000</span>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-5">Prop firm accounts allow you to trade large capital without taking huge financial risks — $50,000–$200,000 of someone else&apos;s money. I&apos;ll show you exactly how to pass the challenge and get funded. Emmanuel and Usman got funded using these secrets:</p>
              <Screenshot src={IMG(28)} alt="Emmanuel and Usman got funded by prop firms" className="max-w-md" />
            </div>
          </FadeUp>

          {/* Bonus 3 — images 29, 30 */}
          <FadeUp delay={0.12}>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-black text-xs">B3</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Secrets to Flipping Accounts</h3>
                  <span className="text-white/30 text-xs line-through">Value ₦100,000</span>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-5">Account flipping is a double-edged sword — it can make you crazy money quickly or blow your account in the blink of an eye. But there&apos;s a smarter, more strategic way. I&apos;ll reveal how to trade small capital and flip it for bigger profits, just like Dominion and Eruditech did:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Screenshot src={IMG(29)} alt="Dominion account flipping results" />
                <Screenshot src={IMG(30)} alt="Eruditech account flipping results" />
              </div>
            </div>
          </FadeUp>

          {/* Bonus 4 — image 31 */}
          <FadeUp delay={0.14}>
            <div className="bg-white/4 border border-white/10 rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                  <span className="text-amber-400 font-black text-xs">B4</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">Trading Synthetic Markets</h3>
                  <span className="text-white/30 text-xs line-through">Value ₦150,000</span>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed mb-5">I&apos;ll show you how to apply the same system on Volatility Index (synthetic indices) — markets open 24/7, 365 days a year, with no bank manipulation. A student used this method to turn $10 into ₦1.2 million naira:</p>
              <Screenshot src={IMG(31)} alt="Student turned $10 into 1.2 million naira trading synthetics" className="max-w-md" />
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.3} className="mt-10">
          <div className="bg-amber-500/6 border border-amber-500/15 rounded-2xl p-5 text-center">
            <p className="text-amber-400/80 text-sm">Total fast-action bonus value: <span className="text-amber-400 font-bold line-through mr-2">₦400,000</span> — free for founding members only.</p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  const testimonials = [
    { name: "Adewale S.", location: "Lagos", text: "I spent 2 years in signal groups and blew 3 accounts. After FIB, I finally understand WHY price moves. I passed my prop firm challenge in 6 weeks. The liquidity concept alone is worth 10x the price.", stars: 5 },
    { name: "Chiamaka O.", location: "Port Harcourt", text: "Caleb teaches in a way that makes sense. No complexity, no jargon. Just structure and liquidity. I went from losing every trade to hitting 3 out of every 4 setups. My account is growing for the first time.", stars: 5 },
    { name: "Ibrahim K.", location: "Abuja", text: "What changed everything for me was understanding that the market doesn't move randomly — it moves to collect liquidity. Once I saw that, I couldn't unsee it. I now trade with complete confidence.", stars: 5 },
  ];

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(t);
  }, [testimonials.length]);

  return (
    <section className="py-20" style={{ background: "#070f14" }}>
      <div className="max-w-3xl mx-auto px-6">
        <FadeUp className="text-center mb-12">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Student Results</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Real Traders. <span className="text-[#40D457]">Real Results.</span></h2>
        </FadeUp>
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }}
              className="bg-white/4 border border-white/10 rounded-3xl p-8 md:p-10">
              <div className="flex gap-1 mb-5">
                {Array.from({ length: testimonials[idx].stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#40D457] text-[#40D457]" />)}
              </div>
              <p className="text-white text-xl md:text-2xl font-semibold leading-relaxed mb-8">&ldquo;{testimonials[idx].text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#40D457]/15 border border-[#40D457]/25 flex items-center justify-center">
                  <span className="text-[#40D457] font-bold text-sm">{testimonials[idx].name[0]}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonials[idx].name}</p>
                  <p className="text-white/40 text-xs">{testimonials[idx].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`transition-all duration-300 rounded-full ${i === idx ? "w-6 h-2 bg-[#40D457]" : "w-2 h-2 bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── 3 Options ─── */
function ThreeOptions() {
  const options = [
    { label: "Option 1", title: "Do Nothing", desc: "Close this page and go back to the same strategies that haven't brought you consistent profits. Keep risking your capital in the same frustrating cycle. Nothing changes.", color: "border-red-500/20 bg-red-500/4", labelColor: "text-red-400", icon: "❌" },
    { label: "Option 2", title: "Figure It Out Yourself", desc: "Spend 2–5 more years trial and error. Blow more accounts. Buy more courses that don't teach the institutional model. Without a proven system, your chances of becoming consistently profitable are slim.", color: "border-amber-500/20 bg-amber-500/4", labelColor: "text-amber-400", icon: "⚠️" },
    { label: "Option 3", title: "Join the Forex Income System", desc: "Fast-track your success. Get the complete 2-Step System, expert guidance, copy trades while you learn, and an active support community — all for the 75% discount price of ₦50,000.", color: "border-[#40D457]/30 bg-[#40D457]/6", labelColor: "text-[#40D457]", icon: "✅" },
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #070f14 0%, #0d1f2b 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <FadeUp className="text-center mb-14">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Your Decision</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Right Now, You Have <span className="text-[#40D457]">3 Options</span></h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-6">
          {options.map((o, i) => (
            <FadeUp key={o.label} delay={i * 0.12}>
              <div className={`border rounded-2xl p-7 h-full flex flex-col ${o.color}`}>
                <div className="text-3xl mb-3">{o.icon}</div>
                <span className={`text-xs font-black uppercase tracking-widest mb-2 ${o.labelColor}`}>{o.label}</span>
                <h3 className="text-white font-bold text-lg mb-3">{o.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed flex-1">{o.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Get Access / Pricing ─── */
function GetAccess({ onGetAccess }: { onGetAccess: () => void }) {
  const included = [
    "Forex Income Blueprint (FIB) full video course",
    "24/7 Support Community with Caleb's team",
    "Copy Trade Group — mirror live trades while you learn",
    "3 Trading Secrets: Risk Management, Psychology, Journaling",
    "Free Journaling Software (Bonus 1)",
    "Secrets to Passing Prop Firm Accounts (Bonus 2)",
    "Secrets to Flipping Accounts (Bonus 3)",
    "Trading Synthetic Markets Masterclass (Bonus 4)",
  ];

  return (
    <section id="get-access" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #070f14 0%, #0a2210 100%)" }}>
      <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#40D457]/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        <FadeUp className="text-center mb-10">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Get Access</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">Join the Forex Income System</h2>
          <p className="text-white/50 text-base">Everything you need to start trading with the institutional model and build a real, consistent forex income.</p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="relative">
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-[#40D457]/30 to-[#122F38]/20 blur-sm" />
            <div className="relative bg-[#0d1f2b] border border-[#40D457]/20 rounded-3xl overflow-hidden">
              <div className="px-7 sm:px-9 py-8 border-b border-white/8 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f2a18 0%, #0d1f2b 100%)" }}>
                <div className="absolute inset-0 pointer-events-none" style={dotGrid} />
                <div className="relative z-10">
                  <span className="inline-block bg-[#40D457]/15 border border-[#40D457]/25 text-[#40D457] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Founding Member Price — 75% OFF</span>
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-1 mb-1">
                    <span className="text-5xl sm:text-6xl font-black text-white leading-none">₦50,000</span>
                    <div className="flex flex-col pb-1 gap-0.5">
                      <span className="text-white/35 text-sm line-through">₦200,000</span>
                      <span className="text-[#40D457] text-xs font-bold">You save ₦150,000</span>
                    </div>
                  </div>
                  <p className="text-white/45 text-sm mt-2">Total value: <span className="line-through">₦1,665,000 course</span> + <span className="line-through">₦400,000 bonuses</span> = ₦2,065,000+</p>
                </div>
              </div>
              <div className="px-7 sm:px-9 py-8">
                <p className="text-white/50 text-sm font-semibold uppercase tracking-widest mb-5">Everything included:</p>
                <div className="space-y-3 mb-8">
                  {included.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="h-4 w-4 text-[#40D457] shrink-0 mt-0.5" />
                      <span className="text-white/70 text-sm leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
                <button onClick={onGetAccess}
                  className="w-full py-4 rounded-2xl font-black text-base text-[#0a1a20] transition-all hover:shadow-[0_0_50px_rgba(64,212,87,0.4)] mb-4"
                  style={{ background: "linear-gradient(138deg, #2ec97a 0%, #40D457 100%)" }}>
                  Pay ₦50,000 & Get Instant Access →
                </button>
                <p className="text-center text-white/30 text-xs">Secure payment via Korapay. Course access sent to your email immediately after payment.</p>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    { q: "Is this a one-time payment?", a: "Yes. Once you pay ₦50,000, you're in for life. No renewals, no additional fees — your registration is a one-time payment that gives you lifetime access to the System and all its resources." },
    { q: "How much capital do I need to start trading?", a: "You can start with whatever level of capital you have right now. Students have made profits with very small accounts. We also teach you how to get funded by prop firms so you can trade large capital ($50K–$200K) without risking much of your own money." },
    { q: "I'm a beginner with zero knowledge. Can I join?", a: "Yes. That's exactly why I made sure to teach everything from scratch in the Forex Income System. It doesn't matter if you're new to forex or an experienced trader — you will find it simple to understand and start making money with what you learn inside." },
    { q: "Do I need a laptop?", a: "No. You can start trading with your smartphone. Of course it's easier with a laptop, but a lot of students in the Forex Income System make consistent profits with just their phones." },
    { q: "What if I have a 9-5 job?", a: "You have two options. First, you can take longer-term trades that take days or weeks to play out, so you check in during your free time. Second, you can use the Copy Trade Group to make money while learning at your own pace — so you never miss an opportunity even with a busy schedule." },
    { q: "How long before I can trade profitably?", a: "Most students who put in consistent effort start seeing results within 30–90 days. This is a skill — the more you practice and apply the system, the faster you progress. And with the copy trades running while you learn, you can start seeing returns immediately." },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20" style={{ background: "#070f14" }}>
      <div className="max-w-3xl mx-auto px-6">
        <FadeUp className="text-center mb-12">
          <p className="text-[#40D457] text-xs font-bold uppercase tracking-widest mb-3">Questions?</p>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">Frequently Asked <span className="text-[#40D457]">Questions</span></h2>
        </FadeUp>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.05}>
              <div className={`border rounded-xl overflow-hidden transition-colors ${open === i ? "border-[#40D457]/30 bg-[#40D457]/5" : "border-white/10 bg-white/3"}`}>
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left">
                  <span className="text-white font-semibold text-sm pr-4">{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown className="h-4 w-4 text-white/40" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-white/55 text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
        <FadeUp delay={0.4} className="mt-8 text-center">
          <p className="text-white/40 text-sm">Have another question? <a href="mailto:Averislimited@gmail.com" className="text-[#40D457] hover:underline">Email us at Averislimited@gmail.com</a></p>
        </FadeUp>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer style={{ background: "#050d12" }} className="border-t border-white/6">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AverisLogoMark size={28} />
            <div className="leading-none">
              <div className="font-black text-[13px] text-white tracking-[0.18em]">AVERIS</div>
              <div className="font-black text-[13px] text-[#40D457] tracking-[0.18em] -mt-0.5">ACADEMY</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">Home</Link>
            <Link href="/login" className="text-white/40 hover:text-white text-sm transition-colors">Sign In</Link>
            <Link href="/privacy-policy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy</Link>
          </div>
          <a href="mailto:Averislimited@gmail.com" className="text-[#40D457]/60 hover:text-[#40D457] text-sm font-semibold transition-colors">Support →</a>
        </div>
        <div className="mt-8 pt-6 border-t border-white/6 text-center">
          <p className="text-white/20 text-xs">© 2026 Averis Global Limited. All rights reserved. Forex trading involves significant risk of loss. Past results are not indicative of future performance.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Export ─── */
export default function ForexSalesPageContent({ affiliateCode }: { affiliateCode?: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "1") setSuccess(true);
    }
  }, []);

  return (
    <main className="overflow-x-hidden">
      <AnimatePresence>
        {success && <SuccessBanner />}
        {modalOpen && <PaymentModal affiliateCode={affiliateCode} onClose={() => setModalOpen(false)} />}
      </AnimatePresence>

      <Navbar onGetAccess={() => setModalOpen(true)} />
      <Hero onGetAccess={() => setModalOpen(true)} />
      <ProblemSection />
      <EducatorSection onGetAccess={() => setModalOpen(true)} />
      <TwoStepSystem />
      <Curriculum />
      <WhatsIncluded onGetAccess={() => setModalOpen(true)} />
      <Bonuses />
      <Testimonials />
      <ThreeOptions />
      <GetAccess onGetAccess={() => setModalOpen(true)} />
      <FAQ />
      <Footer />
    </main>
  );
}
