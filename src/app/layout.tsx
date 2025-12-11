import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import ConditionalLayout from "@/components/ConditionalLayout";
import HreflangTags from "@/components/HreflangTags";
import SessionProvider from "@/components/SessionProvider";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// Optimize font loading to prevent FOUT (Flash of Unstyled Text)
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Prevents invisible text during font load
  preload: true, // Preloads font for faster rendering
});

export const metadata: Metadata = {
  title: "Portal de Acompanhantes - Portugal",
  description: "Encontre a companhia perfeita em Portugal",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt">
      <head>
        {/* Tailwind CDN - Required for styles to load (PostCSS build may not be working in dev) */}
        <Script 
          src="https://cdn.tailwindcss.com" 
          strategy="beforeInteractive"
          onLoad={() => {
            // Mark styles as loaded to prevent FOUC
            if (typeof document !== 'undefined') {
              document.documentElement.classList.add('tailwind-loaded');
            }
          }}
        />
        <Script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" strategy="afterInteractive" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <HreflangTags />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body className={`${inter.className} font-sans antialiased bg-gray-50`}>
        <SessionProvider session={session}>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </SessionProvider>
      </body>
    </html>
  );
} 