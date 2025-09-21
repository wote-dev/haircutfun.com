"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Base images for preview
const baseImages = [
  {
    id: 'example-1',
    src: '/base-image-me.jpeg',
    alt: 'Example Person 1',
    name: 'Daniel'
  },
  {
    id: 'example-2',
    src: '/base-image-woman.png',
    alt: 'Example Person 2',
    name: 'Sarah'
  },
  {
    id: 'example-3',
    src: '/base-image-woman2.jpg',
    alt: 'Example Person 3',
    name: 'Emma'
  },
  {
    id: 'example-4',
    src: '/base-image-guy 2.jpg',
    alt: 'Example Person 4',
    name: 'Mike'
  }
];

// Trending haircut data with gender categories
interface HaircutStyle {
  name: string;
  category: string;
  popularity: number;
  trend: string;
  description: string;
  isPremium?: boolean;
  image?: string;
  variations?: {
    [personId: string]: string; // Maps person ID to their specific haircut image
  };
}

// Function to get the correct haircut image for a specific person
const getHaircutImageForPerson = (haircutName: string, personId: string, defaultImage?: string): string => {
  const haircut = [...trendingHaircuts.female, ...trendingHaircuts.male].find(h => h.name === haircutName);
  if (haircut?.variations?.[personId]) {
    return haircut.variations[personId];
  }
  return defaultImage || haircut?.image || '';
};

const trendingHaircuts: {
  female: HaircutStyle[];
  male: HaircutStyle[];
} = {
  female: [
    { 
      name: "Wolf Cut", 
      category: "Trendy", 
      popularity: 96, 
      trend: "🔥", 
      description: "Edgy mullet-shag hybrid", 
      image: "/wolf-cut2.jpg",
      variations: {
        'example-1': '/wolf-cut.jpg',    // Daniel
        'example-2': '/wolf-cut.png',    // Sarah  
        'example-3': '/wolf-cut2.jpg'    // Emma
      }
    },
    { 
      name: "Curtain Bangs", 
      category: "Medium", 
      popularity: 94, 
      trend: "✨", 
      description: "Face-framing bangs", 
      image: "/curtain-bangs2.jpg",
      variations: {
        'example-1': '/curtain-bangs.jpg',    // Daniel
        'example-2': '/curtain-bangs.png',    // Sarah
        'example-3': '/curtain-bangs2.jpg'    // Emma
      }
    },
    { 
      name: "Modern Shag", 
      category: "Medium", 
      popularity: 91, 
      trend: "💫", 
      description: "Updated 70s classic", 
      image: "/modern-shag2.jpg",
      variations: {
        'example-1': '/modern-shag.jpg',    // Daniel
        'example-2': '/modern-shag.png',    // Sarah
        'example-3': '/modern-shag2.jpg'    // Emma
      }
    },
    { 
      name: "Pixie Cut", 
      category: "Short", 
      popularity: 95, 
      trend: "🔥", 
      description: "Chic and bold", 
      image: "/pixie-cut2.jpg",
      variations: {
        'example-1': '/pixie-cut.jpg',    // Daniel
        'example-2': '/pixie-cut.png',    // Sarah
        'example-3': '/pixie-cut2.jpg'    // Emma
      }
    }
  ],
  male: [
    { 
      name: "Textured Crop", 
      category: "Short", 
      popularity: 86, 
      trend: "🔥", 
      description: "Modern textured styling", 
      image: "/textered-top.png",
      variations: {
        'example-1': '/textered-top.png',    // Daniel
        'example-2': '/textered-top2.jpg',   // Sarah
        'example-3': '/textered-top3.jpg',   // Emma
        'example-4': '/textured-top2.jpg'    // Mike
      }
    },
    { 
      name: "Side Part", 
      category: "Medium", 
      popularity: 91, 
      trend: "✨", 
      description: "Professional classic", 
      image: "/side-part.png",
      variations: {
        'example-1': '/side-part.png',       // Daniel
        'example-2': '/side-part2.jpg',      // Sarah
        'example-3': '/side-part3.jpg',      // Emma
        'example-4': '/side-part2.jpg'       // Mike
      }
    },
    { 
      name: "Quiff", 
      category: "Medium", 
      popularity: 88, 
      trend: "💫", 
      description: "Textured volume style", 
      image: "/quiff.png",
      variations: {
        'example-1': '/quiff.png',           // Daniel
        'example-2': '/quiff2.jpg',          // Sarah
        'example-3': '/quiff3.jpg',          // Emma
        'example-4': '/quiff2.jpg'           // Mike
      }
    },
    { 
      name: "Buzz Cut", 
      category: "Short", 
      popularity: 85, 
      trend: "🔥", 
      description: "Clean minimalist cut", 
      isPremium: true, 
      image: "/buzzcut.png",
      variations: {
        'example-1': '/buzzcut.png',         // Daniel
        'example-2': '/buzzcut2.jpg',        // Sarah
        'example-3': '/buzzcut3.jpg',        // Emma
        'example-4': '/buzzcut2.jpg'         // Mike
      }
    }
  ]
};

