import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "TML Today - Toronto Maple Leafs News & Updates",
	description: "Your source for Toronto Maple Leafs news, videos, podcasts, and community discussion. Independent aggregator of Leafs content.",
	keywords: "Toronto Maple Leafs, NHL, hockey news, Leafs news, TML",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
				<Header />
				<main className="flex-1">
					{children}
				</main>
				<Footer />
			</body>
		</html>
	);
}
