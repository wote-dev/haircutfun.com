"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";
import { ImageCarousel } from "./ImageCarousel";

export function HeroSection() {
  const { navigateWithLoading } = usePageTransitionContext();
  
  // Carousel images for left and right sides
  // Left side: Women's hairstyles from filler images
  const leftCarouselImages = [
    "/FILLER-IMAGES-WOMEN/modernshag.png",
    "/FILLER-IMAGES-WOMEN/pixiecut.png",
    "/FILLER-IMAGES-WOMEN/curtainbangs.png",
    "/FILLER-IMAGES-WOMEN/bluntbob.png",
    "/FILLER-IMAGES-WOMEN/classicbob.png",
    "/modern-shag2.jpg",    // Keep some existing for variety
    "/pixie-cut2.jpg",
    "/curtain-bangs2.jpg"
  ];
  
  // Right side: Men's hairstyles from filler images
  const rightCarouselImages = [
    "/FILLER-IMAGES-MALE/sidepart.png",
    "/FILLER-IMAGES-MALE/texturedcrop.png",
    "/FILLER-IMAGES-MALE/Pompadour.png",
    "/FILLER-IMAGES-MALE/buzzcut.png",
    "/FILLER-IMAGES-MALE/crewcut.jpg",
    "/side-part.png",       // Keep some existing for variety
    "/quiff.png",
    "/textered-top.png"
  ];

  // Mobile carousel images - mix of both men's and women's styles
  const mobileCarouselImages = [
    "/FILLER-IMAGES-WOMEN/modernshag.png",
    "/FILLER-IMAGES-MALE/sidepart.png",
    "/FILLER-IMAGES-WOMEN/pixiecut.png",
    "/FILLER-IMAGES-MALE/texturedcrop.png",
    "/FILLER-IMAGES-WOMEN/curtainbangs.png",
    "/FILLER-IMAGES-MALE/Pompadour.png",
    "/FILLER-IMAGES-WOMEN/bluntbob.png",
    "/FILLER-IMAGES-MALE/buzzcut.png",
    "/FILLER-IMAGES-WOMEN/classicbob.png",
    "/FILLER-IMAGES-MALE/crewcut.jpg"
  ];
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 min-h-screen flex items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16">
      {/* Left Carousel */}
      <div className="absolute left-8 xl:left-16 top-0 w-32 xl:w-48 h-full opacity-20 pointer-events-none hidden lg:block">
        <ImageCarousel 
          images={leftCarouselImages} 
          direction="up" 
          speed={25}
          className="h-full"
          priorityCount={8}
        />
      </div>
      
      {/* Right Carousel */}
      <div className="absolute right-8 xl:right-16 top-0 w-32 xl:w-48 h-full opacity-20 pointer-events-none hidden lg:block">
        <ImageCarousel 
          images={rightCarouselImages} 
          direction="down" 
          speed={30}
          className="h-full"
          priorityCount={8}
        />
      </div>
      
      {/* Enhanced background decorations - optimized for mobile */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 sm:w-80 h-40 sm:h-80 bg-accent/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-96 h-48 sm:h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-center min-h-[85vh] relative z-10">
        <div className="mx-auto max-w-5xl text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-primary bg-muted/50 px-3 sm:px-4 py-2 rounded-full border border-border/50 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              AI-Powered Virtual Try-On
            </div>
          </motion.div>

          {/* Main heading - improved mobile typography */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-tight"
          >
            Find Your Perfect
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="block text-primary font-extrabold mt-1 sm:mt-2"
            >
              Hairstyle
            </motion.span>
          </motion.h1>

          {/* Mobile Carousel - Enhanced for better touch interaction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="block lg:hidden py-4 sm:py-6"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <motion.div
                className="flex gap-3 sm:gap-4"
                animate={{
                  x: [0, `${-(mobileCarouselImages.length * (64 + 12))}px`] // Calculate based on image width (64px) + gap (12px)
                }}
                transition={{
                  duration: mobileCarouselImages.length * 2, // Adjust speed based on number of images
                  repeat: Infinity,
                  ease: "linear",
                  repeatType: "loop"
                }}
                style={{ touchAction: 'pan-y' }} // Allow vertical scrolling while carousel moves
              >
                {/* Triple duplicate images for truly seamless infinite loop */}
                {[...mobileCarouselImages, ...mobileCarouselImages, ...mobileCarouselImages].map((image, index) => (
                  <motion.div
                    key={`mobile-${image}-${index}`}
                    className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-lg ring-1 ring-border/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Image
                      src={image}
                      alt={`Hairstyle ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 16vw, (max-width: 768px) 20vw, 24vw"
                      quality={80}
                      priority={index < 6}
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </motion.div>
            </div>
            
            {/* Mobile carousel subtitle */}
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 opacity-75">
              Popular hairstyles you can try
            </p>
          </motion.div>

          {/* Subtitle - improved mobile readability */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground max-w-sm sm:max-w-md md:max-w-3xl mx-auto px-2 sm:px-4 md:px-0"
          >
            Experience the future of hair styling with our advanced AI technology. 
            Try on dozens of hairstyles instantly and see exactly how you'll look before making any commitment.
          </motion.p>

          {/* CTA Buttons - Enhanced mobile touch targets */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4 sm:px-0"
          >
            <Button 
              onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
              size="lg" 
              className="w-auto max-w-xs sm:max-w-none h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-95 touch-manipulation"
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Start Virtual Try-On</span>
              </div>
            </Button>
            
            <Button 
              onClick={() => navigateWithLoading("/gallery", "Loading gallery...")}
              variant="outline" 
              size="lg" 
              className="w-auto max-w-xs sm:max-w-none h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 active:scale-95 touch-manipulation"
            >
              <div className="flex items-center justify-center space-x-2">
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>View Gallery</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </div>
            </Button>
          </motion.div>

          {/* Social proof - Enhanced mobile layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-1 sm:-space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-background overflow-hidden ring-1 ring-border/20">
                    <Image
                      src={`https://i.pravatar.cc/32?img=${i}`}
                      alt={`User ${i}`}
                      fill
                      className="object-cover"
                      sizes="32px"
                      quality={80}
                      priority={i <= 2}
                      loading={i <= 2 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
              <span className="font-medium">50+ happy customers</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-500 text-sm sm:text-base">★★★★★</span>
              <span className="font-medium">Loved by our users</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}