import { Check, ExternalLink } from "lucide-react";

const promises = [
  { title: "No premium tier" },
  { title: "No advertisements" },
  { title: "No data selling" },
  { title: "Open source" },
];

export function WhyFreeSection() {
  return (
    <section id="why-free" className="py-20 md:py-28 bg-[#0d0d0d]">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Card */}
          <div className="bg-[#141414] rounded-2xl border border-border p-8 md:p-10 relative overflow-hidden">
            {/* Green accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

            {/* Header */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Actually free. No tricks.
            </h2>

            <p className="text-muted-foreground mb-8">
              We believe habit tracking should be accessible to everyone.
              No premium features behind paywalls. No ads. No data selling.
              Just a simple tool to help you become who you want to be.
            </p>

            {/* Promise Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {promises.map((promise, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm text-white">{promise.title}</span>
                </div>
              ))}
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
            >
              View on GitHub
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
