// Shared haircut styles data used across the application
export interface HaircutStyle {
  id: string;
  name: string;
  category: string;
  gender: 'male' | 'female';
  popularity: number;
  trend: string;
  description: string;
  isPremium?: boolean;
  image: string;
  variations?: {
    [personId: string]: string; // Maps person ID to their specific haircut image
  };
}

// Trending haircut data with gender categories
export const trendingHaircuts: {
  female: HaircutStyle[];
  male: HaircutStyle[];
} = {
  female: [
    { 
      id: 'wolf-cut',
      name: "Wolf Cut", 
      category: "Trendy", 
      gender: 'female',
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
      id: 'curtain-bangs',
      name: "Curtain Bangs", 
      category: "Medium", 
      gender: 'female',
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
      id: 'modern-shag',
      name: "Modern Shag", 
      category: "Medium", 
      gender: 'female',
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
      id: 'pixie-cut',
      name: "Pixie Cut", 
      category: "Short", 
      gender: 'female',
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
      id: 'textured-crop',
      name: "Textured Crop", 
      category: "Short", 
      gender: 'male',
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
      id: 'modern-mullet',
      name: "Modern Mullet", 
      category: "Medium", 
      gender: 'male',
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
      id: 'textured-quiff',
      name: "Textured Quiff", 
      category: "Medium", 
      gender: 'male',
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
      id: 'edgar-cut',
      name: "Edgar Cut", 
      category: "Short", 
      gender: 'male',
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
      id: 'side-part',
      name: "Side Part", 
      category: "Medium", 
      gender: 'male',
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
      id: 'quiff',
      name: "Quiff", 
      category: "Medium", 
      gender: 'male',
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
      id: 'broccoli-cut',
      name: "Broccoli Cut", 
      category: "Short", 
      gender: 'male',
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
      id: '90s-heartthrob',
      name: "90s Heartthrob", 
      category: "Medium", 
      gender: 'male',
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
      id: 'buzz-cut',
      name: "Buzz Cut", 
      category: "Short", 
      gender: 'male',
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
      id: 'man-bun',
      name: "Man Bun", 
      category: "Long", 
      gender: 'male',
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

// Function to get the correct haircut image for a specific person
export const getHaircutImageForPerson = (haircutName: string, personId: string, defaultImage?: string): string => {
  const haircut = [...trendingHaircuts.female, ...trendingHaircuts.male].find(h => h.name === haircutName);
  if (haircut?.variations?.[personId]) {
    return haircut.variations[personId];
  }
  return defaultImage || haircut?.image || '';
};

// Get all haircuts for a specific gender
export const getHaircutsByGender = (gender: 'male' | 'female'): HaircutStyle[] => {
  return trendingHaircuts[gender];
};

// Get all categories for a specific gender
export const getCategoriesByGender = (gender: 'male' | 'female'): string[] => {
  const haircuts = getHaircutsByGender(gender);
  const categories = ['All', ...new Set(haircuts.map(h => h.category))];
  return categories;
};

// Utility function to get the display name for a haircut ID
export const getHaircutDisplayName = (haircutId: string): string => {
  // Search in both male and female haircuts
  const allHaircuts = [...trendingHaircuts.male, ...trendingHaircuts.female];
  const haircut = allHaircuts.find(style => style.id === haircutId);
  return haircut ? haircut.name : haircutId; // Fallback to ID if not found
};