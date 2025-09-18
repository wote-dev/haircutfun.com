"use client";

import Link from "next/link";
import { HeroSection } from "../components/HeroSection";
import { TrendingHaircuts } from "../components/TrendingHaircuts";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";

export default function Home() {
  const { navigateWithLoading } = usePageTransitionContext();
  
  return (
    <div className="flex flex-col">
      <HeroSection />
      <TrendingHaircuts />
      <FeaturesSection />
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
          <button
            onClick={() => navigateWithLoading("/try-on", "Preparing your virtual try-on...")}
            className="group h-16 px-10 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 relative overflow-hidden rounded-2xl hover:scale-105 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 relative z-10">
              <span>Start Your Virtual Try-On</span>
              <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            </div>
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
      </section>
    </div>
  );
}
