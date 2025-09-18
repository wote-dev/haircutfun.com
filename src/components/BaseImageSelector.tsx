"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface BaseImage {
  id: string;
  src: string;
  alt: string;
  name: string;
  description: string;
}

const baseImages: BaseImage[] = [
  {
    id: 'example-1',
    src: '/base-image-me.jpeg',
    alt: 'Example Person 1',
    name: 'Daniel',
    description: 'Professional headshot with good lighting'
  },
  {
    id: 'example-2',
    src: '/base-image-me.jpeg', // Placeholder for now
    alt: 'Example Person 2', 
    name: 'Coming Soon',
    description: 'Another example will be added soon'
  },
  {
    id: 'example-3',
    src: '/base-image-me.jpeg', // Placeholder for now
    alt: 'Example Person 3',
    name: 'Coming Soon',
    description: 'More examples coming soon'
  }
];

export function BaseImageSelector() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (imageId: string, imageSrc: string) => {
    setSelectedImage(imageId);
    // Store the selected base image in localStorage for the try-on page
    localStorage.setItem('selectedBaseImage', imageSrc);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Base Image
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a base image to see how different haircuts will look. 
            Compare results across different face shapes and styles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {baseImages.map((image, index) => {
            const isAvailable = index === 0; // Only first image is available for now
            const isSelected = selectedImage === image.id;
            
            return (
              <div
                key={image.id}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  isAvailable ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => isAvailable && handleImageSelect(image.id, image.src)}
              >
                <div className={`relative bg-background border-2 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary shadow-primary/20 shadow-xl' 
                    : isAvailable 
                      ? 'border-border hover:border-primary/50 hover:shadow-xl' 
                      : 'border-border'
                }`}>
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    
                    {/* Overlay for unavailable images */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-medium bg-black/60 px-4 py-2 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    )}
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Hover overlay for available images */}
                    {isAvailable && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {image.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {image.description}
                    </p>
                    
                    {isSelected && (
                      <div className="mt-3 flex items-center text-primary text-sm font-medium">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center">
          <Link
            href="/try-on"
            className={`inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
              selectedImage
                ? 'gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {selectedImage ? (
              <>
                Try Haircuts Now
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            ) : (
              'Select a base image to continue'
            )}
          </Link>
          
          {selectedImage && (
            <p className="text-sm text-muted-foreground mt-3">
              Your selected base image will be used for trying on haircuts
            </p>
          )}
        </div>
      </div>
    </section>
  );
}