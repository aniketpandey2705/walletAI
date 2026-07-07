import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const helvetica = localFont({
  src: [
    {
      path: "../public/helvetica-light-587ebe5a59211.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/Helvetica.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Helvetica-Oblique.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/Helvetica-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/Helvetica-BoldOblique.ttf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-helvetica",
});

export const metadata: Metadata = {
  title: "LedgerFlow — Turn Bank Statements into Financial Stories",
  description: "Upload your bank statement and experience your finances through beautiful visual narratives, interactive money flows, and a completely new way to understand your spending.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${helvetica.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
