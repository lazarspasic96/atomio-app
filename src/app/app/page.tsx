"use client";

import { useState } from "react";
import { HabitCalendarView, HabitsTable } from "~/features/habits/components";
import { Dashboard } from "~/features/dashboard";
import { Sidebar } from "~/components/layout/sidebar";

export default function AppPage() {
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">
          {currentTab === "overview" && <Dashboard />}
          {currentTab === "calendar" && <HabitCalendarView />}
          {currentTab === "habits" && <HabitsTable />}
        </div>
      </main>
    </div>
  );
}
