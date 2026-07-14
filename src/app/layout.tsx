import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin"],
	weight: ["700"],
	display: "swap",
});

const roboto = Roboto({
	variable: "--font-roboto",
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	display: "swap",
});

const SITE_URL = "https://tmltoday.couchmanrick.workers.dev";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: "TML Today - Toronto Maple Leafs News & Updates",
	description: "Your source for Toronto Maple Leafs news, videos, podcasts, and community discussion. Independent aggregator of Leafs content.",
	keywords: "Toronto Maple Leafs, NHL, hockey news, Leafs news, TML",
	icons: {
		icon: [
			{ url: "/favicon.webp", type: "image/webp" },
			// Safari does not reliably accept a WebP favicon; it takes this one.
			{ url: "/favicon.png", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${montserrat.variable} ${roboto.variable} antialiased flex flex-col min-h-screen overflow-x-clip`}>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebSite",
							name: "TML Today",
							alternateName: "Toronto Maple Leafs Today",
							url: SITE_URL,
							description: "Independent aggregator of Toronto Maple Leafs news, videos, podcasts, rumours and prospects.",
							publisher: {
								"@type": "Organization",
								name: "TML Today",
								logo: { "@type": "ImageObject", url: `${SITE_URL}/images/tmltoday-round-logo.webp` },
							},
						}),
					}}
				/>
				<Header />
				<main className="flex-1">
					{children}
				</main>
				<Footer />
			</body>
		</html>
	);
}
