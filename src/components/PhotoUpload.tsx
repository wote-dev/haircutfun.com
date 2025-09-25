"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, X, Info, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PhotoUploadProps {
  onPhotoUpload: (photoUrl: string) => void;
}

export function PhotoUpload({ onPhotoUpload }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Clear error when switching modes
  useEffect(() => {
    setError(null);
  }, [cameraMode]);

  const showError = (message: string) => {
    setError(message);
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleFileSelect = (file: File) => {
    if (!file) {
      showError('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please select a valid image file (JPG, PNG, GIF, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showError('File size must be less than 10MB.');
      return;
    }

    setError(null);
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
        showError('Failed to read the selected file. Please try again.');
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      showError('Error reading the file. Please try again.');
      setIsProcessing(false);
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
    // Only set dragging to false if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
    // Reset the input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle keyboard navigation for file upload
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  // Helper function to detect mobile devices
  const isMobileDevice = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    // Check for mobile user agents
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone', 'mobile'];
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    
    // Check for touch capability and screen size
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    return isMobileUA || (isTouchDevice && isSmallScreen);
  }, []);

  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setError(null);
    try {
      const isMobile = isMobileDevice();
      
      // Use simpler constraints for mobile devices
      const constraints = isMobile 
        ? {
            video: {
              facingMode: 'user' // Just use front camera, let the device handle the rest
            }
          }
        : {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            }
          };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Wait for video metadata to load before playing
        const handleLoadedMetadata = () => {
          video.play().catch(playError => {
            console.error('Error playing video:', playError);
            showError('Error starting video preview. Please try again.');
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
      
      // Try with even simpler constraints as fallback
      if (!(error instanceof Error) || !error.message.includes('fallback')) {
        try {
          console.log('Trying fallback camera constraints...');
          const fallbackStream = await navigator.mediaDevices.getUserMedia({
            video: true // Most basic constraint possible
          });
          setStream(fallbackStream);
          if (videoRef.current) {
            const video = videoRef.current;
            video.srcObject = fallbackStream;
            
            const handleLoadedMetadata = () => {
              video.play().catch(playError => {
                console.error('Error playing video:', playError);
                showError('Error starting video preview. Please try again.');
              });
            };
            
            if (video.readyState >= 1) {
              handleLoadedMetadata();
            } else {
              video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
            }
          }
          setCameraMode(true);
        } catch (fallbackError) {
          console.error('Fallback camera access failed:', fallbackError);
          showError('Unable to access camera. Please check your permissions and try again.');
        }
      } else {
        showError('Unable to access camera. Please check your permissions and try again.');
      }
    } finally {
      setIsCameraLoading(false);
    }
  }, [isMobileDevice]);

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
        
        // Mirror the image horizontally to match the preview
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0);
        context.restore();
        
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
          showError('Error starting video preview. Please try again.');
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

  // Processing state UI with enhanced loading feedback
  if (isProcessing) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Loading Spinner */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Processing Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Processing Your Photo
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This may take a few seconds...
                </p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3 w-3 text-green-500" />
                <span>Photo uploaded</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary">
                <div className="w-3 h-3 border-2 border-primary rounded-full animate-spin border-t-transparent"></div>
                <span>Analyzing image...</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-3 h-3 border-2 border-muted rounded-full"></div>
                <span>Preparing preview</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
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
        
        {/* Error Display */}
        {error && (
          <div 
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-4" role="tablist" aria-label="Photo upload methods">
          <Button
            variant={!cameraMode ? "default" : "outline"}
            onClick={() => {
              if (cameraMode) stopCamera();
            }}
            className="gap-2"
            role="tab"
            aria-selected={!cameraMode}
            aria-controls="upload-panel"
            tabIndex={0}
          >
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
          <Button
            variant={cameraMode ? "default" : "outline"}
            onClick={startCamera}
            disabled={isCameraLoading}
            className="gap-2"
            role="tab"
            aria-selected={cameraMode}
            aria-controls="camera-panel"
            tabIndex={0}
          >
            <Camera className="h-4 w-4" />
            {isCameraLoading ? 'Starting Camera...' : 'Use Camera'}
          </Button>
        </div>
      </div>

      {/* Camera Mode */}
      {cameraMode && (
        <div 
          id="camera-panel"
          role="tabpanel"
          aria-labelledby="camera-tab"
          className="space-y-6"
        >
          <Card className="overflow-hidden border-2 border-gray-200 shadow-xl">
            <CardContent className="p-0">
              <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
                {/* Camera Preview */}
                <div className="relative aspect-[4/3] md:aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover transform scale-x-[-1]"
                    playsInline
                    muted
                    aria-label="Camera preview for photo capture"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Camera Frame Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner guides */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/60 rounded-tl-lg"></div>
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/60 rounded-tr-lg"></div>
                    <div className="absolute bottom-32 left-4 w-8 h-8 border-l-2 border-b-2 border-white/60 rounded-bl-lg"></div>
                    <div className="absolute bottom-32 right-4 w-8 h-8 border-r-2 border-b-2 border-white/60 rounded-br-lg"></div>
                    
                    {/* Center focus guide */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-32 h-32 border-2 border-white/40 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Modern Camera Controls Bar - Moved Lower */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-6 px-6">
                  {/* Camera controls hint - Moved to top */}
                  <div className="mb-6 text-center">
                    <p className="text-white/60 text-sm">
                      Position your face in the center circle and tap the capture button
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {/* Left side - Camera info */}
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white/80 text-sm font-medium">REC</span>
                    </div>
                    
                    {/* Center - Main capture button - Smaller size for optimal UX */}
                    <div className="flex items-center gap-6">
                      <Button
                        onClick={capturePhoto}
                        className="relative w-12 h-12 rounded-full bg-white hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-xl border border-white/40 p-0 group"
                        aria-label="Capture photo"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                          <div className="w-6 h-6 bg-gray-900 rounded-full transition-all duration-200 group-hover:bg-gray-800"></div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-gray-200/20 to-transparent"></div>
                      </Button>
                    </div>
                    
                    {/* Right side - Close button */}
                    <Button
                      onClick={stopCamera}
                      variant="ghost"
                      size="lg"
                      className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-12 h-12 p-0 transition-all duration-200"
                      aria-label="Stop camera and return to upload"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced Camera Tips */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-3 text-lg">Perfect Photo Tips</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Center your face in the circle</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Ensure bright, even lighting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Look directly at the camera</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Remove hats or hair accessories</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File Upload Mode */}
      {!cameraMode && (
        <div 
          id="upload-panel"
          role="tabpanel"
          aria-labelledby="upload-tab"
          className="space-y-6"
        >
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Select image file to upload"
          />
          
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
            onKeyDown={handleKeyDown}
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              ${isDragging 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-border hover:border-primary/50 hover:bg-muted/30'
              }
            `}
            role="button"
            tabIndex={0}
            aria-label="Click to select a file or drag and drop an image here"
            aria-describedby="upload-instructions"
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-colors
                ${isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
              `}>
                <Upload className="h-8 w-8" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragging ? 'Drop your photo here' : 'Choose or drag your photo'}
                </h3>
                <p id="upload-instructions" className="text-muted-foreground mb-4">
                  Drag and drop an image file here, or click to browse
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="secondary">JPG</Badge>
                  <Badge variant="secondary">PNG</Badge>
                  <Badge variant="secondary">GIF</Badge>
                  <Badge variant="secondary">WebP</Badge>
                  <Badge variant="outline">Max 10MB</Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Upload Instructions */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Photo Guidelines</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Use a clear, high-resolution photo</li>
                    <li>• Face should be clearly visible and well-lit</li>
                    <li>• Avoid heavy shadows or backlighting</li>
                    <li>• Remove sunglasses or face coverings</li>
                    <li>• Front-facing photos work best</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}