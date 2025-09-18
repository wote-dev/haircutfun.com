"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUsageTracker } from "@/hooks/useUsageTracker";
import { Button } from "@/components/ui/button";

interface HaircutGalleryProps {
  userPhoto: string;
  selectedGender: 'male' | 'female';
  onHaircutSelect: (haircutId: string) => void;
  onBack: () => void;
}

// Mock haircut data - in a real app, this would come from an API
const haircutStyles = [
  // Female hairstyles
  {
    id: 'pixie-cut',
    name: 'Pixie Cut',
    category: 'Short',
    gender: 'female' as const,
    description: 'A chic, short hairstyle that frames the face beautifully',
    popularity: 95,
    isPremium: true,
  },
  {
    id: 'bob-classic',
    name: 'Classic Bob',
    category: 'Medium',
    gender: 'female' as const,
    description: 'Timeless bob that works for any face shape',
    popularity: 88,
  },
  {
    id: 'long-layers',
    name: 'Long Layers',
    category: 'Long',
    gender: 'female' as const,
    description: 'Flowing layers that add movement and volume',
    popularity: 92,
    isPremium: true,
  },
  {
    id: 'shag-modern',
    name: 'Modern Shag',
    category: 'Medium',
    gender: 'female' as const,
    description: 'Trendy shag with textured layers and bangs',
    popularity: 85,
    isPremium: true,
  },
  {
    id: 'lob-wavy',
    name: 'Wavy Lob',
    category: 'Medium',
    gender: 'female' as const,
    description: 'Long bob with natural waves for a relaxed look',
    popularity: 90,
    isPremium: true,
  },
  {
    id: 'curtain-bangs',
    name: 'Curtain Bangs',
    category: 'Long',
    gender: 'female' as const,
    description: 'Face-framing bangs that part in the middle',
    popularity: 87,
  },
  {
    id: 'beach-waves',
    name: 'Beach Waves',
    category: 'Long',
    gender: 'female' as const,
    description: 'Effortless waves for a natural, beachy look',
    popularity: 89,
  },
  {
    id: 'blunt-bob',
    name: 'Blunt Bob',
    category: 'Short',
    gender: 'female' as const,
    description: 'Sharp, clean lines for a modern sophisticated look',
    popularity: 84,
  },
  // Male hairstyles
  {
    id: 'buzz-cut',
    name: 'Buzz Cut',
    category: 'Short',
    gender: 'male' as const,
    description: 'Clean, minimalist cut that\'s easy to maintain',
    popularity: 85,
    isPremium: true,
  },
  {
    id: 'undercut-fade',
    name: 'Undercut Fade',
    category: 'Short',
    gender: 'male' as const,
    description: 'Edgy cut with faded sides and longer top',
    popularity: 82,
  },
  {
    id: 'crew-cut',
    name: 'Crew Cut',
    category: 'Short',
    gender: 'male' as const,
    description: 'Classic military-inspired short cut',
    popularity: 85,
  },
  {
    id: 'pompadour',
    name: 'Pompadour',
    category: 'Medium',
    gender: 'male' as const,
    description: 'Vintage-inspired style with volume on top',
    popularity: 79,
    isPremium: true,
  },
  {
    id: 'quiff',
    name: 'Quiff',
    category: 'Medium',
    gender: 'male' as const,
    description: 'Modern style with textured volume at the front',
    popularity: 88,
    isPremium: true,
  },
  {
    id: 'side-part',
    name: 'Side Part',
    category: 'Medium',
    gender: 'male' as const,
    description: 'Professional look with a clean side part',
    popularity: 91,
  },
  {
    id: 'man-bun',
    name: 'Man Bun',
    category: 'Long',
    gender: 'male' as const,
    description: 'Long hair styled into a trendy top knot',
    popularity: 76,
  },
  {
    id: 'textured-crop',
    name: 'Textured Crop',
    category: 'Short',
    gender: 'male' as const,
    description: 'Modern crop with textured styling on top',
    popularity: 86,
  },
];

const categories = ['All', 'Short', 'Medium', 'Long'];

export function HaircutGallery({ userPhoto, selectedGender, onHaircutSelect, onBack }: HaircutGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { hasPremium, remainingTries } = useUsageTracker();
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

  // Filter by gender first, then by category
  const genderFilteredStyles = haircutStyles.filter(style => style.gender === selectedGender);
  const filteredStyles = selectedCategory === 'All' 
    ? genderFilteredStyles 
    : genderFilteredStyles.filter(style => style.category === selectedCategory);

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
      <div className="mb-8 p-6 bg-muted/30 rounded-2xl">
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
        {categories.map((category) => (
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
        {filteredStyles.map((style) => (
          <div
            key={style.id}
            className={`group ${style.isPremium && !hasPremium ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onMouseEnter={() => setHoveredStyle(style.id)}
            onMouseLeave={() => setHoveredStyle(null)}
            onClick={() => {
              if (style.isPremium && !hasPremium) {
                // Don't allow selection of premium styles for free users
                return;
              }
              onHaircutSelect(style.id);
            }}
          >
            <div className={`bg-background border rounded-2xl overflow-hidden transition-colors ${
              style.isPremium && !hasPremium 
                ? 'opacity-75 hover:opacity-90' 
                : 'hover:border-primary/50'
            }`}>
              {/* Style Preview */}
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                {/* Premium Badge */}
                {style.isPremium && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      PRO
                    </div>
                  </div>
                )}
                {/* Placeholder for haircut preview */}
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
                
                {/* Hover overlay */}
                {hoveredStyle === style.id && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
                      {style.isPremium && !hasPremium ? (
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

      {/* Bottom Info */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">
          Can't find the perfect style? Our AI will recommend more options based on your face shape.
        </p>
        <Button variant="ghost" className="text-primary hover:text-primary/80 font-medium transition-colors">
          Get AI Recommendations →
        </Button>
      </div>
    </div>
  );
}