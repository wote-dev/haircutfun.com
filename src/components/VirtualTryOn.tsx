"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFreemiumAccess } from "@/hooks/useFreemiumAccess";
import { useAuth } from "@/components/providers/AuthProvider";

interface VirtualTryOnProps {

  userPhoto: string;
  selectedHaircut: string;
  onReset: () => void;
  onBack: () => void;
}

// Mock haircut data
const haircutData: Record<string, { name: string; category: string; gender: 'male' | 'female'; description: string; isPremium?: boolean; popularity?: number }> = {
  // Female hairstyles
  'pixie-cut': {
    name: 'Pixie Cut',
    category: 'Short',
    gender: 'female',
    description: 'A chic, short hairstyle that frames the face beautifully',
    isPremium: true,
    popularity: 95
  },
  'bob-classic': {
    name: 'Classic Bob',
    category: 'Medium',
    gender: 'female',
    description: 'Timeless bob that works for any face shape'
  },
  'long-layers': {
    name: 'Long Layers',
    category: 'Long',
    gender: 'female',
    description: 'Flowing layers that add movement and volume',
    isPremium: true,
    popularity: 92
  },
  'shag-modern': {
    name: 'Modern Shag',
    category: 'Medium',
    gender: 'female',
    description: 'Trendy shag with textured layers and bangs',
    isPremium: true,
    popularity: 85
  },
  'lob-wavy': {
    name: 'Wavy Lob',
    category: 'Medium',
    gender: 'female',
    description: 'Long bob with natural waves for a relaxed look',
    isPremium: true,
    popularity: 90
  },
  'curtain-bangs': {
    name: 'Curtain Bangs',
    category: 'Long',
    gender: 'female',
    description: 'Face-framing bangs that part in the middle'
  },
  'beach-waves': {
    name: 'Beach Waves',
    category: 'Long',
    gender: 'female',
    description: 'Effortless waves for a natural, beachy look'
  },
  'blunt-bob': {
    name: 'Blunt Bob',
    category: 'Short',
    gender: 'female',
    description: 'Sharp, clean lines for a modern sophisticated look'
  },
  'wolf-cut': {
    name: 'Wolf Cut',
    category: 'Trendy',
    gender: 'female',
    description: 'Edgy mullet-shag hybrid with layers and texture',
    isPremium: true,
    popularity: 96
  },
  // Male hairstyles
  'buzz-cut': {
    name: 'Buzz Cut',
    category: 'Short',
    gender: 'male',
    description: 'Clean, minimalist cut that\'s easy to maintain',
    isPremium: true,
    popularity: 85
  },
  'undercut-fade': {
    name: 'Undercut Fade',
    category: 'Short',
    gender: 'male',
    description: 'Edgy cut with faded sides and longer top',
    popularity: 82
  },
  'crew-cut': {
    name: 'Crew Cut',
    category: 'Short',
    gender: 'male',
    description: 'Classic military-inspired short cut'
  },
  'pompadour': {
    name: 'Pompadour',
    category: 'Medium',
    gender: 'male',
    description: 'Vintage-inspired style with volume on top',
    isPremium: true,
    popularity: 87
  },
  'quiff': {
    name: 'Quiff',
    category: 'Medium',
    gender: 'male',
    description: 'Modern style with textured volume at the front',
    isPremium: true,
    popularity: 89
  },
  'side-part': {
    name: 'Side Part',
    category: 'Medium',
    gender: 'male',
    description: 'Professional look with a clean side part'
  },
  'man-bun': {
    name: 'Man Bun',
    category: 'Long',
    gender: 'male',
    description: 'Long hair styled into a trendy top knot'
  },
  'textured-crop': {
    name: 'Textured Crop',
    category: 'Short',
    gender: 'male',
    description: 'Modern crop with textured styling on top'
  },
  'modern-mullet': {
    name: 'Modern Mullet',
    category: 'Medium',
    gender: 'male',
    description: 'Contemporary take on the classic mullet with shorter sides',
    isPremium: true,
    popularity: 93
  },
  'textured-quiff': {
    name: 'Textured Quiff',
    category: 'Medium',
    gender: 'male',
    description: 'Bold volume with effortless texture and movement',
    isPremium: true,
    popularity: 91
  },
  'edgar-cut': {
    name: 'Edgar Cut',
    category: 'Short',
    gender: 'male',
    description: 'Sharp, defined edges with a straight fringe across the forehead',
    popularity: 88
  },
  'broccoli-cut': {
    name: 'Broccoli Cut',
    category: 'Short',
    gender: 'male',
    description: 'Layered curls on top with tapered sides, embracing natural texture',
    popularity: 86
  },
  'heartthrob-90s': {
    name: '90s Heartthrob',
    category: 'Medium',
    gender: 'male',
    description: 'Naturally grown out with clean edges for that old money aesthetic',
    isPremium: true,
    popularity: 89
  },
};

