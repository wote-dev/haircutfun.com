"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ImageCarouselProps {
  images: string[];
  direction?: "up" | "down";
  speed?: number;
  className?: string;
}

export function ImageCarousel({ 
  images, 
  direction = "up", 
  speed = 30,
  className = "" 
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
          y: direction === "up" ? ["0%", "-33.33%"] : ["-33.33%", "0%"]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
        initial={{
          y: direction === "up" ? "0%" : "-33.33%"
        }}
      >
        {duplicatedImages.map((image, index) => (
          <motion.div
            key={`${image}-${index}`}
            className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={image}
              alt={`Hairstyle ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}