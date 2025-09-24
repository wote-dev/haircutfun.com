'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Calendar, X } from 'lucide-react';

interface GeneratedImage {
  id: string;
  image_url: string;
  original_image_url: string | null;
  haircut_style: string;
  gender: string | null;
  created_at: string;
}

export function UserGallery() {
  const { user } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserImages();
    }
  }, [user]);

  const fetchUserImages = async () => {
    try {
      const response = await fetch('/api/user-images');
      if (response.ok) {
        const data = await response.json();
        // Cap at 10 images maximum
        setImages((data.images || data).slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching user images:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Your Generated Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Your Generated Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No images yet</h3>
            <p className="text-muted-foreground">
              Start creating hairstyles to see them in your gallery!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Your Generated Images
            </div>
            <Badge variant="secondary" className="text-xs">
              {images.length} / 10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-muted hover:ring-2 hover:ring-primary transition-all duration-200"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.image_url}
                  alt={`${image.haircut_style} hairstyle`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-xs font-medium truncate">
                    {image.haircut_style}
                  </p>
                </div>
                {index === 0 && (
                  <Badge className="absolute top-2 left-2 text-xs">Latest</Badge>
                )}
              </div>
            ))}
          </div>
          {images.length === 10 && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Gallery is full (10/10). New images will replace the oldest ones.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Modal for larger preview */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-background rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {selectedImage.haircut_style}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedImage.created_at)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Image Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedImage.original_image_url && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Original Photo</h4>
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={selectedImage.original_image_url}
                        alt="Original photo"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Generated Result</h4>
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={selectedImage.image_url}
                      alt={`${selectedImage.haircut_style} result`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}