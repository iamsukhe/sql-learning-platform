import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "dbmsQuest | Interactive SQL & DBMS Learning Platform",
  description: "Master SQL and Database Management Systems (DBMS) interactively. Learn SELECT queries, aggregates, GROUP BY, joins, and indexing directly in your browser with real-time evaluation.",
  keywords: [
    "DBMS", "SQL", "SQL queries", "Learn SQL", "Interactive SQL", 
    "Database Management", "SQL Practice", "Online SQL Editor", 
    "SQLite compiler", "Database tutorials", "SQL questions", "dbmsQuest"
  ],
  authors: [{ name: "dbmsQuest Team" }],
  metadataBase: new URL("https://sql-learning-platform-phi.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "dbmsQuest | Interactive SQL & DBMS Learning Platform",
    description: "Learn and practice SQL/DBMS queries directly in your browser with zero latency. Hands-on coding exercises, theory guides, cheatsheets, and more.",
    url: "https://sql-learning-platform-phi.vercel.app",
    siteName: "dbmsQuest",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "dbmsQuest | Interactive SQL & DBMS Learning Platform",
    description: "Learn and practice SQL/DBMS queries directly in your browser. Complete free coding sandbox and structural database tutorials.",
  },
  icons: {
    icon: "/favicon.png",
  },
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
