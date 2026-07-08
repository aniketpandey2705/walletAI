import type { Metadata } from "next";
import "./globals.css";

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
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
