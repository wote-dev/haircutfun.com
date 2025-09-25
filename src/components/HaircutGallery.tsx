"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFreemiumAccess } from "@/hooks/useFreemiumAccess";
import { Button } from "@/components/ui/button";
import { getHaircutsByGender, getCategoriesByGender, type HaircutStyle } from "@/data/haircutStyles";

interface HaircutGalleryProps {
  userPhoto: string;
  selectedGender: 'male' | 'female';
  onHaircutSelect: (haircutId: string) => void;
  onBack: () => void;
}

export function HaircutGallery({ userPhoto, selectedGender, onHaircutSelect, onBack }: HaircutGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { hasProAccess, canGenerate } = useFreemiumAccess();
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const userPhotoRef = useRef<HTMLDivElement>(null);

  // Get haircuts and categories for the selected gender
  const haircutStyles = getHaircutsByGender(selectedGender);
  const categories = getCategoriesByGender(selectedGender);

  // Filter by category
  const filteredStyles = selectedCategory === 'All' 
    ? haircutStyles 
    : haircutStyles.filter((style: HaircutStyle) => style.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Choose Your Hairstyle
          </h2>
          <p className="text-lg text-muted-foreground">
            Select a style to see how it looks on you
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Upload
        </button>
      </div>

      {/* User Photo Preview */}
      <div ref={userPhotoRef} className="mb-8 p-6 bg-muted/30 rounded-2xl">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted">
            <Image
              src={userPhoto}
              alt="Your photo"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Your Photo</h3>
            <p className="text-sm text-muted-foreground">
              Ready for virtual try-on
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category: string) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Haircut Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStyles.map((style: HaircutStyle) => (
          <div
            key={style.id}
            className={`group ${style.isPremium && !hasProAccess ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onMouseEnter={() => setHoveredStyle(style.id)}
            onMouseLeave={() => setHoveredStyle(null)}
            onClick={() => {
              if (style.isPremium && !hasProAccess) {
                // Don't allow selection of premium styles for free users
                return;
              }
              onHaircutSelect(style.id);
              
              // Scroll to the user photo preview section after selection
              setTimeout(() => {
                userPhotoRef.current?.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }, 100);
            }}
          >
            <div className={`bg-background border rounded-2xl overflow-hidden transition-colors ${
              style.isPremium && !hasProAccess 
                ? 'opacity-75 hover:opacity-90' 
                : 'hover:border-primary/50'
            }`}>
              {/* Style Preview */}
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                {/* Premium Badge */}
                {style.isPremium && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-primary/20">
                      PRO
                    </div>
                  </div>
                )}
                {/* Hairstyle Image */}
                {style.image ? (
                  <Image
                    src={style.image}
                    alt={style.name}
                    fill
                    className={`object-cover ${selectedGender === 'male' ? 'object-top' : ''}`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/20 mx-auto mb-3 flex items-center justify-center">
                        <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Preview
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Hover overlay */}
                {hoveredStyle === style.id && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
                      {style.isPremium && !hasProAccess ? (
                        <Link href="/pricing" className="flex items-center gap-2">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Upgrade to Pro
                        </Link>
                      ) : (
                        'Try This Style'
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Style Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">
                    {style.name}
                  </h3>
                  <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                    {style.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {style.description}
                </p>
                
                {/* Popularity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {style.popularity}% match
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 transition-colors p-1">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}