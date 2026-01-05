"use client";

import { Calendar, Settings, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { HabitCalendarView, HabitsTable } from "~/features/habits/components";
import { Dashboard } from "~/features/dashboard";

export default function AppPage() {
  return (
    <div className="h-full pb-4">
      <Tabs defaultValue="overview" className="flex h-full flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="habits" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage Habits
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 flex-1 overflow-auto">
          <Dashboard />
        </TabsContent>
        <TabsContent value="calendar" className="mt-4 flex-1">
          <HabitCalendarView />
        </TabsContent>
        <TabsContent value="habits" className="mt-4 flex-1">
          <HabitsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
