"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as unknown as Record<string, unknown>;
  const name = (user?.name as string) || "Admin";
  const profileImage = user?.profileImage as string | null;

  return (
    <div className="min-h-screen bg-muted">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-muted">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-primary">Admin Panel</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center overflow-hidden shrink-0">
              {profileImage
                ? <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                : <span className="text-white text-xs font-bold">{getInitials(name)}</span>
              }
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
