import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "Atomio - Small habits. Big results.",
    template: "%s | Atomio",
  },
  description:
    "Track your daily habits and watch 1% daily improvements compound into life-changing results. Simple, beautiful, and completely free forever.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Atomio",
    title: "Atomio - Small habits. Big results.",
    description:
      "Track your daily habits and watch 1% daily improvements compound into life-changing results. Completely free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atomio - Small habits. Big results.",
    description:
      "Track your daily habits and watch 1% daily improvements compound into life-changing results. Completely free forever.",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
