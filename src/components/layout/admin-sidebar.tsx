"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  ReceiptText,
  ShoppingBag,
  BookOpen,
  BadgeDollarSign,
  LogOut,
  X,
  Shield,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
  { label: "Transactions", href: "/admin/transactions", icon: ReceiptText },
  { label: "Commissions", href: "/admin/commissions", icon: BadgeDollarSign },
  { label: "Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Migrations", href: "/admin/migrations", icon: Wrench },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-primary-darker z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-secondary-bright" />
            <span className="text-white font-bold text-sm">Admin Panel</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-active text-white"
                    : "text-white/60 hover:text-white hover:bg-sidebar-hover"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-sidebar-hover transition-colors mb-1"
          >
            <LayoutDashboard className="h-4 w-4" />
            User Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-sidebar-hover transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
