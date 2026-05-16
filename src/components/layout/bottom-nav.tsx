"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, GraduationCap, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Products", href: "/dashboard/products", icon: ShoppingBag },
  { label: "Academy", href: "/dashboard/academy", icon: GraduationCap },
  { label: "Withdraw", href: "/dashboard/withdrawals", icon: Wallet },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-border">
      <div className="flex">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors",
                active ? "text-secondary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-secondary")} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
