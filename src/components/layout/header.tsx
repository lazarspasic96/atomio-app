"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/logo";
import { useAuth } from "~/features/auth/hooks";

interface HeaderProps {
  userEmail: string;
}

export function Header({ userEmail }: HeaderProps) {
  const { signOut, isLoading } = useAuth();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/app" className="flex items-center gap-4">
          <Logo size="sm" />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{userEmail}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            disabled={isLoading}
          >
            {isLoading ? "Signing out..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
