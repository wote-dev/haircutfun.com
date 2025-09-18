"use client";

import { useState } from "react";

interface GenderSelectionProps {
  onGenderSelect: (gender: 'male' | 'female') => void;
  onBack: () => void;
}

export function GenderSelection({ onGenderSelect, onBack }: GenderSelectionProps) {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);

  const handleGenderClick = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
  };

  const handleContinue = () => {
    if (selectedGender) {
      onGenderSelect(selectedGender);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Choose Your Gender
          </h2>
          <p className="text-lg text-muted-foreground">
            This helps us show you the most suitable hairstyles
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Upload
        </button>
      </div>

      {/* Gender Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Male Option */}
        <div
          onClick={() => handleGenderClick('male')}
          className={`group cursor-pointer p-8 rounded-2xl border-2 transition-colors ${
            selectedGender === 'male' 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-background hover:border-primary/50'
          }`}
        >
          <div className="text-center">
            <div className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
              selectedGender === 'male'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            }`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Male</h3>
            <p className="text-muted-foreground">
              Show me men's hairstyles and cuts
            </p>
            {selectedGender === 'male' && (
              <div className="mt-4 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Female Option */}
        <div
          onClick={() => handleGenderClick('female')}
          className={`group cursor-pointer p-8 rounded-2xl border-2 transition-colors ${
            selectedGender === 'female' 
              ? 'border-primary bg-primary/5' 
              : 'border-border bg-background hover:border-primary/50'
          }`}
        >
          <div className="text-center">
            <div className={`mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
              selectedGender === 'female'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
            }`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Female</h3>
            <p className="text-muted-foreground">
              Show me women's hairstyles and cuts
            </p>
            {selectedGender === 'female' && (
              <div className="mt-4 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {selectedGender && (
        <div className="text-center">
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Continue to Hairstyles
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 p-6 bg-muted/30 rounded-2xl">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-foreground mb-2">
            Why do we ask for gender?
          </h4>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Different hairstyles are traditionally associated with different genders. 
            By selecting your gender, we can show you the most relevant and popular 
            hairstyles that will look great on you.
          </p>
        </div>
      </div>
    </div>
  );
}