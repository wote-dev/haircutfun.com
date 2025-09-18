import { Sparkles, Zap, Star, Share2, User, Smartphone, LucideIcon, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Feature {
  name: string;
  description: string;
  icon: LucideIcon;
  highlight?: string;
  isPopular?: boolean;
  benefits: string[];
}

const features: Feature[] = [
  {
    name: "AI-Powered Matching",
    description: "Advanced algorithms analyze your facial features to recommend hairstyles that complement your unique look perfectly.",
    icon: Sparkles,
    highlight: "Smart Technology",
    isPopular: true,
    benefits: ["Face shape analysis", "Personalized suggestions", "99% accuracy rate"]
  },
  {
    name: "Instant Virtual Try-On",
    description: "See how you'll look with any hairstyle in seconds. No commitment, no regrets - just perfect previews.",
    icon: Zap,
    highlight: "Lightning Fast",
    benefits: ["Real-time preview", "HD quality results", "Save & compare looks"]
  },
  {
    name: "Premium Style Collection",
    description: "Access thousands of professionally curated hairstyles from classic cuts to the latest trends.",
    icon: Star,
    highlight: "Trending Styles",
    benefits: ["15+ hairstyles", "Celebrity looks", "Regular updates"]
  },
  {
    name: "Easy Sharing & Saving",
    description: "Save your favorites and share them with friends or your stylist for the perfect salon experience.",
    icon: Share2,
    highlight: "Social Ready",
    benefits: ["One-click sharing", "Stylist collaboration", "Personal gallery"]
  },
  {
    name: "Personalized Recommendations",
    description: "Get suggestions tailored to your face shape, hair type, and personal style preferences.",
    icon: User,
    highlight: "Just For You",
    benefits: ["Custom profiles", "Style preferences", "Smart matching"]
  },
  {
    name: "Mobile-First Design",
    description: "Optimized for all devices - try on hairstyles anywhere, anytime, on any screen size.",
    icon: Smartphone,
    highlight: "Always Available",
    benefits: ["Cross-platform", "Offline mode", "Touch optimized"]
  },
];

export function FeaturesSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/10 to-accent/5"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--accent)_0%,_transparent_50%)] opacity-10"></div>
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced header section */}
        <div className="mx-auto max-w-4xl text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
            <Sparkles className="h-4 w-4" />
            Why Choose Us?
          </div>
          <h2 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text">
            Why Choose <span className="font-bold" style={{color: '#584678'}}>HaircutFun</span>?
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Discover the perfect hairstyle with our AI-powered platform designed for modern hair enthusiasts. 
            Experience the future of virtual styling today.
          </p>
        </div>
        
        {/* Enhanced features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.name} 
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-border/50 hover:border-primary/30 bg-card/80 backdrop-blur-sm hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Popular badge */}
                {feature.isPopular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="pb-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <IconComponent className="h-8 w-8" />
                    </div>
                  </div>
                  
                  {feature.highlight && (
                    <Badge variant="outline" className="w-fit mb-3 text-xs font-medium border-primary/30 text-primary">
                      {feature.highlight}
                    </Badge>
                  )}
                  
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300 mb-3">
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="relative z-10 space-y-4">
                  <CardDescription className="text-muted-foreground leading-relaxed text-base">
                    {feature.description}
                  </CardDescription>
                  
                  {/* Benefits list */}
                  <div className="space-y-2 pt-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  

                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Bottom CTA section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border border-border/50">
            <Star className="h-4 w-4 text-yellow-500" />
            Trusted by 1M+ users worldwide
          </div>
        </div>
      </div>
    </section>
  );
}