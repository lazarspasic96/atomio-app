import { Plus, Check, TrendingUp } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Plus,
    title: "Create",
    description: "Add habits with your schedule in seconds.",
  },
  {
    number: 2,
    icon: Check,
    title: "Track",
    description: "Check off completed habits daily.",
  },
  {
    number: 3,
    icon: TrendingUp,
    title: "Grow",
    description: "Watch streaks and progress compound.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#0d0d0d]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Start building better habits in three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

            <div className="grid gap-8 md:grid-cols-3 relative">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="text-center">
                    {/* Step circle with icon */}
                    <div className="relative inline-flex mb-6">
                      <div className="w-20 h-20 rounded-full bg-[#141414] border border-border flex items-center justify-center relative z-10">
                        <step.icon className="h-8 w-8 text-emerald-500" />
                      </div>
                      {/* Number badge */}
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold z-20">
                        {step.number}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
