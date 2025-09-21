"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  direction?: "up" | "down";
  speed?: number;
  className?: string;
  priorityCount?: number; // Number of images to load with priority
}

export function ImageCarousel({ 
  images, 
  direction = "up", 
  speed = 30,
  className = "",
  priorityCount = 6 // Load first 6 images with priority for better perceived performance
}: ImageCarouselProps) {
  const [duplicatedImages, setDuplicatedImages] = useState<string[]>([]);

  useEffect(() => {
    // Duplicate images to create seamless loop
    setDuplicatedImages([...images, ...images, ...images]);
  }, [images]);

  return (
    <div className={`relative overflow-hidden h-full ${className}`}>
      <motion.div
        className="flex flex-col gap-6"
        animate={{
          transform: direction === "up" ? ["translateY(0%)", "translateY(-33.33%)"] : ["translateY(-33.33%)", "translateY(0%)"]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
        initial={{
          transform: direction === "up" ? "translateY(0%)" : "translateY(-33.33%)"
        }}
        style={{ willChange: 'transform' }}
      >
        {duplicatedImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src={image}
              alt={`Hairstyle ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 20vw, 15vw"
              quality={85}
              priority={index < priorityCount}
              loading={index < priorityCount ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}