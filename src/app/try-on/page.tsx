"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhotoUpload } from "@/components/PhotoUpload";
import { GenderSelection } from "@/components/GenderSelection";
import { HaircutGallery } from "@/components/HaircutGallery";
import { VirtualTryOn } from "@/components/VirtualTryOn";

type Step = 'upload' | 'gender' | 'select' | 'preview';

function TryOnPageContent() {
  const searchParams = useSearchParams();
  const preselectedHaircut = searchParams.get('haircut');

  // Trending haircuts data to determine gender
  const trendingHaircuts = {
    female: ["Wolf Cut", "Curtain Bangs", "Modern Shag", "Pixie Cut"],
    male: ["Textured Crop", "Side Part", "Quiff", "Buzz Cut"]
  };

  // Determine gender from preselected haircut
  const getGenderFromHaircut = (haircutName: string | null): 'male' | 'female' | null => {
    if (!haircutName) return null;
    
    if (trendingHaircuts.female.includes(haircutName)) {
      return 'female';
    } else if (trendingHaircuts.male.includes(haircutName)) {
      return 'male';
    }
    return null;
  };

  const preselectedGender = getGenderFromHaircut(preselectedHaircut);

  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(preselectedGender);
  const [selectedHaircut, setSelectedHaircut] = useState<string | null>(preselectedHaircut);

  const handlePhotoUpload = (photoUrl: string) => {
    setUploadedPhoto(photoUrl);
    if (preselectedHaircut && preselectedGender) {
      // Skip gender selection if we have a preselected haircut with known gender
      setCurrentStep('preview');
    } else {
      setCurrentStep('gender');
    }
  };

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    if (preselectedHaircut) {
      setCurrentStep('preview');
    } else {
      setCurrentStep('select');
    }
  };

  const handleHaircutSelect = (haircutId: string) => {
    setSelectedHaircut(haircutId);
    setCurrentStep('preview');
  };

  const resetProcess = () => {
    setCurrentStep('upload');
    setUploadedPhoto(null);
    setSelectedGender(preselectedGender);
    setSelectedHaircut(preselectedHaircut);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24">

      {/* Hero Section with Progress */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Virtual Haircut Try-On
          </h1>
          <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto mb-8">
            Transform your look in just four simple steps. Upload your photo, select your gender, choose a style, and see the magic happen.
          </p>
          
          {/* Progress Steps */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
            {['upload', 'gender', 'select', 'preview'].map((step, index) => {
              const stepNumber = index + 1;
              const isActive = currentStep === step;
              const isCompleted = 
                (step === 'upload' && uploadedPhoto) ||
                (step === 'gender' && selectedGender) ||
                (step === 'select' && selectedHaircut) ||
                (step === 'preview' && currentStep === 'preview');
              
              return (
                <div key={step} className="flex flex-col sm:flex-row items-center">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div
                        className={`flex h-16 w-16 lg:h-20 lg:w-20 items-center justify-center rounded-full text-lg lg:text-xl font-bold transition-all duration-500 shadow-2xl ${
                          isActive
                            ? 'bg-gradient-to-r from-primary to-accent text-white shadow-primary/40 scale-110'
                            : isCompleted
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-green-500/40'
                            : 'bg-white/90 text-muted-foreground border-2 border-gray-200 shadow-gray-200/50'
                        }`}
                      >
                        {isCompleted && step !== currentStep ? (
                          <svg className="h-8 w-8 lg:h-10 lg:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          stepNumber
                        )}
                      </div>
                      {isActive && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-40 animate-pulse" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className={`block text-sm lg:text-base font-bold mb-1 ${
                        isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        Step {stepNumber}
                      </span>
                      <span className={`block text-base lg:text-lg font-semibold ${
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {step === 'upload' && 'Upload Photo'}
                        {step === 'gender' && 'Choose Gender'}
                        {step === 'select' && 'Choose Style'}
                        {step === 'preview' && 'Preview Result'}
                      </span>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="hidden sm:flex items-center mx-6 lg:mx-8">
                      <div className={`h-1 w-16 lg:w-24 rounded-full transition-all duration-700 ${
                        isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Step Content */}
        {currentStep === 'upload' && (
          <PhotoUpload onPhotoUpload={handlePhotoUpload} />
        )}
        
        {currentStep === 'gender' && uploadedPhoto && (
          <GenderSelection 
            onGenderSelect={handleGenderSelect}
            onBack={() => setCurrentStep('upload')}
          />
        )}
        
        {currentStep === 'select' && uploadedPhoto && selectedGender && (
          <HaircutGallery 
            userPhoto={uploadedPhoto}
            selectedGender={selectedGender}
            onHaircutSelect={handleHaircutSelect}
            onBack={() => setCurrentStep('gender')}
          />
        )}
        
        {currentStep === 'preview' && uploadedPhoto && selectedHaircut && (
          <VirtualTryOn
            userPhoto={uploadedPhoto}
            selectedHaircut={selectedHaircut}
            onReset={resetProcess}
            onBack={() => setCurrentStep('select')}
          />
        )}
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense>
      <TryOnPageContent />
    </Suspense>
  );
}