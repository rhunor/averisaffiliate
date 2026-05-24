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
  { label: "Academy", href: "/dashboard/academy", icon: GraduationCap },
  { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
  { label: "Affiliate Sales", href: "/dashboard/referrals", icon: Users },
  { label: "Withdrawals", href: "/dashboard/withdrawals", icon: Wallet },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function AverisLogoMark() {
  return (
    <svg width="30" height="26" viewBox="0 0 52 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M44 2H20L4 22L20 42H44V33H26L16 22L26 11H44V2Z" fill="white" />
      <polygon points="29,2 45,2 37,18" fill="#40D457" />
    </svg>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function NavItem({ item }: { item: (typeof navItems)[number] }) {
  const pathname = usePathname();
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        active
          ? "bg-white/10 text-white border-l-[3px] border-[#40D457] pl-[13px]"
          : "text-white/60 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent pl-[13px]"
      )}
    >
      <item.icon className={cn("h-4 w-4 shrink-0", active && "text-[#40D457]")} />
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
          "fixed top-0 left-0 h-full w-64 bg-sidebar z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <AverisLogoMark />
            <div className="leading-none">
              <div className="text-white font-black text-[11px] tracking-[0.18em] uppercase">Averis</div>
              <div className="text-white/70 font-semibold text-[10px] tracking-[0.14em] uppercase mt-0.5">Academy</div>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
          <p className="text-white/20 text-xs text-center mt-3">{siteConfig.name}</p>
        </div>
      </aside>
    </>
  );
}