export function TrendingHaircuts() {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const [selectedBaseImage, setSelectedBaseImage] = useState<string>(baseImages[0].id);
  const [previewStates, setPreviewStates] = useState<{[key: string]: {baseImageSrc: string, personId: string, isPreview: boolean}}>({});
  const [currentPersonIndex, setCurrentPersonIndex] = useState<{[key: string]: number}>({});
  const currentStyles = trendingHaircuts[selectedGender];

  // Auto-cycle through different people every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPersonIndex(prev => {
        const newIndex = { ...prev };
        currentStyles.forEach(style => {
          if (style.variations && !previewStates[style.name]?.isPreview) {
            // Filter persons based on selected gender
            const genderAppropriatePersons = Object.keys(style.variations).filter(personId => {
              if (selectedGender === 'female') {
                // For female haircuts, only show Sarah (example-2) and Emma (example-3)
                return personId === 'example-2' || personId === 'example-3';
              } else {
                // For male haircuts, only show Daniel (example-1) and Mike (example-4)
                return personId === 'example-1' || personId === 'example-4';
              }
            });
            
            if (genderAppropriatePersons.length > 0) {
              const currentIndex = newIndex[style.name] || 0;
              newIndex[style.name] = (currentIndex + 1) % genderAppropriatePersons.length;
            }
          }
        });
        return newIndex;
      });
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [currentStyles, previewStates, selectedGender]);

  // Reset person indices when gender changes
  useEffect(() => {
    setCurrentPersonIndex({});
  }, [selectedGender]);

  // Helper function to get current cycling person and image
  const getCurrentPersonImage = (style: HaircutStyle) => {
    if (!style.variations) return { image: style.image, personId: null };
    
    // Filter persons based on selected gender
    const genderAppropriatePersons = Object.keys(style.variations).filter(personId => {
      if (selectedGender === 'female') {
        // For female haircuts, only show Sarah (example-2) and Emma (example-3)
        return personId === 'example-2' || personId === 'example-3';
      } else {
        // For male haircuts, only show Daniel (example-1) and Mike (example-4)
        return personId === 'example-1' || personId === 'example-4';
      }
    });
    
    if (genderAppropriatePersons.length === 0) return { image: style.image, personId: null };
    
    const currentIndex = currentPersonIndex[style.name] || 0;
    const personId = genderAppropriatePersons[currentIndex % genderAppropriatePersons.length];
    const image = style.variations[personId];
    
    return { image, personId };
  };

  const handleTryOn = (haircutName: string, baseImageSrc: string) => {
    // Store selected base image source in localStorage for PhotoUpload component
    localStorage.setItem('selectedBaseImage', baseImageSrc);
    // Navigate to try-on page with haircut parameter
    window.location.href = `/try-on?haircut=${encodeURIComponent(haircutName)}`;
  };

  const handleAvatarPreview = (haircutName: string, baseImageSrc: string, personId: string) => {
    setPreviewStates(prev => ({
      ...prev,
      [haircutName]: {
        baseImageSrc,
        personId,
        isPreview: true
      }
    }));
  };

  const resetPreview = (haircutName: string) => {
    setPreviewStates(prev => ({
      ...prev,
      [haircutName]: {
        baseImageSrc: '',
        personId: '',
        isPreview: false
      }
    }));
  };

  return (
    <section className="relative pt-0 pb-16 sm:pb-20 overflow-hidden bg-white">
      
      <div className="container mx-auto px-4 sm:px-6">
        <div className="relative mx-auto max-w-6xl">
          {/* Gallery Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary">Popular Styles</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              Trending Haircuts
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Discover the most popular hairstyles and see how they'll look on you with our AI-powered virtual try-on
            </p>
            
            {/* Gender Selection Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center bg-muted/50 rounded-full p-1 mb-6 sm:mb-8"
            >
              <button
                onClick={() => setSelectedGender('female')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-colors ${
                  selectedGender === 'female'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Women's Styles
              </button>
              <button
                onClick={() => setSelectedGender('male')}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm transition-colors ${
                  selectedGender === 'male'
                    ? 'bg-primary text-primary-foreground'
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
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          >
            {currentStyles.map((style, index) => (
              <motion.div
                key={style.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.5 + index * 0.1,
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25 
                }}
                className="group"
              >
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 shadow-md hover:shadow-xl smooth-lift">
                    {/* Premium Badge */}
                    {style.isPremium && (
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-primary/20">
                          PRO
                        </div>
                      </div>
                    )}
                    
                    {/* Trend Badge */}
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 text-xs font-semibold flex items-center space-x-1">
                        <span>{style.trend}</span>
                        <span className="text-gray-600 hidden sm:inline">Trending</span>
                      </div>
                    </div>
                    
                    {/* Image Display */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 via-accent/10 to-primary/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      
                      {/* Show preview avatar if selected, otherwise show haircut image */}
                      {previewStates[style.name]?.isPreview ? (
                        <div 
                          className="relative w-full h-full cursor-pointer"
                          onClick={() => resetPreview(style.name)}
                          title="Click to exit preview"
                        >
                          <Image
                            src={getHaircutImageForPerson(style.name, previewStates[style.name].personId, previewStates[style.name].baseImageSrc)}
                            alt={`${style.name} on selected person`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                          
                          {/* Simple preview indicator */}
                          <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                            Preview
                          </div>
                        </div>
                      ) : (
                        /* Normal Mode - Show cycling haircut images */
                        <AnimatePresence mode="wait">
                          {(() => {
                            const { image, personId } = getCurrentPersonImage(style);
                            return image ? (
                              <motion.div
                                key={`${style.name}-${personId}`}
                                initial={{ opacity: 0, scale: 1.05 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ 
                                  duration: 0.8,
                                  ease: [0.4, 0.0, 0.2, 1],
                                  opacity: { duration: 0.6 },
                                  scale: { duration: 0.8 }
                                }}
                                className="relative w-full h-full"
                              >
                                <Image
                                  src={image}
                                  alt={`${style.name}${personId ? ` on ${baseImages.find(p => p.id === personId)?.name || 'person'}` : ''}`}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                              </motion.div>
                            ) : (
                              <motion.div 
                                key={`${style.name}-fallback`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <svg className="h-6 w-6 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              </motion.div>
                            );
                          })()}
                        </AnimatePresence>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-colors flex items-end justify-center pb-4 sm:pb-6">
                        <button
                          onClick={() => {
                            // Use the appropriate base image for the selected gender
                            const baseImage = selectedGender === 'male' ? baseImages[0] : baseImages[1];
                            handleTryOn(style.name, baseImage.src);
                          }}
                          className="bg-white text-primary px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 shadow-lg"
                        >
                          <span>Try On</span>
                          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Style Info */}
                    <div className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <h3 className="font-bold text-sm sm:text-base lg:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {style.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-600">
                            {style.popularity}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <span className="text-xs sm:text-sm text-muted-foreground bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                          {style.category}
                        </span>
                        <span className="text-xs text-primary font-semibold hidden sm:inline">
                          {style.popularity}% match rate
                        </span>
                      </div>
                      
                      {/* Base Image Preview Section - Hidden on mobile for space */}
                      <div className="border-t border-gray-100 pt-3 sm:pt-4 hidden sm:block">
                        <p className="text-xs text-muted-foreground mb-2 sm:mb-3 font-medium">Try on:</p>
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-2">
                            {baseImages
                              .filter((baseImage, baseIndex) => {
                                // Show male base images for male styles, female base images for female styles
                                if (selectedGender === 'male') {
                                  return baseIndex === 0 || baseIndex === 3; // Show both Daniel's and Mike's images for male styles
                                } else {
                                  return baseIndex === 1 || baseIndex === 2; // Show both Sarah's and Emma's images for female styles
                                }
                              })
                              .map((baseImage, filteredIndex) => (
                              <button
                                key={baseImage.id}
                                onClick={() => handleAvatarPreview(style.name, baseImage.src, baseImage.id)}
                                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 transition-all duration-200 hover:border-primary hover:scale-110 border-gray-200 hover:shadow-md"
                                title={`Preview ${style.name} on ${baseImage.name}`}
                              >
                                <Image
                                  src={baseImage.src}
                                  alt={baseImage.alt}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Click to preview
                          </span>
                        </div>
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
            className="text-center mt-8 sm:mt-12"
          >
            <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-colors">
              <Link href="/gallery" className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5" />
                <span>View All Styles</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}