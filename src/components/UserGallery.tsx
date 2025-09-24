'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import Image from 'next/image';

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
      setLoading(true);
      const response = await fetch('/api/user-images');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error fetching user images:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Your Generated Images</h3>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Your Generated Images</h3>
        <p className="text-xs text-gray-500">No images generated yet</p>
        <p className="text-xs text-gray-400 mt-1">Start creating to see your gallery!</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Your Generated Images</h3>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
          {images.map((image) => (
            <div
              key={image.id}
              className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setSelectedImage(image)}
            >
              <Image
                src={image.image_url}
                alt={image.haircut_style}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors" />
            </div>
          ))}
        </div>
        {images.length > 4 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Showing recent images
          </p>
        )}
      </div>

      {/* Modal for larger preview */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-2xl max-h-[80vh] bg-white rounded-lg overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.haircut_style}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 90vw, 50vw"
              />
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900">{selectedImage.haircut_style}</h4>
              <p className="text-sm text-gray-500">
                {new Date(selectedImage.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}