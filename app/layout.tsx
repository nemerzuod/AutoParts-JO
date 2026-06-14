import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AutoParts-JO | منصة إدارة قطع غيار السيارات",
  description:
    "منصة احترافية لإدارة وتوزيع قطع غيار السيارات في الأردن — المخزون، الكتالوج، والتوافق مع المركبات.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased`}>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400">
          AutoParts-JO — منصة إدارة قطع غيار السيارات في الأردن
        </footer>
      </body>
    </html>
  );
}
