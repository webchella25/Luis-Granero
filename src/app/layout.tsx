import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Luis Granero - Desarrollador Web Freelance",
  description: "Desarrollador web especializado en React, Next.js y soluciones personalizadas. Creando aplicaciones web modernas y de alto rendimiento.",
  keywords: "desarrollador web, freelance, React, Next.js, TypeScript, desarrollo personalizado",
  authors: [{ name: "Luis Granero" }],
  creator: "Luis Granero",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://luisgranero.com",
    title: "Luis Granero - Desarrollador Web Freelance",
    description: "Desarrollador web especializado en React, Next.js y soluciones personalizadas.",
    siteName: "Luis Granero",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luis Granero - Desarrollador Web Freelance",
    description: "Desarrollador web especializado en React, Next.js y soluciones personalizadas.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-dark-800 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}