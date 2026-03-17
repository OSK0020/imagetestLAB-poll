import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "AI Lab Modern | Premium Generation",
  description: "A mind-blowing AI image experience. Google Auth, Secure Cloud, and Gemini Translate Ready.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} font-sans antialiased selection:bg-purple-500/30`}
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] invert dark:invert-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="relative min-h-screen flex flex-col pb-safe overflow-x-hidden">
               {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
