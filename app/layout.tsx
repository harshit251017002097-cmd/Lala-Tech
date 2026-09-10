import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "Lala Tech Operations Hub — Request Lifecycle Management",
  description: "Centralized client request operations hub for Lala Tech. Know what is waiting, who owns it, and why.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080C14] text-slate-100 antialiased selection:bg-blue-600/30 selection:text-blue-200">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
