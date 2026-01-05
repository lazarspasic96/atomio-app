import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "~/components/ui/button";

const trustIndicators = [
  "Free forever",
  "No credit card",
  "No catch",
];

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Small habits.
            <br />
            <span className="text-emerald-400">Big results.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Track your daily habits and watch 1% daily improvements
            compound into life-changing results.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <Button
              size="lg"
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-base px-8 h-14 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Link href="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Image / App Preview */}
        <div className="mt-16 md:mt-20 relative">
          {/* Gradient fade at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none h-40 top-auto" />

          <div className="relative mx-auto max-w-5xl">
            {/* Browser mockup */}
            <div className="rounded-xl border border-border bg-[#141414] shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-[#0a0a0a]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-[#1a1a1a] text-xs text-muted-foreground">
                    atomio.app
                  </div>
                </div>
              </div>
              {/* App preview */}
              <div className="p-6 md:p-8">
                <AppPreviewMockup />
              </div>
            </div>

            {/* Glow effect behind mockup */}
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-2xl blur-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AppPreviewMockup() {
  const habits = [
    { name: "Morning meditation", emoji: "🧘", days: [true, true, false, true, true, true, true] },
    { name: "Read 20 pages", emoji: "📚", days: [true, true, true, true, false, true, true] },
    { name: "Exercise", emoji: "💪", days: [true, false, true, false, true, false, true] },
    { name: "Drink 8 glasses", emoji: "💧", days: [true, true, true, true, true, true, true] },
  ];

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">This Week</h3>
          <p className="text-sm text-muted-foreground">Jan 6 - Jan 12, 2026</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-sm text-muted-foreground">Weekly Score:</span>
          <span className="font-bold text-emerald-400">85%</span>
        </div>
      </div>

      {/* Habit Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-[#0a0a0a]">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                Habit
              </th>
              {dayLabels.map((day) => (
                <th
                  key={day}
                  className="text-center py-3 px-2 text-sm font-medium text-muted-foreground hidden sm:table-cell"
                >
                  {day}
                </th>
              ))}
              <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground sm:hidden">
                Progress
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, habitIndex) => (
              <tr key={habitIndex} className="border-b border-border last:border-b-0 hover:bg-[#1a1a1a] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{habit.emoji}</span>
                    <span className="text-sm font-medium text-white">{habit.name}</span>
                  </div>
                </td>
                {habit.days.map((completed, dayIndex) => (
                  <td key={dayIndex} className="text-center py-3 px-2 hidden sm:table-cell">
                    <div
                      className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center transition-all ${
                        completed
                          ? "bg-emerald-500 text-white"
                          : "bg-[#1a1a1a] border border-border"
                      }`}
                    >
                      {completed && <Check className="w-4 h-4" />}
                    </div>
                  </td>
                ))}
                <td className="text-center py-3 px-4 sm:hidden">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-emerald-400 font-medium">
                      {habit.days.filter(Boolean).length}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{habit.days.length}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">12</p>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">89%</p>
          <p className="text-xs text-muted-foreground">Completion</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-bold text-white">156</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
      </div>
    </div>
  );
}
