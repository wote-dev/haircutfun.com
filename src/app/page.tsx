"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "../components/HeroSection";
import { TrendingHaircuts } from "../components/TrendingHaircuts";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";

export default function Home() {
  const { navigateWithLoading } = usePageTransitionContext();
  
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrendingHaircuts />
      <HowItWorksSection />
      
      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-muted/30 via-background to-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to Find Your Perfect Haircut?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of users who have discovered their ideal hairstyle with HaircutFun.
          </p>
          <Button
            onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
            size="lg"
            className="h-16 px-10 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6" />
              <span>Start Your Virtual Try-On</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </Button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
      </section>
    </div>
  );
}
