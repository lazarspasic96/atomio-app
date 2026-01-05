import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-2 text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
