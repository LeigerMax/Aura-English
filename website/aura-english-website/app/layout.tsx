import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/src/constants";
import { Header, Footer } from "@/src/components";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aura-english.vercel.app"),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "Aura English",
    "English learning",
    "flashcards",
    "spaced repetition",
    "offline learning",
    "language app",
    "vocabulary",
    "CEFR",
    "AI generated flashcards"
  ],
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: "/",
    siteName: APP_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  verification: {
    google: "YU5YsIOQO2UfGISi4ma0b3vPniagXxM1MVfbGr5Cnnc",
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased selection:bg-blue-200 selection:text-blue-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
