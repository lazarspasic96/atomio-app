import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Start building better habits today
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-8">
            Join people who are tracking their way to better lives.
          </p>

          {/* CTA Button */}
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

          {/* Micro-copy */}
          <p className="mt-4 text-sm text-muted-foreground">
            No account required to try
          </p>
        </div>
      </div>
    </section>
  );
}
