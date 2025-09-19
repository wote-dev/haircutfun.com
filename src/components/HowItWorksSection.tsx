"use client";

import { Camera, Palette, Sparkles, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    id: "01",
    name: "Upload Your Photo",
    description: "Take a selfie or upload a clear photo of yourself. Our AI works best with front-facing photos in good lighting.",
    icon: Camera,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    id: "02", 
    name: "Choose Your Style",
    description: "Browse our extensive gallery of hairstyles or let our AI recommend styles based on your face shape and preferences.",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    id: "03",
    name: "See the Magic",
    description: "Watch as our advanced AI technology applies your chosen hairstyle to your photo in real-time with stunning accuracy.",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500", 
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            Simple Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            How It Works
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your look in just three simple steps. It's that easy!
          </p>
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative group">
                {/* Connection Line (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
                )}
                
                <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${step.borderColor} border-2`}>
                  <CardContent className="p-8">
                    {/* Step Number Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge variant="outline" className="text-xs font-bold">
                        {step.id}
                      </Badge>
                    </div>
                    
                    {/* Icon with Gradient Background */}
                    <div className={`relative mb-6 ${step.bgColor} rounded-2xl p-4 w-fit mx-auto`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10 rounded-2xl`} />
                      <Icon className={`relative h-8 w-8 text-foreground`} />
                    </div>
                    
                    {/* Content */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-foreground mb-3">
                        {step.name}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Features */}
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-8">
            Ready to transform your look?
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {[
              { icon: CheckCircle, text: "100% Free to Try" },
              { icon: CheckCircle, text: "No Registration Required" },
              { icon: CheckCircle, text: "Instant Results" }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}