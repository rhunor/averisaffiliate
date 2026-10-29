"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ShoppingBag,
  GraduationCap,
  Banknote,
  Users,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

const navGroups = [
  {
    label: "Learn",
    items: [
      { label: "My learning", href: "/dashboard/academy", icon: GraduationCap },
    ],
  },
  {
    label: "Affiliate",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
      { label: "Products to promote", href: "/dashboard/products", icon: ShoppingBag },
      { label: "Earnings", href: "/dashboard/earnings", icon: Banknote },
      { label: "Affiliate sales", href: "/dashboard/referrals", icon: Users },
      { label: "Withdrawals", href: "/dashboard/withdrawals", icon: Wallet },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

type NavItemDef = (typeof navGroups)[number]["items"][number] & { exact?: boolean };

function AverisLogoMark() {
  return (
    <svg width="28" height="22" viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="#122F38"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
    </svg>
  );
}

export function SidebarLogo() {
  return (
    <Link href="/dashboard/academy" className="flex items-center gap-2.5">
      <AverisLogoMark />
      <span className="text-[15px] font-bold tracking-tight text-ink">
        Averis <span className="font-medium text-ink-soft">Academy</span>
      </span>
    </Link>
  );
}

function NavItem({ item, onClose }: { item: NavItemDef; onClose: () => void }) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClose}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors duration-150",
        active ? "font-semibold text-ink" : "text-ink-soft hover:bg-canvas hover:text-ink"
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-md bg-canvas"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        >
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-secondary" />
        </motion.span>
      )}
      <item.icon className={cn("relative h-[18px] w-[18px] shrink-0", active ? "text-ink" : "text-ink-faint")} strokeWidth={1.75} />
      <span className="relative truncate">{item.label}</span>
    </Link>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const name = session?.user?.name || "";
  const email = session?.user?.email || "";
  const profileImage = (session?.user as unknown as Record<string, unknown> | undefined)?.profileImage as string | null;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[270px] lg:w-60 flex-col border-r border-line bg-white",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center justify-between px-5">
          <SidebarLogo />
          <button onClick={onClose} className="-mr-1 rounded-md p-1.5 text-ink-faint hover:bg-canvas hover:text-ink lg:hidden" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              <p className="mb-1.5 px-3 text-[12px] font-medium text-ink-faint">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.href} item={item} onClose={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-[11px] font-bold text-white">
              {profileImage
                ? <img src={profileImage} alt="" className="h-full w-full object-cover" />
                : getInitials(name || "U")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
              <p className="truncate text-[12px] text-ink-faint">{email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
