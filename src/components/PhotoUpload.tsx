"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface PhotoUploadProps {
  onPhotoUpload: (photoUrl: string) => void;
}

export function PhotoUpload({ onPhotoUpload }: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        <div className="bg-background border-2 border-dashed border-primary rounded-2xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Processing Your Photo
          </h3>
          <p className="text-muted-foreground">
            Please wait while we analyze your image...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">
          {cameraMode ? 'Take Your Photo' : 'Upload Your Photo'}
        </h2>
        <p className="text-lg text-muted-foreground">
          Take a clear, front-facing photo for the best results. Make sure your face is well-lit and visible.
        </p>
        
        {/* Mode Toggle Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => {
              if (cameraMode) {
                stopCamera();
              }
              openFileDialog();
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              !cameraMode
                ? 'gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105'
            }`}
          >
            📁 Upload File
          </button>
          <button
            onClick={cameraMode ? stopCamera : startCamera}
            disabled={isCameraLoading}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              cameraMode
                ? 'gradient-secondary text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:scale-105'
            } ${isCameraLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          >
            {isCameraLoading ? '📷 Loading...' : cameraMode ? '❌ Stop Camera' : '📷 Use Camera'}
          </button>
        </div>
      </div>

      {/* Camera Mode */}
      {cameraMode ? (
        <div className="relative bg-background border-2 border-solid border-primary rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-96 object-cover scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Camera Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:p-6">
            <div className="flex justify-center gap-2 md:gap-4">
              <button
                onClick={capturePhoto}
                className="bg-white text-black px-4 py-2 md:px-8 md:py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-1 md:gap-2 text-sm md:text-base"
              >
                📸 <span className="hidden sm:inline">Capture Photo</span><span className="sm:hidden">Capture</span>
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-500 text-white px-3 py-2 md:px-6 md:py-4 rounded-full font-semibold hover:bg-red-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-sm md:text-base"
              >
                ❌ <span className="hidden sm:inline">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* File Upload Mode */
        <div
          className={`relative bg-background border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-primary/2'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {isDragging ? 'Drop your photo here' : 'Drag and drop your photo'}
            </h3>
            <p className="text-muted-foreground mb-6">
              or click to browse from your device
            </p>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              📁 Choose Photo
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-muted/50 rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-3 flex items-center">
          <svg className="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tips for Best Results
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            Use a front-facing photo with your face clearly visible
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            Ensure good lighting - natural light works best
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            Keep your hair pulled back to see your face shape clearly
          </li>
          <li className="flex items-start">
            <span className="text-primary mr-2">•</span>
            Avoid heavy makeup or accessories that might obscure your features
          </li>
        </ul>
      </div>
    </div>
  );
}