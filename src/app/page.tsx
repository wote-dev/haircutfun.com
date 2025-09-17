import Link from "next/link";
import { HeroSection } from "../components/HeroSection";
import { TrendingHaircuts } from "../components/TrendingHaircuts";
import { FeaturesSection } from "../components/FeaturesSection";
import { HowItWorksSection } from "../components/HowItWorksSection";

export default function Home() {
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
          <Link
            href="/try-on"
            className="inline-flex items-center px-10 py-5 border-glow-multi bg-background text-foreground font-bold rounded-2xl text-lg shadow-xl smooth-lift"
          >
            Start Your Virtual Try-On
            <svg className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
      </section>
    </div>
  );
}
