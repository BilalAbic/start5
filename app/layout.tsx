import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Start5 - Fikrini kodla, 5 günde yayına al!",
  description: "Start5 ile projelerinizi hızla geliştirin, MVP'nizi oluşturun ve becerilerinizi sergileyin. 5 günde fikirden ürüne.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white`}
      >
        <ConditionalNavbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
