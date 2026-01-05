import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { Logo } from "~/components/logo";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why Free?", href: "#why-free" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com/lazarspasic96/atomio-app", icon: Github },
    { label: "Twitter", href: "https://twitter.com", icon: Twitter },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-[#0a0a0a]">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            {/* Brand Column */}
            <div className="max-w-xs">
              <Logo size="md" theme="dark" className="mb-4" />
              <p className="text-sm text-muted-foreground">
                Build better habits with simple daily tracking.
                Completely free, forever.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-12">
              {/* Product Links */}
              <div>
                <h4 className="font-semibold text-sm text-white mb-4">Product</h4>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-white transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal Links */}
              <div>
                <h4 className="font-semibold text-sm text-white mb-4">Legal</h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social */}
              <div>
                <h4 className="font-semibold text-sm text-white mb-4">Social</h4>
                <div className="flex items-center gap-4">
                  {footerLinks.social.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-white transition-colors"
                      aria-label={link.label}
                    >
                      <link.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Atomio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
