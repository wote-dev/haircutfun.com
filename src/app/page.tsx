"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSection } from "../components/HeroSection";
import { TrendingHaircuts } from "../components/TrendingHaircuts";
import { HowItWorksSection } from "../components/HowItWorksSection";
import { FAQSection } from "@/components/FAQSection";
import { usePageTransitionContext } from "@/components/providers/PageTransitionProvider";

export default function Home() {
  const { navigateWithLoading } = usePageTransitionContext();
  
  return (
      <main className="min-h-screen">
        <HeroSection />
        <TrendingHaircuts />
        <HowItWorksSection />
        <FAQSection />
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join dozens of users who've discovered their perfect hairstyle with HaircutFun
            </p>
            <Link href="/try-on">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
                <div className="flex items-center space-x-2">
                  <span>Start Your Transformation</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Button>
            </Link>
          </div>
        </section>
      </main>
  );
}
