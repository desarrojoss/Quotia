import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quotia",
  description: "Cotizador/propuestas automatizado",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="absolute -top-40 left-1/2 h-140 w-225 -translate-x-1/2 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--color-bg)_85%)]" />
        </div>
        {children}
      </body>
    </html>
  );
}
