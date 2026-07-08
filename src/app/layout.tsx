import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "شبیه‌ساز الکتروسکوپ | آزمایشگاه الکتروساتیک",
  description:
    "شبیه‌ساز تعاملی الکتروسکوپ برای پایه یازدهم: مالش، القا، تماس و زمین کردن را با دیدن و کار کردن یاد بگیر.",
  keywords: ["الکتروسکوپ", "فیزیک", "الکتروساتیک", "القا", "مالش", "یازدهم"],
  authors: [{ name: "LXD Simulator" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
