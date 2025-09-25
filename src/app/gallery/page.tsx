"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ModernGallery from "@/components/ModernGallery";

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

const allHaircuts: {
  female: HaircutStyle[];
  male: HaircutStyle[];
} = {
  female: [
    { 
      name: "Modern Shag", 
      category: "Medium", 
      popularity: 91, 
      trend: "💫", 
      description: "Updated 70s classic", 
      image: "/FILLER-IMAGES-WOMEN/modernshag.png",
      variations: {
        'example-1': '/modern-shag.jpg',
        'example-2': '/FILLER-IMAGES-WOMEN/modernshag.png',
        'example-3': '/modern-shag2.jpg'
      }
    },
    { 
      name: "Pixie Cut", 
      category: "Short", 
      popularity: 95, 
      trend: "🔥", 
      description: "Chic and bold", 
      image: "/FILLER-IMAGES-WOMEN/pixiecut.png",
      variations: {
        'example-1': '/pixie-cut.jpg',
        'example-2': '/FILLER-IMAGES-WOMEN/pixiecut.png',
        'example-3': '/pixie-cut2.jpg'
      }
    },
    { 
      name: "Curtain Bangs", 
      category: "Medium", 
      popularity: 94, 
      trend: "✨", 
      description: "Face-framing bangs", 
      image: "/FILLER-IMAGES-WOMEN/curtainbangs.png",
      variations: {
        'example-1': '/curtain-bangs.jpg',
        'example-2': '/FILLER-IMAGES-WOMEN/curtainbangs.png',
        'example-3': '/curtain-bangs2.jpg'
      }
    },
    { 
      name: "Blunt Bob", 
      category: "Short", 
      popularity: 88, 
      trend: "🔥", 
      description: "Sharp and sophisticated", 
      image: "/FILLER-IMAGES-WOMEN/bluntbob.png",
      variations: {
        'example-1': '/FILLER-IMAGES-WOMEN/bluntbob.png',
        'example-2': '/FILLER-IMAGES-WOMEN/bluntbob.png',
        'example-3': '/wolf-cut2.jpg'
      }
    },
    { 
      name: "Classic Bob", 
      category: "Short", 
      popularity: 86, 
      trend: "✨", 
      description: "Timeless and elegant", 
      image: "/FILLER-IMAGES-WOMEN/classicbob.png",
      variations: {
        'example-1': '/FILLER-IMAGES-WOMEN/classicbob.png',
        'example-2': '/FILLER-IMAGES-WOMEN/classicbob.png',
        'example-3': '/curtain-bangs2.jpg'
      }
    },
    { 
      name: "Wolf Cut", 
      category: "Trendy", 
      popularity: 96, 
      trend: "🔥", 
      description: "Edgy mullet-shag hybrid", 
      image: "/wolf-cut.png",
      variations: {
        'example-1': '/wolf-cut.jpg',
        'example-2': '/wolf-cut.png',
        'example-3': '/wolf-cut2.jpg'
      }
    },
    { 
      name: "Long Layers", 
      category: "Long", 
      popularity: 92, 
      trend: "✨", 
      description: "Flowing cuts with movement", 
      image: "/modern-shag.png",
      variations: {
        'example-1': '/modern-shag.jpg',
        'example-2': '/modern-shag.png',
        'example-3': '/modern-shag2.jpg'
      }
    },
    { 
      name: "Beach Waves", 
      category: "Long", 
      popularity: 89, 
      trend: "💫", 
      description: "Effortless wavy texture", 
      image: "/curtain-bangs.png",
      variations: {
        'example-1': '/curtain-bangs.jpg',
        'example-2': '/curtain-bangs.png',
        'example-3': '/curtain-bangs2.jpg'
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
      name: "Modern Mullet", 
      category: "Medium", 
      popularity: 93, 
      trend: "🔥", 
      description: "Contemporary mullet revival", 
      isPremium: true, 
      image: "/modern-mullet1.png",
      variations: {
        'example-1': '/modern-mullet1.png',
        'example-4': '/modern-mullet2.png'
      }
    },
    { 
      name: "Textured Quiff", 
      category: "Medium", 
      popularity: 91, 
      trend: "✨", 
      description: "Bold volume with texture", 
      image: "/quiff.png",
      variations: {
        'example-1': '/quiff.png',
        'example-4': '/quiff2.jpg'
      }
    },
    { 
      name: "Edgar Cut", 
      category: "Short", 
      popularity: 88, 
      trend: "💫", 
      description: "Sharp edges with straight fringe", 
      image: "/edgar-cut2.png",
      variations: {
        'example-1': '/edgar-cut2.png',
        'example-4': '/edgar-cut.png'
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
      name: "Broccoli Cut", 
      category: "Short", 
      popularity: 86, 
      trend: "🔥", 
      description: "Layered curls with tapered sides", 
      image: "/broccoli1.png",
      variations: {
        'example-1': '/broccoli1.png',
        'example-4': '/broccoli2.png'
      }
    },
    { 
      name: "90s Heartthrob", 
      category: "Medium", 
      popularity: 89, 
      trend: "✨", 
      description: "Old money aesthetic", 
      isPremium: true, 
      image: "/90s1.png",
      variations: {
        'example-1': '/90s1.png',
        'example-4': '/90s2.png'
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
    },
    { 
      name: "Man Bun", 
      category: "Long", 
      popularity: 76, 
      trend: "💫", 
      description: "Long hair styled into a trendy top knot", 
      isPremium: true, 
      image: "/manbun2.png",
      variations: {
        'example-1': '/manbun2.png',         // Daniel
        'example-4': '/manbun1.png'          // Mike
      }
    }
  ]
};

export default function GalleryPage() {
  const [selectedGender, setSelectedGender] = useState<'female' | 'male'>('female');
  const currentStyles = allHaircuts[selectedGender];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-24 pb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full px-6 py-3 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Complete Gallery</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-5xl">
            Hairstyle Gallery
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Explore all available hairstyles and see how they'll look on you with our AI-powered virtual try-on
          </p>
          
          {/* Gender Selection Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center bg-muted/50 rounded-full p-1 mb-6"
          >
            <button
              onClick={() => setSelectedGender('female')}
              className={`px-6 py-3 rounded-full font-semibold text-sm transition-colors ${
                selectedGender === 'female'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Women's Styles
            </button>
            <button
              onClick={() => setSelectedGender('male')}
              className={`px-6 py-3 rounded-full font-semibold text-sm transition-colors ${
                selectedGender === 'male'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Men's Styles
            </button>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-8 bg-gradient-to-br from-muted/30 via-background to-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div 
            key={selectedGender}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ModernGallery 
              styles={currentStyles} 
              selectedGender={selectedGender}
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-muted/30 via-background to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Try Your Perfect Style?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your photo and see how any of these hairstyles will look on you with our AI-powered virtual try-on technology.
          </p>
          <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold">
            <Link href="/try-on" className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5" />
              <span>Start Virtual Try-On</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}