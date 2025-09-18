"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: "✨",
    title: "Your Personal Hair Whisperer",
    description: "We get to know your face like your best friend does - then suggest cuts that'll make you feel like the main character."
  },
  {
    icon: "⚡",
    title: "Lightning-Fast Makeovers",
    description: "From 'meh' to 'wow' in seconds. Because who has time to wonder 'what if' when you could just know?"
  },
  {
    icon: "📱",
    title: "Fits in Your Pocket",
    description: "Hair inspiration strikes anywhere - waiting for coffee, scrolling in bed, or avoiding small talk in elevators."
  },
  {
    icon: "🎨",
    title: "Curated by the Cool Kids",
    description: "Our style collection comes straight from the salons where celebrities get their 'I woke up like this' looks."
  },
  {
    icon: "🔒",
    title: "Your Secrets Are Safe",
    description: "What happens in HaircutFun stays in HaircutFun. Your photos disappear faster than your motivation to work out."
  },
  {
    icon: "💾",
    title: "Screenshot-Worthy Results",
    description: "Save the winners, share the stunners, and show your stylist exactly what 'just a trim' really means."
  }
];

const achievements = [
  { number: "15+", label: "Hairstyles Available" },
  { number: "AI-Powered", label: "Technology" },
  { number: "Instant", label: "Results" },
  { number: "24/7", label: "Available" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-6 sm:text-5xl lg:text-6xl">
            About HaircutFun
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            We&apos;re revolutionizing how people discover their perfect hairstyle using cutting-edge AI technology and professional styling expertise.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Finding the perfect hairstyle shouldn&apos;t be a guessing game. We believe everyone deserves to feel confident and beautiful, which is why we created HaircutFun - an advanced virtual hairstyle try-on platform designed to transform how people approach hair styling.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By combining artificial intelligence with professional styling expertise, we help you discover hairstyles that complement your unique features, lifestyle, and personality - all before you step foot in a salon.
            </p>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Built for the Future of Beauty
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform represents the next generation of beauty technology, designed to scale with growing demand.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why HaircutFun Hits Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We&apos;re not just another app - we&apos;re your hair transformation sidekick, minus the judgment and awkward small talk.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border rounded-2xl p-8 hover:shadow-lg transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                The Technology Behind HaircutFun
              </h2>
              <p className="text-lg text-muted-foreground">
                Enterprise-grade AI technology designed for millions of transformations
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  Advanced AI Processing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Facial Recognition</h4>
                      <p className="text-muted-foreground text-sm">Our AI identifies key facial features and proportions with precision</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Style Matching</h4>
                      <p className="text-muted-foreground text-sm">Intelligent algorithms match styles to your unique face shape</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Realistic Rendering</h4>
                      <p className="text-muted-foreground text-sm">Advanced graphics create photorealistic results at scale</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
                <div className="h-32 w-32 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                  <svg className="h-16 w-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Powered by Machine Learning
                </h4>
                <p className="text-muted-foreground text-sm">
                  Trained on extensive hairstyle datasets to deliver increasingly accurate results as our platform grows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth & Vision Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Growing the Future of Beauty Tech
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-background border rounded-2xl p-8">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Rapid Innovation
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform evolves daily with new features, styles, and AI improvements based on cutting-edge research and user feedback.
                </p>
              </div>
              <div className="bg-background border rounded-2xl p-8">
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Global Reach
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Built to serve beauty enthusiasts worldwide, with infrastructure designed to handle massive scale and diverse styling preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/20 via-background to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6 sm:text-5xl lg:text-6xl">
                Ready to Discover Your
                <span className="block text-primary font-extrabold mt-2">
                  Perfect Style?
                </span>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary mr-2" />
                <span className="text-lg font-medium text-primary">Join the Movement</span>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Be part of the growing community of beauty enthusiasts discovering their ideal hairstyles with cutting-edge AI technology.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button asChild size="lg" className="group h-16 px-10 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
                <Link href="/try-on" className="flex items-center space-x-3">
                  <Sparkles className="h-6 w-6" />
                  <span>Try Virtual Haircuts</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="group h-16 px-10 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-colors">
                <Link href="/gallery" className="flex items-center space-x-3">
                  <Zap className="h-6 w-6" />
                  <span>Browse Styles</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 text-sm text-muted-foreground"
            >
              ✨ No commitment required • Instant results • Privacy protected
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}