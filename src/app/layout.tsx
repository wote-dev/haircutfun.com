import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";

export const metadata: Metadata = {
  metadataBase: new URL('https://haircutfun.com'),
  title: "HaircutFun - Virtual Haircut Try-On with AI",
  description: "Ever wonder what you'd look like with a new hairstyle? Stop wondering and start seeing! With HaircutFun, you can try on dozens of haircuts virtually using the power of AI. Upload your photo and find your perfect look in seconds. It's fun, fast, and free to try!",
  keywords: "haircut, virtual try-on, hairstyle, AI, beauty, salon, haircut simulator, style finder",
  icons: {
    icon: "/haircuttr.png",
    shortcut: "/haircuttr.png",
    apple: "/haircuttr.png",
  },
  openGraph: {
    title: "HaircutFun - See Your New Look Before the Cut!",
    description: "Don't risk a bad haircut! Use our AI to try on different hairstyles with your own photo. Discover the perfect you.",
    url: "https://haircutfun.com",
    siteName: "HaircutFun",
    images: [
      {
        url: "/package.png",
        width: 1200,
        height: 630,
        alt: "HaircutFun Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HaircutFun - AI-Powered Virtual Haircut Try-On",
    description: "Upload a photo and see yourself in any hairstyle. Your next great haircut is just a click away. #AI #VirtualHairstyle",
    creator: "@wote_dev",
    images: ["/new-logo.png"],
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
          <PageTransitionProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </PageTransitionProvider>
        </AuthProvider>
        <footer className="border-t bg-background">
          <div className="container mx-auto px-6 py-12">
            {/* Main Footer Content */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-8">
              {/* Brand Section */}
              <div className="flex-1 max-w-md">
                <div className="flex items-center mb-4">
                  <img
                    src="/new-logo.png"
                    alt="HaircutFun Logo"
                    className="h-8 w-auto"
                  />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Transform your look with AI-powered virtual haircut try-ons. See yourself in any style before making the cut.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                  <span>At least 2 users worldwide</span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 max-w-xs lg:flex lg:items-center lg:justify-center">
                <nav className="grid grid-cols-2 gap-3">
                  <a 
                    href="/try-on" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Try Virtual Haircuts
                  </a>
                  <a 
                    href="/gallery" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Style Gallery
                  </a>
                  <a 
                    href="/pricing" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Pricing
                  </a>
                  <a 
                    href="/about" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    About Us
                  </a>
                </nav>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
              {/* Copyright */}
              <p className="text-xs text-muted-foreground">
                &copy; 2025 HaircutFun. All rights reserved.
              </p>
              
              {/* Built by Badge */}
              <a 
                href="https://x.com/wote_dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-border rounded-md transition-all duration-200"
              >
                <span>Built by</span>
                <div className="flex items-center gap-1.5">
                  <svg 
                    className="h-3 w-3" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="font-medium">@wote_dev</span>
                </div>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
