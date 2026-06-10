import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LeetSQL - Learn SQL Interactively",
  description: "Learn SQL with interactive LeetCode-style questions running fully inside your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
