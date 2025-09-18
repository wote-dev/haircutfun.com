"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PhotoUploadProps {
  onPhotoUpload: (photoUrl: string) => void;
}

// Base images for users to try the tool
const baseImages = [
  {
    id: 'example-1',
    src: '/base-image-me.jpeg',
    alt: 'Example Person 1',
    description: 'Try with Daniel'
  },
  {
    id: 'example-2',
    src: '/base-image-woman.png',
    alt: 'Example Person 2',
    description: 'Try with Sarah'
  },
  {
    id: 'example-3',
    src: '/base-image-woman2.jpg',
    alt: 'Example Person 3',
    description: 'Try with Emma'
  },
  {
    id: 'example-4',
    src: '/base-image-guy 2.jpg',
    alt: 'Example Person 4',
    description: 'Try with Mike'
  }
];

export function PhotoUpload({ onPhotoUpload }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for pre-selected base image on component mount
  useEffect(() => {
    const selectedBaseImage = localStorage.getItem('selectedBaseImage');
    if (selectedBaseImage) {
      // Auto-use the pre-selected base image
      handleBaseImageSelect(selectedBaseImage);
      // Clear the selection so it doesn't auto-load next time
      localStorage.removeItem('selectedBaseImage');
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file) {
      console.error('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB.');
      return;
    }

    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Simulate processing time
        setTimeout(() => {
          onPhotoUpload(result);
          setIsProcessing(false);
        }, 1000);
      } else {
        console.error('Failed to read file');
        setIsProcessing(false);
        alert('Failed to read the selected file. Please try again.');
      }
    };
    reader.onerror = () => {
      console.error('Error reading file');
      setIsProcessing(false);
      alert('Error reading the file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered');
    const files = e.target.files;
    console.log('Selected files:', files);
    if (files && files.length > 0) {
      console.log('Processing file:', files[0].name);
      handleFileSelect(files[0]);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleBaseImageSelect = (imageSrc: string) => {
    setIsProcessing(true);
    // Simulate processing time for consistency with file upload
    setTimeout(() => {
      onPhotoUpload(imageSrc);
      setIsProcessing(false);
    }, 1000);
  };

  const openFileDialog = () => {
    console.log('File dialog button clicked');
    console.log('File input ref:', fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('File input clicked');
    } else {
      console.error('File input ref is null');
    }
  };

  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Wait for video metadata to load before playing
        const handleLoadedMetadata = () => {
          video.play().catch(playError => {
            console.error('Error playing video:', playError);
          });
        };
        
        if (video.readyState >= 1) {
          // Metadata already loaded
          handleLoadedMetadata();
        } else {
          // Wait for metadata to load
          video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
        }
      }
      setCameraMode(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check your permissions and try again.');
    } finally {
      setIsCameraLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const result = e.target?.result as string;
              if (result) {
                setIsProcessing(true);
                setTimeout(() => {
                  onPhotoUpload(result);
                  setIsProcessing(false);
                  stopCamera();
                }, 1000);
              }
            };
            reader.readAsDataURL(blob);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  }, [onPhotoUpload, stopCamera]);

  // Handle video stream changes
  useEffect(() => {
    if (stream && videoRef.current && cameraMode) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      const handleLoadedMetadata = () => {
        video.play().catch(playError => {
          console.error('Error playing video:', playError);
        });
      };
      
      if (video.readyState >= 1) {
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      }
    }
  }, [stream, cameraMode]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-dashed border-2 border-primary">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <CardTitle className="text-lg mb-2">Processing Your Photo</CardTitle>
            <CardDescription>Please wait while we analyze your image...</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
          {cameraMode ? 'Take Your Photo' : 'Upload Your Photo'}
        </h2>
        <p className="text-lg text-muted-foreground mb-6">
          Take a clear, front-facing photo for the best results. Make sure your face is well-lit and visible.
        </p>
        
        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => {
              if (cameraMode) {
                stopCamera();
              }
              openFileDialog();
            }}
            variant={!cameraMode ? "default" : "outline"}
            size="lg"
            className="h-12"
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
          <Button
            onClick={cameraMode ? stopCamera : startCamera}
            disabled={isCameraLoading}
            variant={cameraMode ? "default" : "outline"}
            size="lg"
            className="h-12"
          >
            <Camera className="h-4 w-4" />
            {isCameraLoading ? 'Loading...' : cameraMode ? 'Stop Camera' : 'Use Camera'}
          </Button>
        </div>
      </div>

      {/* Base Image Options */}
      {!cameraMode && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">
              Or Try With Example Images
            </h3>
            <p className="text-muted-foreground">
              See how our tool works with these example photos
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {baseImages.map((image) => (
              <Card
                key={image.id}
                className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-primary"
                onClick={() => handleBaseImageSelect(image.src)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-medium">{image.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Camera Mode */}
      {cameraMode ? (
        <Card className="overflow-hidden border-2 border-primary">
          <CardContent className="p-0">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover scale-x-[-1]"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="bg-white text-black hover:bg-gray-100 h-12"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Capture Photo</span>
                    <span className="sm:hidden">Capture</span>
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="destructive"
                    size="lg"
                    className="h-12"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* File Upload Mode */
        <Card
          className={`cursor-pointer transition-all duration-300 border-2 border-dashed ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-primary/2'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-6 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <CardTitle className="text-xl mb-2">
                  {isDragging ? 'Drop your photo here' : 'Drag and drop your photo'}
                </CardTitle>
                <CardDescription className="mb-6">
                  or click to browse from your device
                </CardDescription>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFileDialog();
                  }}
                  size="lg"
                  className="h-12"
                >
                  <Upload className="h-4 w-4" />
                  Choose Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Use a front-facing photo with your face clearly visible
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Ensure good lighting - natural light works best
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Keep your hair pulled back to see your face shape clearly
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Avoid heavy makeup or accessories that might obscure your features
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}