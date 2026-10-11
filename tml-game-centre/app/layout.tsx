import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TML Today Game Centre",
  description: "Live Leafs score, period, clock and shots",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
