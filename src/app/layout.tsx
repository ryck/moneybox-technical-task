import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "The Moneybox Story | The means to get more out of life",
  description:
    "Moneybox is the simple way to save, invest, buy your first home, and combine your old pensions – all with one award-winning service.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Moneybox",
    statusBarStyle: "default",
    capable: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Moneybox | Save and Invest",
    title: "The Moneybox Story | The means to get more out of life",
    description:
      "We're Moneybox, the award-winning app helping over 1.5 million people getting more out of life.",
    url: "https://www.moneyboxapp.com/",
    images: [
      {
        url: "https://www.moneyboxapp.com/wp-content/uploads/2024/12/moneybox-social-graph.jpg",
        width: 1200,
        height: 674,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@moneyboxteam",
    title: "The Moneybox Story | The means to get more out of life",
    description:
      "We're Moneybox, the award-winning app helping over 1.5 million people getting more out of life.",
    images: [
      "https://www.moneyboxapp.com/wp-content/uploads/2024/12/moneybox-social-graph.jpg",
    ],
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip to main content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
};

export default RootLayout;
