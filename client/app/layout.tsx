import type { Metadata } from "next";
import localFont from "next/font/local";
import {
  Inter,
  Poppins,
  Amiri,
  Rubik,
  Noto_Naskh_Arabic,
} from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import Navbar from "./components/Navbar";
import { NavbarVisibilityProvider } from "./components/NavbarVisibilityContext";
import { ThemeProvider } from "./components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh-arabic",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const kfgq = localFont({
  src: [
    {
      path: "./fonts/kfgq.otf",
      style: "normal",
    },
  ],
  variable: "--font-kfgq",
});

export const metadata: Metadata = {
  title: "MaxCode Test",
  description:
    "A Quran reader app built with Next.js, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={` ${inter.variable} ${poppins.variable} ${amiri.variable} ${notoNaskhArabic.variable} ${rubik.variable} ${kfgq.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "sepia"]}
          disableTransitionOnChange
        >
          <NavbarVisibilityProvider>
            <Navbar />
            <ReactLenis root>{children}</ReactLenis>
          </NavbarVisibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
