import { Sparkles, Zap, Star, Share2, User, Smartphone, LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Feature {
  name: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    name: "AI-Powered Matching",
    description: "Advanced algorithms analyze your facial features to recommend hairstyles that complement your unique look perfectly.",
    icon: Sparkles,
  },
  {
    name: "Instant Virtual Try-On",
    description: "See how you'll look with any hairstyle in seconds. No commitment, no regrets - just perfect previews.",
    icon: Zap,
  },
  {
    name: "Premium Style Collection",
    description: "Access thousands of professionally curated hairstyles from classic cuts to the latest trends.",
    icon: Star,
  },
  {
    name: "Easy Sharing & Saving",
    description: "Save your favorites and share them with friends or your stylist for the perfect salon experience.",
    icon: Share2,
  },
  {
    name: "Personalized Recommendations",
    description: "Get suggestions tailored to your face shape, hair type, and personal style preferences.",
    icon: User,
  },
  {
    name: "Mobile-First Design",
    description: "Optimized for all devices - try on hairstyles anywhere, anytime, on any screen size.",
    icon: Smartphone,
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background to-secondary/20">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_50%)] opacity-5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
            Why Choose <span className="font-bold" style={{color: '#584678'}}>HaircutFun</span>?
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover the perfect hairstyle with our AI-powered platform designed for modern hair enthusiasts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={feature.name} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                      {feature.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}