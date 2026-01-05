import { TrendingUp, Link2, UserCheck } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

const principles = [
  {
    icon: TrendingUp,
    title: "Compound Growth",
    description:
      "Get 1% better each day. Small improvements compound into remarkable results over time.",
  },
  {
    icon: Link2,
    title: "Don't Break the Chain",
    description:
      "Visual streaks keep you motivated. See your consistency grow day by day.",
  },
  {
    icon: UserCheck,
    title: "Become Who You Want",
    description:
      "Every completed habit is a vote for the person you want to become.",
  },
];

export function PhilosophySection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Built on the science of tiny gains
          </h2>
          <p className="text-lg text-muted-foreground">
            Proven principles baked into every feature.
          </p>
        </div>

        {/* Principle Cards */}
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {principles.map((principle, index) => (
            <Card
              key={index}
              className="bg-[#141414] border-border group hover:border-emerald-500/50 transition-all duration-300"
            >
              <CardContent className="pt-6 pb-6">
                {/* Icon */}
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500">
                  <principle.icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-2">{principle.title}</h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {principle.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
