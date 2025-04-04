import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Ringo",
  description: "GenAI Playlist generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "dark min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <main className="flex min-h-screen flex-col px-6">
          <div className="max-w-screen-sm w-full mx-auto text-xl pt-24">
            <h1 className="text-amber-300 font-mono font-semibold">
              Ringo
            </h1>
            <p className="text-balance text-base text-stone-300 mb-8">
              What are you in the mood for?
            </p>
            {children}
            <a
              href="https://braintrust.dev"
              target="_blank"
              className="text-sm inline-flex gap-2 text-white opacity-40 hover:opacity-60 transition-opacity"
            >
              Powered by
              <Image
                src="/logo.png"
                alt="Braintrust Logo"
                width={116}
                height={12}
              />
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
