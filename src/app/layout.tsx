import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NagarVaani - Civic Operations",
  description: "Next-generation civic reporting and operations platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="nav-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))" }}></div>
            <h2 className="text-gradient">NagarVaani</h2>
          </div>
          <div className="nav-links">
            <a href="/">Citizen Portal</a>
            <a href="/cases">Officer Dashboard</a>
            <a href="/field">Field Crew App</a>
            <a href="/dashboard">Analytics</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
