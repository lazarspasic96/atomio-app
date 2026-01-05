"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Calendar, LayoutDashboard, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { useState } from "react";

const navItems = [
  {
    label: "Overview",
    href: "/app?tab=overview",
    tab: "overview",
    icon: LayoutDashboard,
  },
  {
    label: "Calendar",
    href: "/app?tab=calendar",
    tab: "calendar",
    icon: Calendar,
  },
  {
    label: "Manage Habits",
    href: "/app?tab=habits",
    tab: "habits",
    icon: Settings,
  },
];

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ currentTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex h-16 items-center border-b px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <Logo size="sm" />}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = currentTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", collapsed && "h-5 w-5")} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "border-t p-3",
        collapsed && "flex justify-center"
      )}>
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            Track your habits daily
          </p>
        )}
      </div>
    </aside>
  );
}
