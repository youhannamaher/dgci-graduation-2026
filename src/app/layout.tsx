import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const cinzel = Cinzel({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dgci-graduation-2026.vercel.app"),
  title: "DGCI Graduation 2026 | Digital Graduation Companion",
  description: "Official digital companion for the DGCI Graduation Ceremony - Class of 2026. Access the event program, graduate profiles, stage walk order, and share memories.",
  openGraph: {
    title: "DGCI Graduation 2026 | Digital Graduation Companion",
    description: "Official digital companion for the DGCI Graduation Ceremony - Class of 2026. Access the event program, graduate profiles, stage walk order, and share memories.",
    type: "website",
    locale: "en_US",
    siteName: "DGCI Graduation 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "DGCI Graduation 2026 | Digital Graduation Companion",
    description: "Official digital companion for the DGCI Graduation Ceremony - Class of 2026. Access the event program, graduate profiles, stage walk order, and share memories.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#050B14] text-white font-sans">
        <DataProvider>
          <Navbar />
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
          <Footer />
        </DataProvider>
      </body>
    </html>
  );
}