export function VirtualTryOn({ userPhoto, selectedHaircut, onReset, onBack }: VirtualTryOnProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const { user } = useAuth();
  const { hasProAccess, freeTriesUsed, canGenerate, isLoading: freemiumLoading } = useFreemiumAccess();
  const resultSectionRef = useRef<HTMLDivElement>(null);

  // Map trending haircut names to haircutData keys
  const mapHaircutNameToKey = (name: string): string => {
    const nameToKeyMap: Record<string, string> = {
      'Wolf Cut': 'wolf-cut',
      'Curtain Bangs': 'curtain-bangs',
      'Modern Shag': 'shag-modern',
      'Pixie Cut': 'pixie-cut',
      'Textured Crop': 'textured-crop',
      'Side Part': 'side-part',
      'Quiff': 'quiff',
      'Undercut Fade': 'undercut-fade',
      'Modern Mullet': 'modern-mullet',
      'Textured Quiff': 'textured-quiff',
      'Edgar Cut': 'edgar-cut',
      'Broccoli Cut': 'broccoli-cut',
      '90s Heartthrob': 'heartthrob-90s'
    };
    
    return nameToKeyMap[name] || selectedHaircut;
  };

  const haircutKey = mapHaircutNameToKey(selectedHaircut);
  const selectedStyle = haircutData[haircutKey];

  useEffect(() => {
    // Generate if freemium data is loaded
    if (!freemiumLoading) {
      generateHaircutImage();
    }
  }, [userPhoto, selectedHaircut, freemiumLoading]);

  const generateHaircutImage = async () => {
    setIsProcessing(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/generate-haircut', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPhoto,
          haircutStyle: selectedHaircut,
          isFirstTry: !user && freeTriesUsed === 0, // For non-authenticated users, check if it's their first try
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402 && data?.error === 'Free trial used') {
          // User has used their free try
          setShowPaywall(true);
          setIsProcessing(false);
          return;
        }
        
        // Use the detailed error message from the API if available
        const errorMessage = data?.details || data?.error || `HTTP ${response.status}: Failed to generate haircut`;
        throw new Error(errorMessage);
      }

      if (data.success && data.imageData) {
        setGeneratedImage(`data:image/jpeg;base64,${data.imageData}`);
        setDescription(''); // Clear any previous description
        
        // Update localStorage for non-authenticated users after successful generation
        if (!user && !hasProAccess) {
          try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const localData = {
              freeTriesUsed: 1, // Mark that they've used their free try
              lastUsed: new Date().toISOString(),
              monthYear: currentMonth
            };
            localStorage.setItem('haircutfun_usage', JSON.stringify(localData));
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
        }
        
        // Scroll to the result section after a brief delay to ensure the image is rendered
        setTimeout(() => {
          resultSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      } else {
        setError('Failed to get image data from the API response.');
      }
    } catch (err) {
      console.error('Error generating haircut:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while generating the haircut.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!generatedImage || !user) {
      console.error('Cannot save: missing generated image or user');
      return;
    }

    setIsSaved(true);
    
    try {
      const response = await fetch('/api/save-generated-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData: generatedImage,
          originalImageUrl: userPhoto,
          haircutStyle: selectedHaircut,
          gender: selectedStyle?.gender || null,
          promptUsed: `Generate ${selectedHaircut} hairstyle`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save image');
      }

      console.log('Image saved successfully:', data);
      // Keep the saved state permanently after successful save
    } catch (error) {
      console.error('Error saving image:', error);
      setIsSaved(false);
      alert('Failed to save image. Please try again.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Virtual Haircut Try-On',
          text: `Check out how I look with a ${selectedStyle?.name}!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="bg-background border rounded-2xl p-12">
            {/* Three Dot Loader with proper animation */}
            <div className="flex justify-center items-center space-x-2 mb-6">
              <style jsx>{`
                @keyframes dot-flashing {
                  0% {
                    opacity: 0.2;
                  }
                  50% {
                    opacity: 1;
                  }
                  100% {
                    opacity: 0.2;
                  }
                }
                .dot-flashing {
                  animation: dot-flashing 1.4s infinite linear;
                }
              `}</style>
              <div 
                className="w-3 h-3 bg-primary rounded-full dot-flashing"
                style={{ animationDelay: '0s' }}
              />
              <div 
                className="w-3 h-3 bg-primary rounded-full dot-flashing"
                style={{ animationDelay: '0.2s' }}
              />
              <div 
                className="w-3 h-3 bg-primary rounded-full dot-flashing"
                style={{ animationDelay: '0.4s' }}
              />
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Processing your image...
            </h3>
            <p className="text-lg text-muted-foreground">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="bg-background border rounded-2xl p-12">
            <div className="h-16 w-16 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Oops! Something went wrong
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={generateHaircutImage}
                size="lg"
                className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Try Again
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                className="px-6 py-3 border border-border text-foreground hover:bg-muted transition-colors"
              >
                Choose Different Style
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Paywall UI
  if (showPaywall) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="bg-background border rounded-2xl p-12">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v1a2 2 0 002 2zM12 7a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Unlock Pro Access
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              You've used your free try! Get unlimited haircut generations with Pro Access for just $4.99 one-time.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">✨ With Pro Access you get:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Unlimited haircut generations</li>
                <li>• Access to all premium hairstyles</li>
                <li>• High-resolution downloads</li>
                <li>• Priority processing</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Link href="/pricing">
                  Get Pro Access - $4.99
                </Link>
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                size="lg"
                className="px-6 py-3 border border-border text-foreground hover:bg-muted transition-colors"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Your Virtual Makeover
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's how you look with the {selectedStyle?.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {!hasProAccess && (
            <div className="bg-muted/50 px-3 py-2 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {freeTriesUsed === 0 ? (
                  <span className="text-primary font-medium">1 free try available</span>
                ) : (
                  <span className="text-orange-500 font-medium">Free try used</span>
                )}
              </p>
            </div>
          )}
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-300"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Try Another Style
          </button>
        </div>
      </div>

      {/* Main Result */}
      <div ref={resultSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Before/After Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              {showComparison ? 'Before & After' : 'Your New Look'}
            </h3>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-primary hover:text-primary/80 font-medium text-sm hover:scale-105 transition-all duration-300"
            >
              {showComparison ? 'Hide Comparison' : 'Show Before & After'}
            </button>
          </div>
          
          <div className="relative bg-muted rounded-2xl overflow-hidden min-h-[400px] max-h-[600px]">
            {showComparison ? (
              <div className="grid grid-cols-2 h-full min-h-[400px]">
                <div className="relative">
                  <Image
                    src={userPhoto}
                    alt="Before"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    Before
                  </div>
                </div>
                <div className="relative">
                  {generatedImage ? (
                    <Image
                      src={generatedImage}
                      alt="After - with new haircut"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center h-full p-4">
                       <div className="text-center">
                         <div className="h-16 w-16 rounded-full bg-primary/30 mx-auto mb-3 flex items-center justify-center">
                           <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                         </div>
                         <p className="text-xs font-medium text-muted-foreground mb-2">
                           {selectedStyle?.name}
                         </p>

                       </div>
                     </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    After
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative h-full min-h-[400px]">
                {generatedImage ? (
                  <Image
                    src={generatedImage}
                    alt={`Your new ${selectedStyle?.name} hairstyle`}
                    fill
                    className="object-contain rounded-2xl"
                  />
                ) : (
                    <div className="bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center h-full rounded-2xl p-6">
                      <div className="text-center max-w-md">
                        <div className="h-32 w-32 rounded-full bg-primary/30 mx-auto mb-6 flex items-center justify-center">
                          <svg className="h-16 w-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <p className="text-lg font-semibold text-foreground mb-3">
                          Your New {selectedStyle?.name}
                        </p>
                        <p className="text-muted-foreground mb-3">
                          AI-Generated Preview
                        </p>
                        <div className="text-xs text-muted-foreground bg-background/60 rounded px-3 py-2">
                          ✨ AI-powered haircut preview generated
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Style Details & Actions */}
        <div className="space-y-6">
          {/* Style Info */}
          <div className="bg-background border rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Style Details
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Style Name:</span>
                <span className="font-medium">{selectedStyle?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{selectedStyle?.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Match Score:</span>
                <span className="font-medium text-green-600">92%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">
              {selectedStyle?.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {generatedImage && (
              <Button
                onClick={handleSave}
                disabled={isSaved}
                size="lg"
                className={`w-full flex items-center justify-center px-6 py-3 font-semibold transition-colors ${
                  isSaved
                    ? 'bg-green-500 text-white hover:bg-green-500'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isSaved ? (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Save This Look
                  </>
                )}
              </Button>
            )}
            
            <Button
              onClick={generateHaircutImage}
              disabled={isProcessing}
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center px-6 py-3 border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isProcessing ? 'Generating...' : 'Regenerate'}
            </Button>
            
            {generatedImage && (
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="w-full flex items-center justify-center px-6 py-3 border border-border text-foreground hover:bg-muted transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Result
              </Button>
            )}
            
            <Button
              onClick={onReset}
              variant="ghost"
              size="lg"
              className="w-full flex items-center justify-center px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Another Photo
            </Button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-muted/30 rounded-2xl p-8">
        <h4 className="text-xl font-semibold text-foreground mb-4">
          You Might Also Like
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['bob-classic', 'long-layers', 'shag-modern'].filter(id => id !== selectedHaircut).slice(0, 3).map((styleId) => {
            const style = haircutData[styleId];
            if (!style) return null;
            
            return (
              <div key={styleId} className="bg-background border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-3 flex items-center justify-center">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h5 className="font-medium text-foreground mb-1">{style.name}</h5>
                <p className="text-xs text-muted-foreground">{style.category}</p>
              </div>
            );
          })}
        </div>
      </div>
      {/* Recommendations */}
      <div className="bg-muted/30 rounded-2xl p-8">
        <h4 className="text-xl font-semibold text-foreground mb-4">
          You Might Also Like
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['bob-classic', 'long-layers', 'shag-modern'].filter(id => id !== selectedHaircut).slice(0, 3).map((styleId) => {
            const style = haircutData[styleId];
            return (
              <div key={styleId} className="bg-background border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg mb-3 flex items-center justify-center">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h5 className="font-medium text-foreground text-sm">{style?.name}</h5>
                <p className="text-xs text-muted-foreground">{style?.category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}