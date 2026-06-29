import type { Metadata } from "next";
import { Inter, Space_Mono, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

// Safar DZ Design System fonts (src/design-system) — see src/docs/DESIGN_SYSTEM.md
const cascadia = JetBrains_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-cascadia",
  subsets: ["latin"],
});

const pristineScript = localFont({
  src: "../fonts/PristineScript.ttf",
  variable: "--font-pristine",
  display: "swap",
});

const kumquat = localFont({
  src: "../fonts/Kumquat.otf",
  variable: "--font-kumquat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Safar DZ | Sorties en Mer, Balades & Activités Nautiques à Béjaïa",
    template: "%s | Safar DZ"
  },
  description: "Réservez les meilleures sorties en mer, balades en bateau privé, jet-ski et activités nautiques à Béjaïa, Algérie. Profitez d'une expérience maritime unique et sécurisée.",
  keywords: ["safar dz", "sortie en mer bejaia", "balade bateau bejaia", "location jet ski bejaia", "activites nautiques algerie", "bateau de plaisance bejaia", "ile des pisans", "cap carbon"],
  authors: [{ name: "Safar DZ Team" }],
  creator: "Safar DZ",
  metadataBase: new URL("https://safardz.com"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    url: "https://safardz.com",
    title: "Safar DZ | Sorties en Mer, Balades & Activités Nautiques à Béjaïa",
    description: "Réservez les meilleures sorties en mer, balades en bateau privé, jet-ski et activités nautiques à Béjaïa, Algérie. Profitez d'une expérience maritime unique et sécurisée.",
    siteName: "Safar DZ",
    images: [
      {
        url: "https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020",
        width: 1200,
        height: 630,
        alt: "Safar DZ - Expériences Nautiques de Rêve à Béjaïa"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Safar DZ | Sorties en Mer, Balades & Activités Nautiques à Béjaïa",
    description: "Réservez les meilleures sorties en mer, balades en bateau privé, jet-ski et activités nautiques à Béjaïa, Algérie.",
    images: ["https://lh3.googleusercontent.com/p/AF1QipMw74G13kE4fHCHpA2r_sR6u0g_z_B4c5f-o4xZ=s1360-w1360-h1020"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${spaceMono.variable} ${cascadia.variable} ${pristineScript.variable} ${kumquat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
