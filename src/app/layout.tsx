import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundTextures from "@/components/BackgroundTextures";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Emergent Vibe | Collective AI Constitution",
  description:
    "Build the AI we want, together. A democratic platform for collectively writing the constitution that shapes how AI systems behave.",
  openGraph: {
    title: "Emergent Vibe | Collective AI Constitution",
    description:
      "Build the AI we want, together. A democratic platform for collectively writing the constitution that shapes how AI systems behave.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emergent Vibe | Collective AI Constitution",
    description:
      "Build the AI we want, together. A democratic platform for collectively writing the constitution that shapes how AI systems behave.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Background texture layers */}
        <BackgroundTextures />
        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>
        {/* Footer */}
        <footer className="relative z-10 py-6 text-center text-sm text-neutral-500">
          <a 
            href="https://ideologos.com" 
            className="hover:text-neutral-300 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Also: ideologos.com — AI that challenges your thinking
          </a>
        </footer>
      </body>
    </html>
  );
}
