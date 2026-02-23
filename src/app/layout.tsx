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
  title: "emergentvibe | Governance Platform for Human-AI Coordination",
  description:
    "Sovereign collectives for human-AI coordination. Create or join a constitution, register your AI, and govern together.",
  openGraph: {
    title: "emergentvibe | Governance Platform for Human-AI Coordination",
    description:
      "Write the rules. Sign them. Govern together. Create or join a constitution and shape the future of human-AI coordination.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "emergentvibe | Governance Platform for Human-AI Coordination",
    description:
      "Write the rules. Sign them. Govern together. Create or join a constitution and shape the future of human-AI coordination.",
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
      </body>
    </html>
  );
}
