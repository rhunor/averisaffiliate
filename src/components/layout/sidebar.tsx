"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  GraduationCap,
  DollarSign,
  Users,
  Wallet,
  CreditCard,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Averis Academy Products", href: "/dashboard/products", icon: ShoppingBag },
  { label: "Academy Trainings", href: "/dashboard/academy", icon: GraduationCap },
  { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
  { label: "Affiliate Sales", href: "/dashboard/referrals", icon: Users },
  { label: "Withdrawals", href: "/dashboard/withdrawals", icon: Wallet },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function AverisLogoMark() {
  return (
    <svg width="30" height="24" viewBox="0 0 65 51" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="white"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="#40D457"/>
    </svg>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function NavItem({ item, onClose }: { item: (typeof navItems)[number]; onClose: () => void }) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        active
          ? "bg-white/10 text-white border-l-[3px] border-[#40D457] pl-[13px]"
          : "text-white/55 hover:text-white hover:bg-white/6 border-l-[3px] border-transparent pl-[13px] hover:translate-x-1"
      )}
    >
      <item.icon className={cn(
        "h-4 w-4 shrink-0 transition-colors duration-200",
        active ? "text-[#40D457]" : "group-hover:text-white/90"
      )} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-white/5 z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <AverisLogoMark />
            <div className="leading-none">
              <div className="text-white font-black text-[11px] tracking-[0.2em] uppercase">Averis</div>
              <div className="text-[#40D457]/70 font-semibold text-[9px] tracking-[0.16em] uppercase mt-0.5">Academy</div>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} onClose={onClose} />
          ))}
        </nav>

        {/* Decorative logo watermark */}
        <div className="px-4 pb-1 pointer-events-none select-none" aria-hidden>
          <svg width="80" height="63" viewBox="0 0 65 51" fill="none" className="opacity-[0.04] ml-auto">
            <path fillRule="evenodd" clipRule="evenodd" d="M23.6321 39.1078L64.2474 39.1659L44.6646 50.2771L4.34633 50.2697L0 42.891L2.22282 39.3854L20.7427 10.7465L39.9931 0L21.4887 28.6184L19.2659 32.124L23.6321 39.1078Z" fill="white"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M54.3371 28.6184L44.0985 12.7838L33.8601 28.6184H54.3371Z" fill="white"/>
          </svg>
        </div>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-white/8">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/6 transition-all duration-200 hover:translate-x-1"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
          <p className="text-white/15 text-xs text-center mt-3">{siteConfig.name}</p>
        </div>
      </aside>
    </>
  );
}
