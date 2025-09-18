"use client";

import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Fashion Blogger",
    avatar: "/base-image-woman.png",
    rating: 5,
    text: "HaircutFun completely transformed how I approach hairstyling! The AI recommendations were spot-on and helped me find a cut that perfectly suits my face shape. I've never felt more confident!",
    highlight: "Perfect face shape match"
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    role: "Creative Director",
    avatar: "/base-image-guy 2.jpg",
    rating: 5,
    text: "As someone who's always been hesitant about trying new hairstyles, this app was a game-changer. I could see exactly how I'd look before committing. The results were incredibly realistic!",
    highlight: "Realistic previews"
  },
  {
    id: 3,
    name: "Emma Thompson",
    role: "Marketing Manager",
    avatar: "/base-image-woman2.jpg",
    rating: 5,
    text: "I showed the results to my stylist and she was amazed at how accurate the virtual try-on was. It made our consultation so much easier and I got exactly the look I wanted!",
    highlight: "Stylist approved"
  }
];

const stats = [
  { number: "10K+", label: "Happy Users" },
  { number: "4.9/5", label: "Average Rating" },
  { number: "95%", label: "Satisfaction Rate" },
  { number: "15+", label: "Hairstyles Available" }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            User Reviews
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Loved by Thousands
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See what our users are saying about their HaircutFun experience
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10">
                  <Quote className="h-8 w-8 text-primary" />
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Testimonial Text */}
                <p className="text-muted-foreground leading-relaxed mb-6 relative z-10">
                  "{testimonial.text}"
                </p>
                
                {/* Highlight Badge */}
                <Badge variant="outline" className="mb-4 text-xs">
                  {testimonial.highlight}
                </Badge>
                
                {/* User Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-4">
            Join dozens of satisfied users
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span>4.9/5 from 10,000+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}