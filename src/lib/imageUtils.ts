/**
 * Image utility functions for compression and optimization
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp';
}

/**
 * Compresses a base64 image data URL to reduce file size
 */
export function compressImage(
  dataUrl: string,
  options: CompressImageOptions = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1024,
      maxHeight = 1024,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
      const compressedDataUrl = canvas.toDataURL(mimeType, quality);
      
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUrl;
  });
}

/**
 * Estimates the size of a base64 data URL in bytes
 */
export function getBase64Size(dataUrl: string): number {
  // Remove data URL prefix to get just the base64 data
  const base64Data = dataUrl.split(',')[1] || dataUrl;
  
  // Base64 encoding increases size by ~33%, so actual size is roughly 3/4 of base64 length
  return Math.round((base64Data.length * 3) / 4);
}

/**
 * Converts bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Progressively compresses an image until it's under the target size
 */
export async function compressToTargetSize(
  dataUrl: string,
  targetSizeBytes: number = 1024 * 1024, // 1MB default
  maxAttempts: number = 5
): Promise<string> {
  let currentDataUrl = dataUrl;
  let currentQuality = 0.9;
  let currentMaxWidth = 1024;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const size = getBase64Size(currentDataUrl);
    
    if (size <= targetSizeBytes) {
      return currentDataUrl;
    }
    
    // Reduce quality and/or dimensions for next attempt
    currentQuality = Math.max(0.3, currentQuality - 0.15);
    if (attempt > 2) {
      currentMaxWidth = Math.max(512, currentMaxWidth - 128);
    }
    
    try {
      currentDataUrl = await compressImage(currentDataUrl, {
        maxWidth: currentMaxWidth,
        maxHeight: currentMaxWidth,
        quality: currentQuality,
        format: 'jpeg'
      });
    } catch (error) {
      console.error(`Compression attempt ${attempt + 1} failed:`, error);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
    }
  }
  
  return currentDataUrl;
}