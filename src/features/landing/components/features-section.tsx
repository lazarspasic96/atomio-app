import { CheckSquare, BarChart3, Gift } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

const features = [
  {
    icon: CheckSquare,
    title: "Effortless tracking",
    description:
      "Create habits in seconds. Check them off daily. No complexity, just results.",
  },
  {
    icon: BarChart3,
    title: "See your growth",
    description:
      "Streaks, charts, and completion rates. Watch your consistency compound over time.",
  },
  {
    icon: Gift,
    title: "Actually free",
    description:
      "No premium tier. No trial period. No credit card. Just a tool to help you grow.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Why Atomio?
          </h2>
          <p className="text-lg text-muted-foreground">
            Simple tools designed to help you stay consistent and see real progress.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-[#141414] border-border group hover:border-emerald-500/50 transition-all duration-300"
            >
              <CardContent className="pt-6 pb-6">
                {/* Icon */}
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
