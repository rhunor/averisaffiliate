"use client";

import { useSession } from "next-auth/react";
import { Menu, Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  onMenuClick: () => void;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const user = session?.user as unknown as Record<string, unknown>;
  const name = (user?.name as string) || "User";
  const firstName = name.split(" ")[0];
  const isActive = user?.isActive as boolean;
  const initials = getInitials(name);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden lg:flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {getGreeting()},{" "}
          <span className="font-semibold text-foreground">{firstName}</span>
        </p>
        <span
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
            isActive
              ? "bg-[#40D457]/15 text-[#2eb847]"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {isActive ? "Pro Plan" : "Free Plan"}
        </span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
