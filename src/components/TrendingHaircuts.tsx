"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { useState } from "react";

// Trending haircut data with gender categories
const trendingHaircuts = {
  female: [
    { name: "Wolf Cut", category: "Trendy", popularity: 96, trend: "🔥", description: "Edgy mullet-shag hybrid" },
    { name: "Curtain Bangs", category: "Medium", popularity: 94, trend: "✨", description: "Face-framing bangs" },
    { name: "Modern Shag", category: "Medium", popularity: 91, trend: "💫", description: "Updated 70s classic" },
    { name: "Pixie Cut", category: "Short", popularity: 95, trend: "🔥", description: "Chic and bold" }
  ],
  male: [
    { name: "Textured Crop", category: "Short", popularity: 86, trend: "🔥", description: "Modern textured styling" },
    { name: "Side Part", category: "Medium", popularity: 91, trend: "✨", description: "Professional classic" },
    { name: "Quiff", category: "Medium", popularity: 88, trend: "💫", description: "Textured volume style" },
    { name: "Undercut Fade", category: "Short", popularity: 82, trend: "🔥", description: "Edgy faded sides" }
  ]
};

export function TrendingHaircuts() {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const currentStyles = trendingHaircuts[selectedGender];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-muted/30 via-background to-secondary/20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl"></div>
      
      <div className="container mx-auto px-4">
        <div className="relative mx-auto max-w-6xl">
          {/* Gallery Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-6"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Popular Styles</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trending Haircuts
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover the most popular hairstyles and see how they'll look on you with our AI-powered virtual try-on
            </p>
            
            {/* Gender Selection Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center bg-muted/50 rounded-full p-1 mb-8"
            >
              <button
                onClick={() => setSelectedGender('female')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedGender === 'female'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Women's Styles
              </button>
              <button
                onClick={() => setSelectedGender('male')}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  selectedGender === 'male'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Men's Styles
              </button>
            </motion.div>
          </div>

          {/* Gallery Grid */}
          <motion.div 
            key={selectedGender}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {currentStyles.map((style, index) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-500">
                  {/* Trend Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold flex items-center space-x-1">
                      <span>{style.trend}</span>
                      <span className="text-gray-600">Trending</span>
                    </div>
                  </div>
                  
                  {/* Image Placeholder with Gradient */}
                  <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      >
                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </motion.div>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center space-x-2 shadow-lg"
                      >
                        <span>Try On</span>
                        <ArrowRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Style Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {style.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-600">
                          {style.popularity}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                        {style.category}
                      </span>
                      <span className="text-xs text-primary font-semibold">
                        {style.popularity}% match rate
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-12"
          >
            <Link
              href="/gallery"
              className="inline-flex items-center space-x-3 px-8 py-4 border-glow-multi bg-background text-foreground font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <span>View All Styles</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}