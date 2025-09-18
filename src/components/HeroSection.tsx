"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";
import { ImageCarousel } from "./ImageCarousel";

export function HeroSection() {
  const { navigateWithLoading } = usePageTransitionContext();
  
  // Carousel images for left and right sides
  // Left side: Alternating between Emma and Sarah (female hairstyles)
  const leftCarouselImages = [
    "/modern-shag2.jpg",    // Emma
    "/modern-shag.jpg",     // Sarah
    "/pixie-cut2.jpg",      // Emma
    "/pixie-cut.jpg",       // Sarah
    "/wolf-cut2.jpg",       // Emma
    "/wolf-cut.jpg",        // Sarah
    "/curtain-bangs2.jpg",  // Emma
    "/curtain-bangs.jpg"    // Sarah
  ];
  
  // Right side: Alternating between Daniel and Mike (male hairstyles)
  const rightCarouselImages = [
    "/side-part.png",       // Daniel
    "/side-part2.jpg",      // Mike
    "/quiff.png",           // Daniel
    "/quiff2.jpg",          // Mike
    "/buzzcut.png",         // Daniel
    "/buzzcut2.jpg",        // Mike
    "/textered-top.png",    // Daniel
    "/textured-top2.jpg"    // Mike
  ];
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 min-h-screen flex items-center justify-center pt-24 pb-16">
      {/* Left Carousel */}
      <div className="absolute left-16 top-0 w-48 h-full opacity-20 pointer-events-none hidden lg:block">
        <ImageCarousel 
          images={leftCarouselImages} 
          direction="up" 
          speed={25}
          className="h-full"
        />
      </div>
      
      {/* Right Carousel */}
      <div className="absolute right-16 top-0 w-48 h-full opacity-20 pointer-events-none hidden lg:block">
        <ImageCarousel 
          images={rightCarouselImages} 
          direction="down" 
          speed={30}
          className="h-full"
        />
      </div>
      
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 flex items-center justify-center min-h-[85vh] relative z-10">
        <div className="mx-auto max-w-5xl text-center space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 text-sm text-primary bg-muted/50 px-4 py-2 rounded-full border border-border/50">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Virtual Try-On
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            Find Your Perfect
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="block text-primary font-extrabold mt-2"
            >
              Hairstyle
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-xl leading-relaxed text-muted-foreground max-w-3xl mx-auto"
          >
            Experience the future of hair styling with our advanced AI technology. 
            Try on dozens of hairstyles instantly and see exactly how you'll look before making any commitment.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <div>
              <Button 
                onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
                size="lg" 
                className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Start Virtual Try-On</span>
                </div>
              </Button>
            </div>
            
            <div>
              <Button 
                onClick={() => navigateWithLoading("/gallery", "Loading gallery...")}
                variant="outline" 
                size="lg" 
                className="h-14 px-8 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Play className="h-5 w-5" />
                  <span>View Gallery</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </Button>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background"
                    src={`https://i.pravatar.cc/32?img=${i}`}
                    alt={`User ${i}`}
                  />
                ))}
              </div>
              <span className="font-medium">50+ happy customers</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500">★★★★★</span>
              <span className="font-medium">Loved by our users</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}