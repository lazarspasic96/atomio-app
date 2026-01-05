"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "~/components/logo";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#why-free", label: "Why Free?" },
];

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="md" theme="dark" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-white">
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-white transition-all hover:glow-green-sm"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#0a0a0a] border-border">
              <div className="flex flex-col gap-6 mt-8">
                <nav className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button variant="outline" asChild className="border-border text-white">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
