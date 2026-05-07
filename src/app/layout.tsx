import type { Metadata } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsappFloat } from "@/components/whatsapp-float";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.brandName} | Catalogo de ropa`,
    template: `%s | ${siteConfig.brandName}`
  },
  description:
    "Catalogo online de ropa con prendas disponibles, talles, colores, modelos y contacto.",
  metadataBase: new URL(siteConfig.siteUrl),
  icons: {
    icon: "/asset/logoamercansport-black.png",
    shortcut: "/asset/logoamercansport.jpg",
    apple: "/asset/logoamercansport-black.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="afterInteractive"
            async
            defer
          />
        ) : null}
        <SiteHeader />
        {children}
        <WhatsappFloat />
        <SiteFooter />
      </body>
    </html>
  );
}
