"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, Clock, Play } from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { courseCover, lessonThumb, type CourseSummary } from "@/lib/academy";
import { resumeHref } from "@/components/features/academy/course-card";
import { ProgressBar, Reveal, Thumb } from "@/components/features/academy/primitives";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface DashboardData {
  user: {
    firstName: string; lastName: string; email: string; referralCode: string;
    profileImage: string | null; isEmailVerified: boolean; subscriptionExpiresAt: string | null;
    bankDetails: { bankName: string; accountNumber: string } | null;
  };
  stats: {
    totalEarnings: number; availableBalance: number; pendingWithdrawals: number;
    totalWithdrawn: number; totalReferrals: number; activeReferrals: number;
    pendingEarnings: number;
  };
  chartData: { month: string; earnings: number }[];
  recentReferrals: Array<{ referredUserId: { firstName: string; lastName: string; email: string; createdAt: string }; status: string; createdAt: string }>;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white px-4 py-4 sm:px-6 sm:py-5">
      <p className="text-[13px] text-ink-soft">{label}</p>
      <p className="mt-1.5 truncate text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-ink sm:text-[26px]">{value}</p>
      {sub && <p className="mt-0.5 text-[12.5px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function ContinueLearning({ course }: { course: CourseSummary }) {
  return (
    <Link
      href={resumeHref(course)}
      className="group flex items-center gap-4 rounded-lg border border-line bg-white p-3 pr-4 transition-shadow hover:shadow-[0_12px_28px_-16px_rgba(16,36,43,0.35)] sm:gap-5"
    >
      <Thumb src={course.thumbnailUrl || lessonThumb(course.resumeLesson) || courseCover(course)} className="w-28 shrink-0 rounded-md sm:w-40">
        <span className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/35">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
          </span>
        </span>
      </Thumb>
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-medium text-accent-ink">{course.lastWatchedAt ? "Continue learning" : "Start learning"}</p>
        <p className="mt-0.5 truncate text-[15px] font-semibold text-ink">{course.title}</p>
        {course.resumeLesson && <p className="truncate text-[13px] text-ink-soft">{course.resumeLesson.title}</p>}
        <div className="mt-2.5 flex items-center gap-3">
          <ProgressBar value={course.progressPct} className="max-w-[200px]" />
          <span className="shrink-0 text-[12px] tabular-nums text-ink-faint">{course.progressPct}%</span>
        </div>
      </div>
      <ArrowRight className="hidden h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink sm:block" />
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="skeleton h-9 w-64 rounded" />
      <div className="skeleton h-[104px] rounded-lg" />
      <div className="skeleton h-[110px] rounded-lg" />
      <div className="skeleton h-[280px] rounded-lg" />
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const activated = searchParams.get("activated") === "1";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [learning, setLearning] = useState<CourseSummary | null>(null);

  useEffect(() => {
    fetch("/api/academy")
      .then((r) => r.json())
      .then((d) => {
        const courses: CourseSummary[] = d.courses ?? [];
        const recent = courses
          .filter((c) => c.lastWatchedAt && c.progressPct < 100)
          .sort((a, b) => +new Date(b.lastWatchedAt!) - +new Date(a.lastWatchedAt!))[0];
        setLearning(recent ?? courses.find((c) => c.progressPct < 100) ?? null);
      })
      .catch(() => {});
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <OverviewSkeleton />;

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-[16px] font-semibold text-ink">We couldn&apos;t load your dashboard</p>
        <p className="max-w-xs text-center text-[14px] text-ink-soft">Check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="mt-2 rounded-md border border-line bg-white px-4 py-2 text-[14px] font-semibold text-ink hover:bg-canvas">Try again</button>
      </div>
    );
  }

  const hasEarnings = data.chartData.some((d) => d.earnings > 0);

  return (
    <div className="space-y-8 lg:space-y-10">
      {activated && (
        <Reveal>
          <div className="flex items-start gap-3 rounded-lg border border-line bg-white px-4 py-3.5">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" />
            <div>
              <p className="text-[14px] font-semibold text-ink">Your account is active</p>
              <p className="text-[13.5px] text-ink-soft">Welcome to Averis Academy. Start with your first course below.</p>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal>
        <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">
          Welcome back, {data.user.firstName}
        </h1>
        <p className="mt-1 text-[14px] text-ink-soft">Your learning and affiliate activity in one place.</p>
      </Reveal>

      {learning && (
        <Reveal delay={0.05}>
          <ContinueLearning course={learning} />
        </Reveal>
      )}

      <Reveal delay={0.1}>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.015em] text-ink">Affiliate earnings</h2>
          <Link href="/dashboard/earnings" className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline">
            View earnings
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
          <Stat label="Total earned" value={formatCurrency(data.stats.totalEarnings)} />
          <Stat label="Available to withdraw" value={formatCurrency(data.stats.availableBalance)} />
          <Stat label="Sales made" value={String(data.stats.totalReferrals)} sub={`${data.stats.activeReferrals} active`} />
          <Stat label="Withdrawn" value={formatCurrency(data.stats.totalWithdrawn)} />
        </div>
        {data.stats.pendingEarnings > 0 && (
          <p className="mt-3 flex items-center gap-2 text-[13.5px] text-ink-soft">
            <Clock className="h-4 w-4 shrink-0 text-warning" />
            <span><span className="font-semibold text-ink">{formatCurrency(data.stats.pendingEarnings)}</span> is settling and will reach your balance within 24 hours.</span>
          </p>
        )}
      </Reveal>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Reveal delay={0.15} className="min-w-0">
          <div className="rounded-lg border border-line bg-white p-4 sm:p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-[16px] font-semibold text-ink">Last 6 months</h2>
              <p className="text-[12.5px] text-ink-faint">Commission earned</p>
            </div>
            {hasEarnings ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#40D457" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#40D457" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e3e7e4" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8b989c" }} axisLine={false} tickLine={false} />
                  <YAxis width={44} tick={{ fontSize: 11, fill: "#8b989c" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    cursor={{ stroke: "#c5ccc8", strokeDasharray: "3 3" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e3e7e4", boxShadow: "0 8px 24px -12px rgba(16,36,43,0.3)", fontSize: 13 }}
                    formatter={(v) => [formatCurrency(Number(v ?? 0)), "Earned"]}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#2eb847" fill="url(#earn)" strokeWidth={2} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center text-center">
                <p className="text-[14px] font-semibold text-ink">No commission yet</p>
                <p className="mt-1 max-w-xs text-[13.5px] text-ink-soft">Share your link from Products to promote — earnings will chart here.</p>
                <Link href="/dashboard/products" className="mt-4 rounded-md border border-line px-3.5 py-2 text-[13.5px] font-semibold text-ink hover:bg-canvas">
                  Get your link
                </Link>
              </div>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.2} className="min-w-0">
          <div className="rounded-lg border border-line bg-white">
            <div className="flex items-baseline justify-between border-b border-line px-4 py-4 sm:px-5">
              <h2 className="text-[16px] font-semibold text-ink">Recent sales</h2>
              <Link href="/dashboard/referrals" className="text-[13px] font-semibold text-ink underline-offset-4 hover:underline">View all</Link>
            </div>
            {data.recentReferrals.length > 0 ? (
              <ul className="divide-y divide-line">
                {data.recentReferrals.slice(0, 5).map((ref, i) => {
                  const name = `${ref.referredUserId?.firstName ?? ""} ${ref.referredUserId?.lastName ?? ""}`.trim();
                  return (
                    <li key={i} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-semibold text-ink-soft">
                        {getInitials(name || "?")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-ink">{name || "Customer"}</p>
                        <p className="text-[12.5px] text-ink-faint">{formatDate(ref.createdAt)}</p>
                      </div>
                      <span className={`text-[12.5px] font-medium capitalize ${ref.status === "active" ? "text-accent-ink" : ref.status === "pending" ? "text-[#a16207]" : "text-ink-faint"}`}>
                        {ref.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-5 py-10 text-center text-[13.5px] text-ink-soft">Sales from your affiliate link will appear here.</p>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
