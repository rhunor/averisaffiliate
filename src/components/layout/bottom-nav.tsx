"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, ShoppingBag, GraduationCap, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Learn", href: "/dashboard/academy", icon: GraduationCap },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/dashboard/products", icon: ShoppingBag },
  { label: "Withdraw", href: "/dashboard/withdrawals", icon: Wallet },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  // The lesson player is full-bleed on mobile; the tab bar would cover its controls.
  if (/^\/dashboard\/academy\/[^/]+\/(?!section\/)[^/]+$/.test(pathname)) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 pb-2 pt-2.5 text-[11px] font-medium transition-colors",
                active ? "text-ink" : "text-ink-faint"
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute top-0 h-[2px] w-8 rounded-b bg-secondary"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <item.icon className="h-[22px] w-[22px]" strokeWidth={active ? 2 : 1.6} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
