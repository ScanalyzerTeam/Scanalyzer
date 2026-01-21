import "@/styles/globals.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";

import { LangSwitcher } from "@/components/lang-switcher";
import { QueryProvider } from "@/components/query-provider";
import { AuthSessionProvider } from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { routing } from "@/i18n/routing";
import { fonts } from "@/lib/fonts";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  verification: {
    google: siteConfig.googleSiteVerificationId,
  },
  openGraph: {
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.title,
    images: "/opengraph-image.jpg",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: "/opengraph-image.jpg",
  },
};

const RootLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans", fonts)}>
        <AuthSessionProvider>
          <QueryProvider>
            <NextIntlClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                forcedTheme="dark"
              >
                {children}
                <LangSwitcher className="absolute right-5 bottom-5 z-10" />
              </ThemeProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
