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
        <footer className="relative border-t bg-gradient-to-br from-background via-secondary/10 to-accent/5 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--primary)_0%,_transparent_50%)] opacity-5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_50%)] opacity-5"></div>
          
          <div className="container mx-auto px-6 py-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Brand Section */}
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-sm" />
                    <img
                      src="/new-logo.png"
                      alt="HaircutFun Logo"
                      className="relative object-contain h-12 w-auto"
                    />
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  Transform your look with AI-powered virtual haircut try-ons. See yourself in any style before making the cut.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>At least 2 users worldwide</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
                <nav className="flex flex-col space-y-3">
                  <a 
                    href="/try-on" 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>Try Virtual Haircuts</span>
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a 
                    href="/gallery" 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>Style Gallery</span>
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a 
                    href="/pricing" 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>Pricing</span>
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a 
                    href="/about" 
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>About Us</span>
                    <svg className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-border/50 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Copyright */}
                <p className="text-sm text-muted-foreground">
                  &copy; 2025 HaircutFun. All rights reserved.
                </p>
                
                {/* Built by Badge */}
                <a 
                  href="https://x.com/wote_dev" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 hover:from-primary/20 hover:via-primary/10 hover:to-accent/20 text-foreground font-medium rounded-xl border border-primary/20 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <span className="text-sm text-muted-foreground">Built by</span>
                  <div className="flex items-center gap-2">
                    <svg 
                      className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" 
                      fill="currentColor" 
                      viewBox="0 0 24 24" 
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="font-semibold text-primary">@wote_dev</span>
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
