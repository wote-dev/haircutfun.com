"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Users, Zap, CheckCircle, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Precision",
    description: "Advanced facial recognition technology that understands your unique features and suggests the most flattering hairstyles."
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "See your new look in seconds, not hours. Our lightning-fast processing gives you immediate feedback on any style."
  },
  {
    icon: Users,
    title: "Professional Curated",
    description: "Every hairstyle in our collection is handpicked by professional stylists from top salons worldwide."
  }
];

const stats = [
  { number: "15+", label: "Hairstyles Available" },
  { number: "95%", label: "Accuracy Rate" },
  { number: "24/7", label: "Available" },
  { number: "1M+", label: "Try-Ons Generated" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 text-sm font-medium">
              About HaircutFun
            </Badge>
            <h1 className="text-4xl font-bold text-foreground mb-6 sm:text-5xl lg:text-6xl">
              Discover Your Perfect
              <span className="block text-primary mt-2">Hairstyle with AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing how people discover their perfect hairstyle using cutting-edge AI technology and professional styling expertise.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold mb-4">Our Mission</CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  Making hairstyle discovery accessible, accurate, and enjoyable for everyone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed text-center">
                  Finding the perfect hairstyle shouldn't be a guessing game. We believe everyone deserves to feel confident and beautiful, which is why we created HaircutFun - an advanced virtual hairstyle try-on platform.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed text-center">
                  By combining artificial intelligence with professional styling expertise, we help you discover hairstyles that complement your unique features, lifestyle, and personality - all before you step foot in a salon.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose HaircutFun?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets professional expertise to deliver the best virtual hairstyle experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-semibold">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Advanced AI Technology
              </h2>
              <p className="text-lg text-muted-foreground">
                Built with cutting-edge machine learning for accurate and realistic results
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                    <Star className="h-6 w-6 text-primary" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Facial Analysis</h4>
                      <p className="text-muted-foreground text-sm">AI identifies key facial features and proportions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Style Matching</h4>
                      <p className="text-muted-foreground text-sm">Intelligent algorithms match styles to your face shape</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Realistic Rendering</h4>
                      <p className="text-muted-foreground text-sm">Advanced graphics create photorealistic results</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="text-center p-8">
                  <div className="h-24 w-24 rounded-full bg-primary/10 mx-auto mb-6 flex items-center justify-center">
                    <Crown className="h-12 w-12 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3">
                    Enterprise-Grade AI
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Our machine learning models are trained on millions of hairstyle combinations to deliver the most accurate and realistic virtual try-on experience possible.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6 sm:text-5xl">
                Ready to Find Your
                <span className="block text-primary mt-2">Perfect Style?</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
                Join thousands of users who have discovered their ideal hairstyle with our AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="h-12 px-8 text-lg font-semibold">
                  <Link href="/try-on" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Try Virtual Haircuts
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg font-semibold">
                  <Link href="/gallery" className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Browse Gallery
                  </Link>
                </Button>
              </div>

              <div className="mt-8 text-sm text-muted-foreground">
                ✨ Free to try • Instant results • No commitment required
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}