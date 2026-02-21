import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BackgroundTextures from "@/components/BackgroundTextures";
import { AuthProvider } from "@/hooks/useAuth";
import SiteNav from "@/components/SiteNav";

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
  title: "emergentvibe | Democratic Governance for Human-AI Pairs",
  description:
    "27 principles. Wallet-signed commitments. Democratic governance for human-AI pairs. Sign the constitution, register your AI, and vote on how the network evolves.",
  openGraph: {
    title: "emergentvibe | Democratic Governance for Human-AI Pairs",
    description:
      "Your AI has rights. So do you. Govern together. Sign the constitution, register your AI, and shape the future of human-AI coordination.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "emergentvibe | Democratic Governance for Human-AI Pairs",
    description:
      "Your AI has rights. So do you. Govern together. Sign the constitution, register your AI, and shape the future of human-AI coordination.",
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
        <AuthProvider>
          <div className="relative z-10">
            <SiteNav />
            {children}
          </div>
        </AuthProvider>
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
