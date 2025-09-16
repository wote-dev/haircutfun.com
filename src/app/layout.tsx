import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "HaircutFun - Virtual Haircut Try-On",
  description: "Try on different haircuts virtually with AI-powered technology. Find your perfect hairstyle before you cut!",
  keywords: "haircut, virtual try-on, hairstyle, AI, beauty, salon",
  icons: {
    icon: "/haircuttr.png",
    shortcut: "/haircuttr.png",
    apple: "/haircuttr.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
        <footer className="border-t bg-muted/50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Legal Links */}
              <div className="flex items-center space-x-6 text-sm">
                <a 
                  href="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <span className="text-muted-foreground/50">•</span>
                <a 
                  href="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Terms of Use
                </a>
              </div>
              
              {/* Copyright */}
              <p className="text-center text-sm text-muted-foreground">
                &copy; 2025 HaircutFun. All rights reserved.
              </p>
              
              {/* Built by */}
              <div className="flex items-center justify-center">
                <a 
                  href="https://x.com/wote_dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-slate-700"
                >
                  <span className="text-sm text-slate-300">Built by</span>
                  <div className="flex items-center gap-1.5">
                    <svg 
                      className="h-4 w-4 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 24 24" 
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="font-semibold text-white">@wote_dev</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
