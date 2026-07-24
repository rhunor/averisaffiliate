"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, X, ChevronDown } from "lucide-react";

const BG = "#070f14";
const GREEN = "#40D457";
const NAVY = "#122F38";

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Navbar({ joinHref }: { joinHref: string }) {
  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{ background: "rgba(7,15,20,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="30" height="24" viewBox="0 0 65 51" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="white" />
            <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill={GREEN} />
          </svg>
          <div>
            <div className="font-black text-[13px] text-white tracking-[0.18em] leading-none">AVERIS</div>
            <div className="font-black text-[13px] tracking-[0.18em] leading-none mt-0.5" style={{ color: GREEN }}>ACADEMY</div>
          </div>
        </div>
        <a
          href={joinHref}
          className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: GREEN, color: NAVY }}
        >
          Get Access →
        </a>
      </div>
    </header>
  );
}

function Hero({ joinHref }: { joinHref: string }) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32" style={{ background: BG }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, rgba(64,212,87,0.08) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[120px] pointer-events-none" style={{ background: `radial-gradient(ellipse, rgba(64,212,87,0.07) 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
        <FadeUp>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", border: "1px solid rgba(64,212,87,0.2)", color: GREEN }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
            1,385+ Nigerians Already Inside
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.0] tracking-tight mb-6 text-white">
            There Is a Version of You<br />
            <span style={{ color: GREEN }}>Already Earning Online.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            This Is How You Become That Person.
          </p>
          <p className="text-base leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            1,385+ Nigerians with nothing but a phone and a decision found a real way to earn online — students, parents, workers. People who had failed before, they all started exactly where you are right now.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <a
            href={joinHref}
            className="inline-flex items-center gap-2.5 text-base font-bold px-10 py-4 rounded-2xl transition-all hover:opacity-90 hover:shadow-[0_0_50px_rgba(64,212,87,0.4)]"
            style={{ background: GREEN, color: NAVY }}
          >
            I Want In — Show Me How It Works
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="py-20" style={{ background: "#0c1920" }}>
      <div className="max-w-3xl mx-auto px-5">
        <FadeUp>
          <div className="inline-block mb-8 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            Read This First
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-8 leading-snug">
            The Story Nobody Tells You Plainly
          </h2>
        </FadeUp>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          <FadeUp delay={0.05}>
            <p>Somewhere in Nigeria right now, there is a person doing the mental arithmetic again.</p>
            <p className="mt-4">Maybe it&apos;s the student calculating whether their parents&apos; money will last till the end of semester. Maybe it&apos;s the business person watching prices rise faster than profit. Maybe it&apos;s the graduate who has sent out so many applications that hope has started to feel like a habit rather than a belief.</p>
            <p className="mt-4">They are not lazy, they are not careless, not unambitious. They are simply working inside a system that was never built to make them wealthy — only to keep them moving.</p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <p>And somewhere in that quiet frustration, a question begins to form: <em style={{ color: "rgba(255,255,255,0.9)" }}>&quot;Is there another way?&quot;</em></p>
            <p className="mt-4">There is — but finding it honestly, without getting burned again, is harder than it sounds.</p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p>Most people looking for online income have already tried something — a free guide that turned into a recruitment pitch, hours of YouTube videos that left them more confused. A paid course — real money — that delivered vague advice over a slideshow.</p>
            <p className="mt-4">So they did what any intelligent person does after being burned more than once: they stopped believing it was possible for someone like them.</p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div className="rounded-2xl p-6 md:p-8 my-8" style={{ background: "rgba(64,212,87,0.07)", border: "1px solid rgba(64,212,87,0.15)" }}>
              <p className="text-lg md:text-xl font-semibold text-white leading-relaxed">
                Here is what nobody tells you plainly: the reason it didn&apos;t work was not you — it was the training. Most online courses are built to impress and not to teach. Actual learning feels completely different. When a system is broken down to honest simplicity, something shifts — not just your understanding, your belief about what&apos;s possible for you.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.25}>
            <p>That shift is what Digital Income Blueprint was built to create — not a course that impresses you. A system that moves you from where you are, using what you already have, toward income that is real, growing, and yours.</p>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Framework({ joinHref }: { joinHref: string }) {
  return (
    <section className="py-20" style={{ background: BG }}>
      <div className="max-w-4xl mx-auto px-5">
        <FadeUp className="text-center mb-14">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            The Framework
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-snug">
            If You Want To Make Money Online,<br />
            <span style={{ color: GREEN }}>There Are Only Two Ways To Do It</span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
            Every online income stream comes down to one of these two paths. Digital Income Blueprint hands you both, so you&apos;re never stuck with just one option.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FadeUp delay={0.1}>
            <div className="rounded-3xl p-8 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl font-black" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>1</div>
              <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GREEN }}>Way No. 1</div>
              <h3 className="text-2xl font-black text-white mb-4">Sell A Product</h3>
              <p style={{ color: "rgba(255,255,255,0.65)" }} className="text-base leading-relaxed">
                The easiest way is to create a digital product — a knowledge-based product you can&apos;t physically touch. With AI, you don&apos;t even need to be an expert: AI creates the product and the sales copy. You can even use a pen name and never show your face.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="rounded-3xl p-8 h-full" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 text-2xl font-black" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>2</div>
              <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: GREEN }}>Way No. 2</div>
              <h3 className="text-2xl font-black text-white mb-4">Use Leverage (Partnership Marketing)</h3>
              <p style={{ color: "rgba(255,255,255,0.65)" }} className="text-base leading-relaxed">
                You use someone else&apos;s time, product, and brand to make money. Partner with people who already own a product, sell it, and split the profit — the best fit if you don&apos;t want to create your own product.
              </p>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.2} className="text-center">
          <a href={joinHref} className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-2xl transition-all hover:opacity-90" style={{ background: GREEN, color: NAVY }}>
            Get Access to Both Frameworks →
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

const proofTestimonials = [
  {
    quote: "Good morning sir, I just make money again. I have made ₦87,500 since I joined 3 days ago.",
    name: "Debby",
    tag: "₦87,500 earned in her first 3 days",
    emoji: "💵",
  },
  {
    quote: "Your girl just made over 200K in 7 days 😳 If not for my schedule, I would have done even more.",
    name: "Laura",
    tag: "₦227,500 total — 11 sales — ₦140,000 withdrawn",
    emoji: "💰",
  },
  {
    quote: "I just made my first sale and I still can't believe it. This is just the beginning of my greatness in the community.",
    name: "Tijani",
    tag: "First affiliate sale confirmed · ₦17,500 commission",
    emoji: "🔔",
  },
  {
    quote: "Isaac made 6 sales and ₦111,500 in commission — and he only started a few weeks back.",
    name: "Isaac Afe",
    tag: "6 sales · ₦111,500 in commission",
    emoji: "📈",
  },
];

function SocialProof({ joinHref }: { joinHref: string }) {
  return (
    <section className="py-20" style={{ background: "#0c1920" }}>
      <div className="max-w-5xl mx-auto px-5">
        <FadeUp className="text-center mb-14">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            Don&apos;t Take Our Word For It
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-snug">
            These Are Unedited Screenshots<br />
            <span style={{ color: GREEN }}>Straight From Our Students</span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Nobody paid them to send these. Nobody asked. When something genuinely changes your situation, you can&apos;t help but talk about it.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {proofTestimonials.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.08}>
              <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-base text-white leading-relaxed mb-4 font-medium">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: GREEN }}>{t.tag}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.3} className="text-center">
          <a href={joinHref} className="inline-flex items-center gap-2 text-sm font-bold px-8 py-3.5 rounded-2xl transition-all hover:opacity-90" style={{ background: GREEN, color: NAVY }}>
            I Want These Results Too →
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

function Curriculum({ joinHref }: { joinHref: string }) {
  const phase1 = [
    { title: "The Demand Intelligence Engine", desc: "AI-powered niche discovery for beginners", value: "₦50,000" },
    { title: "The Practical Step-by-Step Prompt", desc: "The copy & paste model", value: "₦60,000" },
    { title: "AI Product Beyond Borders", desc: "Selling beyond Nigeria", value: "₦70,000" },
    { title: "One-Button AI Sales Page Creation", desc: "", value: "₦55,000" },
    { title: "Complete Done-For-You Product Launch", desc: "", value: "₦70,000" },
    { title: "The AI Automated Sales System", desc: "", value: "₦60,000" },
  ];

  const phase2 = [
    { title: "The Unique Partner Strategy", desc: "Find the best products & creators to partner with", value: "₦60,000" },
    { title: "Partnership Scaling Masterclass", desc: "", value: "₦50,000" },
    { title: "Life-Changing Sales Funnel & Marketing Strategies", desc: "", value: "₦65,000" },
    { title: "Facebook & TikTok Sales Hack", desc: "", value: "₦60,000" },
    { title: "Organic PATTS System", desc: "", value: "₦70,000" },
  ];

  return (
    <section className="py-20" style={{ background: BG }}>
      <div className="max-w-4xl mx-auto px-5">
        <FadeUp className="text-center mb-14">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            What Is Digital Income Blueprint
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-snug">
            Delivered In Two Phases,<br />
            <span style={{ color: GREEN }}>So You&apos;re Never Overwhelmed</span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.55)" }}>
            Everything unlocks in two clear phases, each one building on the last, so you master one income stream before stacking the next.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <FadeUp delay={0.1}>
            <div className="rounded-3xl p-7 h-full" style={{ background: "rgba(64,212,87,0.05)", border: "1px solid rgba(64,212,87,0.15)" }}>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: GREEN }}>Phase 1</div>
              <h3 className="text-xl font-black text-white mb-1">AI Income Generator</h3>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>AI product creation + done-for-you copy & paste system</p>
              <div className="space-y-3">
                {phase1.map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
                      <div>
                        <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                        {item.desc && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{item.desc}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: GREEN }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(64,212,87,0.15)" }}>
                <p className="text-right text-sm font-black" style={{ color: GREEN }}>Phase 1 Value: ₦365,000</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="rounded-3xl p-7 h-full" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>Phase 2</div>
              <h3 className="text-xl font-black text-white mb-1">Partner Acquisition Framework</h3>
              <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>The Digital Income Blueprint partnership system</p>
              <div className="space-y-3">
                {phase2.map((item) => (
                  <div key={item.title} className="flex items-start justify-between gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
                      <div>
                        <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                        {item.desc && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{item.desc}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: GREEN }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-right text-sm font-black text-white">Phase 2 Value: ₦305,000</p>
              </div>
            </div>
          </FadeUp>
        </div>

        <FadeUp delay={0.2}>
          <div className="rounded-2xl p-6 text-center mb-8" style={{ background: "rgba(64,212,87,0.08)", border: "1px solid rgba(64,212,87,0.2)" }}>
            <p className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>Phase 1 Value ₦365,000 &nbsp;+&nbsp; Phase 2 Value ₦305,000</p>
            <p className="text-3xl font-black text-white">TOTAL VALUE: <span style={{ color: GREEN }}>₦670,000</span></p>
          </div>
        </FadeUp>

        <FadeUp delay={0.25}>
          <div className="rounded-3xl p-7 mb-8" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🤝</span>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Plus: Access to the DIB Community</h3>
                <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  Getting Digital Income Blueprint also grants you access to the DIB Community — our private support and accountability community on Telegram, where you learn alongside hundreds of students and get direct access to Coach Caleb whenever you need help.
                </p>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.3} className="text-center">
          <a href={joinHref} className="inline-flex items-center gap-2 text-base font-bold px-10 py-4 rounded-2xl transition-all hover:opacity-90" style={{ background: GREEN, color: NAVY }}>
            Get Access to Everything Inside →
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

const communityQuotes = [
  {
    name: "Qudus Digitalz",
    source: "DIB Community · Telegram",
    quote: "Sir I still can't believe I can generate close to 20 leads just about yesterday night and this morning. This leveraging strategy is really working like mad 🔥🔥 Thank you so much boss Caleb.",
    highlight: "🔥 20 leads generated in one overnight session",
  },
  {
    name: "Laura",
    source: "DIB Community · Telegram",
    quote: "I came to give my testimony ooo 🎉 Your girl just made over 200K in 7 days 😳 If not of this medical school, I would have even done more.",
    highlight: "💵 ₦227,500 total earned · 11 sales · ₦140,000 withdrawn",
  },
  {
    name: "Favour",
    source: "DIB Community · Telegram",
    quote: "Boss, good morning. I just withdraw #130,000 from my partner account. Am so so happy 🙏 God bless you for me. This is more than my two months salary 😭😭",
    highlight: "💰 ₦130,000 withdrawn from her partner account",
  },
  {
    name: "Martina Nwosu",
    source: "@nwosu_martina · Twitter/X · Posted publicly",
    quote: "Joining Digital Income Blueprint is one of the good decisions I took. I have learnt a lot about affiliate marketing. The process is simplified, and our coach is always ready to help us out.",
    highlight: "🐦 Posted publicly on Twitter/X — unprompted",
  },
  {
    name: "Student",
    source: "DIB Community · Telegram",
    quote: "I've tried digital marketing on several occasions to no avail. But since this class commenced, my hope is rekindled. The simplicity of it makes me feel like by this time next year, I'll be one of the best digital marketers in this Internet space. EMPHASIS ON THE SIMPLICITY.",
    highlight: "✨ \"Emphasis on the simplicity\" — their words, not ours",
  },
  {
    name: "UO",
    source: "DIB Community · Telegram",
    quote: "Digital Income Blueprint has opened my eyes further to know that there are other ways that one can actually make extra income online for a better tomorrow — by simply using his android phone.",
    highlight: "📱 Earning with Android phone only",
  },
];

function CommunityTestimonials() {
  return (
    <section className="py-20" style={{ background: "#0c1920" }}>
      <div className="max-w-5xl mx-auto px-5">
        <FadeUp className="text-center mb-14">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            More From The Community
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-snug">
            The Same Story,<br />
            <span style={{ color: GREEN }}>Told Again and Again</span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            These are their own words, from our Telegram community and public posts. Every single one, real.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-5">
          {communityQuotes.map((q, i) => (
            <FadeUp key={q.name + i} delay={i * 0.07}>
              <div className="rounded-2xl p-6 h-full flex flex-col" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="mb-4">
                  <p className="text-sm font-bold text-white">{q.name}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{q.source}</p>
                </div>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>&ldquo;{q.quote}&rdquo;</p>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} style={{ color: GREEN }} className="text-xs">★</span>)}
                  </div>
                  <p className="text-xs font-semibold" style={{ color: GREEN }}>{q.highlight}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

const yesItems = [
  "You want to earn online but everything you've seen feels too expensive, too complicated, or too good to be true",
  "You only have a phone — and someone once told you that wasn't enough. It is.",
  "You are a student, a worker, a trader, a parent — anyone who needs income that doesn't depend entirely on trading hours for naira",
  "You've tried something like this before, it didn't work, and you're willing to consider the problem was the training — not you",
  "You want a coach who actually shows up — not a course that goes silent the moment your payment clears",
];
const noItems = [
  "You believe income should arrive without any learning or effort on your side",
  "You're not willing to watch the modules and actually implement what they teach",
];

function IsThisForYou({ joinHref }: { joinHref: string }) {
  return (
    <section className="py-20" style={{ background: BG }}>
      <div className="max-w-3xl mx-auto px-5">
        <FadeUp className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            Is This For You?
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-snug">
            Be Honest With Yourself<br />
            <span style={{ color: GREEN }}>For 30 Seconds</span>
          </h2>
          <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
            Digital Income Blueprint was built for a specific kind of person — one who is done waiting and willing to do something about it.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-3xl p-7 md:p-8 mb-5" style={{ background: "rgba(64,212,87,0.05)", border: "1px solid rgba(64,212,87,0.15)" }}>
            <div className="space-y-4">
              {yesItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <p className="text-sm text-white leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="rounded-3xl p-7 md:p-8 mb-10" style={{ background: "rgba(255,60,60,0.04)", border: "1px solid rgba(255,60,60,0.1)" }}>
            <div className="space-y-4">
              {noItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#ff6b6b" }} />
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.25} className="text-center">
          <a href={joinHref} className="inline-flex items-center gap-2 text-base font-bold px-10 py-4 rounded-2xl transition-all hover:opacity-90" style={{ background: GREEN, color: NAVY }}>
            Yes, This Is For Me →
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

const bonuses = [
  "12 months access to Averis Academy account",
  "Private DIB Community access",
  "Scaling Secret — the fastest way to scale to ₦2M/month and above",
  "The Faceless Business Partner Method",
  "Coach Caleb's personal marketing secrets",
  "Access to monthly cash challenges — and how to easily win them",
];

function Pricing({ joinHref }: { joinHref: string }) {
  return (
    <section className="py-20" style={{ background: "#0c1920" }}>
      <div className="max-w-2xl mx-auto px-5">
        <FadeUp className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            The Investment
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white leading-snug">
            You Won&apos;t Pay ₦670,000.<br />
            <span style={{ color: GREEN }}>Not Even ₦50,000.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            The best investment you can make is always in yourself — a skill that stays with you forever, and a community to back you up. This system can return your investment in weeks, not years.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-3xl overflow-hidden mb-6" style={{ border: "1px solid rgba(64,212,87,0.3)" }}>
            <div className="p-2 text-center text-sm font-black uppercase tracking-widest" style={{ background: GREEN, color: NAVY }}>
              🔥 FIRST 20 PEOPLE ONLY — 30% OFF
            </div>
            <div className="p-8 md:p-10" style={{ background: "rgba(255,255,255,0.03)" }}>
              <div className="text-center mb-8">
                <p className="text-sm line-through mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>Regular price: ₦50,000</p>
                <p className="text-6xl font-black text-white mb-1">₦35,000</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>One-time payment · Full access to both phases</p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  "Everything in Digital Income Blueprint: Phase 1 + Phase 2",
                  "Your Personal Affiliate/Partner Link: start earning immediately",
                  "Access to the DIB Community: your support & accountability community",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                    <p className="text-sm text-white">{item}</p>
                  </div>
                ))}
              </div>

              <a
                href={joinHref}
                className="block text-center text-lg font-black py-5 rounded-2xl transition-all hover:opacity-90 hover:shadow-[0_0_50px_rgba(64,212,87,0.4)]"
                style={{ background: GREEN, color: NAVY }}
              >
                Get Access, Pay Now — ₦35,000
              </a>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="rounded-3xl p-7 mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
              Early-Bird Bonuses
            </div>
            <h3 className="text-xl font-black text-white mb-1">The First 20 Also Get These 6 Bonuses</h3>
            <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Total value of these bonuses: Priceless.</p>
            <div className="space-y-3">
              {bonuses.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <p className="text-sm text-white">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="rounded-2xl p-5 text-sm leading-relaxed" style={{ background: "rgba(255,165,0,0.06)", border: "1px solid rgba(255,165,0,0.15)", color: "rgba(255,255,255,0.6)" }}>
            ⏰ <strong className="text-white">This offer is for the first 20 people.</strong> After that: the 30% discount ends, all 6 bonuses are removed, and coaching access closes.
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Do I really need no laptop?",
    a: "No. Every video, resource, and community interaction inside Digital Income Blueprint works entirely from your Android or iPhone. Many of our active earners have never opened a laptop.",
  },
  {
    q: "I've failed at online business before. What makes this different?",
    a: "The problem was almost certainly the training, not you. Confusion is the enemy of action — our students keep returning to the same word: simplicity. That's the entire design principle behind Digital Income Blueprint.",
  },
  {
    q: "How quickly can I make my first commission?",
    a: "Some students make their first sale within days of implementing. It depends on how quickly you go through the training and act on it — the training shows you what to do, the acting is your part.",
  },
  {
    q: "Will I have support after I join?",
    a: "Yes. You get access to the DIB Community — our private Telegram support and accountability group where Coach Caleb and hundreds of fellow students are active every day.",
  },
  {
    q: "What if I'm not a social media person, or don't have friends on social media?",
    a: "You don't need a following. The system works whether people know you or not — many top students have almost no social media presence.",
  },
  {
    q: "I don't know how to sell. What do I do?",
    a: "You're taught the exact scripts, funnels, and step-by-step process for both phases. You don't need prior sales experience.",
  },
  {
    q: "Will I be able to balance this with my job or school?",
    a: "Yes. Many of our students are 9-5 workers, undergraduates, and even medical students building this alongside their normal lives.",
  },
  {
    q: "Do I need to bring people in as referrals?",
    a: "No referrals required to benefit from the training — though our commission structure rewards you if you choose to share it.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20" style={{ background: BG }}>
      <div className="max-w-3xl mx-auto px-5">
        <FadeUp className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "rgba(64,212,87,0.1)", color: GREEN }}>
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">Answered Plainly</h2>
        </FadeUp>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.04}>
              <div
                className="rounded-2xl overflow-hidden cursor-pointer"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4 p-5">
                  <p className="text-sm font-bold text-white">{faq.q}</p>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform duration-300"
                    style={{ color: GREEN, transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </div>
                {open === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>{faq.a}</p>
                  </div>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA({ joinHref }: { joinHref: string }) {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background: "#0c1920" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, rgba(64,212,87,0.07) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[100px] pointer-events-none" style={{ background: `radial-gradient(ellipse, rgba(64,212,87,0.06) 0%, transparent 70%)` }} />

      <div className="relative z-10 max-w-3xl mx-auto px-5 text-center">
        <FadeUp>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
            Every Day You Wait, Someone<br />
            <span style={{ color: GREEN }}>Just Like You Is Making the Sale</span><br />
            You Could Have Made
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            They didn&apos;t wait for the perfect moment, a laptop, or more confidence. They saw a clear path and took one step. That step is in front of you right now — and it costs less than a month of transport fare.
          </p>
          <a
            href={joinHref}
            className="inline-flex items-center gap-2.5 text-lg font-black px-12 py-5 rounded-2xl transition-all hover:opacity-90 hover:shadow-[0_0_60px_rgba(64,212,87,0.4)]"
            style={{ background: GREEN, color: NAVY }}
          >
            I&apos;m Ready — Pay Now To Get Access
          </a>
          <p className="mt-5 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Averis Academy · © 2026 Digital Income Blueprint</p>
        </FadeUp>
      </div>
    </section>
  );
}

function PageFooter() {
  return (
    <footer className="py-8 text-center" style={{ background: BG, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
        © 2026 Averis Global Limited. All rights reserved. &nbsp;·&nbsp;{" "}
        <a href="/terms-of-service" style={{ color: "rgba(255,255,255,0.35)" }} className="hover:text-white transition-colors">Terms of Service</a>
        &nbsp;·&nbsp;{" "}
        <a href="/privacy-policy" style={{ color: "rgba(255,255,255,0.35)" }} className="hover:text-white transition-colors">Privacy Policy</a>
      </p>
    </footer>
  );
}

export default function DIBContent({ affiliateCode }: { affiliateCode?: string }) {
  const joinHref = affiliateCode ? `/join/${affiliateCode}` : "/login";

  return (
    <div style={{ background: BG, minHeight: "100vh" }}>
      <Navbar joinHref={joinHref} />
      <Hero joinHref={joinHref} />
      <Story />
      <Framework joinHref={joinHref} />
      <SocialProof joinHref={joinHref} />
      <Curriculum joinHref={joinHref} />
      <CommunityTestimonials />
      <IsThisForYou joinHref={joinHref} />
      <Pricing joinHref={joinHref} />
      <FAQ />
      <FinalCTA joinHref={joinHref} />
      <PageFooter />
    </div>
  );
}
