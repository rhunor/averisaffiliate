"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, ChevronDown, CreditCard, Settings, LogOut } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { SidebarLogo } from "./sidebar";

interface TopbarProps {
  onMenuClick: () => void;
}

// Keyed on the URL's ?q so the box resets when the academy page changes its own filter.
function CourseSearch() {
  const q = useSearchParams().get("q") ?? "";
  return <CourseSearchBox key={q} initial={q} />;
}

function CourseSearchBox({ initial }: { initial: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/dashboard/academy?q=${encodeURIComponent(term)}` : "/dashboard/academy");
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search courses"
        aria-label="Search courses"
        className="h-10 w-full rounded-full border border-line bg-canvas pl-10 pr-4 text-[14px] text-ink placeholder:text-ink-faint transition-colors focus:border-ink/30 focus:bg-white focus:outline-none focus:ring-4 focus:ring-ink/5"
      />
    </form>
  );
}

function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = session?.user as unknown as Record<string, unknown> | undefined;
  const name = (user?.name as string) || "";
  const email = (user?.email as string) || "";
  const profileImage = user?.profileImage as string | null;
  const isLifetime = user?.isLifetime as boolean;
  const expires = user?.subscriptionExpiresAt as string | null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const membership = isLifetime
    ? "Lifetime membership"
    : expires
      ? `Membership renews ${formatDate(expires)}`
      : "Active membership";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-canvas"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-bold text-white">
          {profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover" /> : getInitials(name || "U")}
        </span>
        <ChevronDown className={`hidden h-4 w-4 text-ink-faint transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-64 origin-top-right overflow-hidden rounded-lg border border-line bg-white shadow-[0_12px_32px_-8px_rgba(16,36,43,0.18)]"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="truncate text-[14px] font-semibold text-ink">{name}</p>
              <p className="truncate text-[12px] text-ink-faint">{email}</p>
              <p className="mt-2 text-[12px] text-accent-ink">{membership}</p>
            </div>
            <div className="p-1.5">
              {[
                { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
                { href: "/dashboard/settings", label: "Settings", icon: Settings },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink"
                >
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              ))}
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="-ml-1.5 rounded-md p-1.5 text-ink hover:bg-canvas lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="lg:hidden">
          <SidebarLogo />
        </div>

        <div className="hidden flex-1 md:flex">
          <Suspense>
            <CourseSearch />
          </Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link
            href="/dashboard/academy"
            className="hidden rounded-md px-3 py-1.5 text-[14px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink sm:block"
          >
            My learning
          </Link>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
