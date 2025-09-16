'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { createClient } from '../../lib/supabase/client';

interface GeneratedImage {
  id: string;
  image_url: string;
  haircut_style: string;
  created_at: string;
  original_image_url?: string;
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching user images:', error);
        return;
      }

      setImages(data || []);
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

  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">No images yet</h3>
        <p className="text-xs text-gray-500">Start creating hairstyles to see them here!</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Your Gallery</h3>
          <span className="text-xs text-gray-500">{images.length} images</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200 group"
            >
              <img
                src={image.image_url}
                alt={`${image.haircut_style} hairstyle`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </button>
          ))}
        </div>
        
        {images.length >= 12 && (
          <button className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium">
            View all images →
          </button>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900">{selectedImage.haircut_style}</h3>
                <p className="text-sm text-gray-500">{formatDate(selectedImage.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedImage.original_image_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Original</h4>
                    <img
                      src={selectedImage.original_image_url}
                      alt="Original"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Generated</h4>
                  <img
                    src={selectedImage.image_url}
                    alt="Generated hairstyle"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}