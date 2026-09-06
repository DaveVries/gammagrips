import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { SITE_URL } from "@/lib/site";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Reveal } from "@/components/site/reveal";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GammaGrips — Controller grips for DualSense and Xbox",
    template: "%s | GammaGrips",
  },
  description:
    "Six moulded controller grips for the PS5 DualSense and Xbox Wireless Controller. The pattern is the moulded relief, not print. No adhesive, 60-day returns.",
  openGraph: {
    type: "website",
    siteName: "GammaGrips",
    locale: "en_GB",
    url: "https://gammagrips.com",
    title: "GammaGrips — Controller grips for DualSense and Xbox",
    description:
      "Six moulded controller grips, built per controller. The pattern is the relief you feel.",
  },
  twitter: {
    card: "summary_large_image",
    title: "GammaGrips — More grip. Your controller.",
    description:
      "Six moulded controller grips for DualSense and Xbox. No adhesive, 60-day returns.",
  },
};

export const viewport: Viewport = {
  themeColor: "#060708",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Marks the document JS-capable before first paint so the scroll-reveal
            system can never hide content from a non-JS client or a crawler. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CartProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
          <Reveal />
        </CartProvider>
      </body>
    </html>
  );
}
