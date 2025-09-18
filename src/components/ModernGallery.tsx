"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated, config } from '@react-spring/web';
import { useInView } from 'react-intersection-observer';
import { 
  Sparkles, 
  Star, 
  TrendingUp, 
  Crown, 
  Filter,
  Grid3X3,
  LayoutGrid,
  Search,
  Heart,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HaircutStyle {
  name: string;
  category: string;
  popularity: number;
  trend: string;
  description: string;
  isPremium?: boolean;
  image?: string;
  variations?: {
    [personId: string]: string;
  };
}

interface ModernGalleryProps {
  styles: HaircutStyle[];
  selectedGender: 'female' | 'male';
}

const categoryColors = {
  'Short': 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  'Medium': 'from-green-500/20 to-green-600/20 border-green-500/30',
  'Long': 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  'Trendy': 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
};

const trendEmojis = {
  '🔥': { label: 'Hot', color: 'text-red-500' },
  '✨': { label: 'Popular', color: 'text-yellow-500' },
  '💫': { label: 'Trending', color: 'text-blue-500' },
};

const ModernGallery: React.FC<ModernGalleryProps> = ({ styles, selectedGender }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(styles.map(style => style.category)))];

  const filteredStyles = styles.filter(style => {
    const matchesCategory = selectedCategory === 'All' || style.category === selectedCategory;
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         style.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedStyles = filteredStyles.sort((a, b) => b.popularity - a.popularity);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search hairstyles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-xl p-1 border border-border/50">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm rounded-xl p-1 border border-border/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('masonry')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'masonry'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {sortedStyles.length} {sortedStyles.length === 1 ? 'style' : 'styles'}
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Gallery Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${viewMode}-${searchTerm}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'
          }
        >
          {sortedStyles.map((style, index) => (
            <HaircutCard
              key={style.name}
              style={style}
              index={index}
              selectedGender={selectedGender}
              isHovered={hoveredCard === style.name}
              onHover={setHoveredCard}
              viewMode={viewMode}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {sortedStyles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No styles found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            variant="outline"
          >
            Clear filters
          </Button>
        </motion.div>
      )}
    </div>
  );
};

interface HaircutCardProps {
  style: HaircutStyle;
  index: number;
  selectedGender: 'female' | 'male';
  isHovered: boolean;
  onHover: (name: string | null) => void;
  viewMode: 'grid' | 'masonry';
}

const HaircutCard: React.FC<HaircutCardProps> = ({
  style,
  index,
  selectedGender,
  isHovered,
  onHover,
  viewMode
}) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Initialize likes on client side to avoid hydration mismatch
  useEffect(() => {
    setLikes(Math.floor(Math.random() * 500) + 100);
  }, []);

  const springProps = useSpring({
    transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1) translateY(0px)',
    boxShadow: isHovered
      ? '0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)'
      : '0 4px 20px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.05)',
    config: config.wobbly,
  });

  const imageSpring = useSpring({
    opacity: imageLoaded ? 1 : 0,
    transform: imageLoaded ? 'scale(1)' : 'scale(1.1)',
    config: config.gentle,
  });

  const categoryColor = categoryColors[style.category as keyof typeof categoryColors] || 
                       'from-gray-500/20 to-gray-600/20 border-gray-500/30';

  const trendInfo = trendEmojis[style.trend as keyof typeof trendEmojis] || 
                   { label: 'Popular', color: 'text-gray-500' };

  const handleTryOn = () => {
    localStorage.setItem('selectedHaircut', style.name);
    window.location.href = `/try-on?haircut=${encodeURIComponent(style.name)}`;
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={viewMode === 'masonry' ? 'break-inside-avoid mb-6' : ''}
    >
      <animated.div
        style={springProps}
        onMouseEnter={() => onHover(style.name)}
        onMouseLeave={() => onHover(null)}
        className="group relative bg-background/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-border/50 cursor-pointer"
        onClick={handleTryOn}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <animated.div style={imageSpring} className="relative w-full h-full">
            <Image
              src={style.image || '/placeholder-haircut.jpg'}
              alt={style.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              onLoad={() => setImageLoaded(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </animated.div>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Premium Badge */}
          {style.isPremium && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </div>
          )}

          {/* Trend Badge */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span className={trendInfo.color}>{style.trend}</span>
            <span className="text-foreground">{trendInfo.label}</span>
          </div>

          {/* Action Buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={toggleLike}
              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                isLiked
                  ? 'bg-red-500 text-white'
                  : 'bg-background/80 text-foreground hover:bg-background'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-2 bg-background/80 backdrop-blur-sm rounded-full text-foreground hover:bg-background transition-all">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {style.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {style.description}
              </p>
            </div>
          </div>

          {/* Category and Stats */}
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColor} border`}>
              {style.category}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {style.popularity}%
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {likes}
              </div>
            </div>
          </div>

          {/* Try On Button */}
          <Button
            onClick={handleTryOn}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-all duration-300 group-hover:shadow-lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Try This Style
          </Button>
        </div>
      </animated.div>
    </motion.div>
  );
};

export default ModernGallery;