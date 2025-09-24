"use client";

import { useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { GenderSelection } from "@/components/GenderSelection";
import { HaircutGallery } from "@/components/HaircutGallery";
import { VirtualTryOn } from "@/components/VirtualTryOn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, Circle, Upload, Users, Scissors, Sparkles } from "lucide-react";

type Step = 'upload' | 'gender' | 'hairstyle' | 'result';
type Gender = 'male' | 'female';

export default function TryOnPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [uploadedPhoto, setUploadedPhoto] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedHairstyle, setSelectedHairstyle] = useState<string>('');

  const handlePhotoUpload = (photoUrl: string) => {
    setUploadedPhoto(photoUrl);
    setCurrentStep('gender');
  };

  const handleGenderSelect = (gender: Gender) => {
    setSelectedGender(gender);
    setCurrentStep('hairstyle');
  };

  const handleHairstyleSelect = (hairstyle: string) => {
    setSelectedHairstyle(hairstyle);
    setCurrentStep('result');
  };

  const resetFlow = () => {
    setCurrentStep('upload');
    setUploadedPhoto('');
    setSelectedGender(null);
    setSelectedHairstyle('');
  };

  const steps = [
    { id: 'upload', title: 'Upload Photo', icon: Upload, description: 'Add your photo' },
    { id: 'gender', title: 'Select Gender', icon: Users, description: 'Choose your gender' },
    { id: 'hairstyle', title: 'Choose Style', icon: Scissors, description: 'Pick a hairstyle' },
    { id: 'result', title: 'See Result', icon: Sparkles, description: 'View your new look' }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Try On New Hairstyles
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your photo and discover how you'd look with different hairstyles using our AI-powered virtual try-on technology.
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="mb-12 overflow-hidden">
          <CardContent className="p-4 sm:p-8">
            {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="grid grid-cols-4 gap-8">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.id} className="relative">
                      <div className="flex flex-col items-center text-center">
                        <div className={`
                          relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300 mb-4
                          ${status === 'completed' 
                            ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                            : status === 'current'
                            ? 'bg-primary/10 border-primary text-primary shadow-md'
                            : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                          }
                        `}>
                          {status === 'completed' ? (
                            <Check className="h-6 w-6" />
                          ) : (
                            <Icon className="h-6 w-6" />
                          )}
                          
                          {/* Step Number Badge */}
                          <div className={`
                            absolute -top-2 -right-2 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                            ${status === 'completed' || status === 'current'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                            }
                          `}>
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className={`text-lg font-semibold ${
                            status === 'current' ? 'text-primary' : 
                            status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {step.description}
                          </p>
                          
                          {/* Status Badge */}
                          {status === 'completed' && (
                            <Badge variant="default" className="text-xs">
                              Completed
                            </Badge>
                          )}
                          {status === 'current' && (
                            <Badge variant="secondary" className="text-xs">
                              Current Step
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Connection Line */}
                      {index < steps.length - 1 && (
                        <div className="absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-current to-transparent opacity-30 transform -translate-x-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Layout */}
            <div className="md:hidden">
              <div className="flex items-start justify-between gap-1 px-2">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const Icon = step.icon;
                  
                  // Shorter titles for mobile
                  const mobileTitle = step.title === 'Upload Photo' ? 'Upload' :
                                    step.title === 'Select Gender' ? 'Gender' :
                                    step.title === 'Choose Style' ? 'Style' :
                                    step.title === 'See Result' ? 'Result' : step.title;
                  
                  return (
                    <div key={step.id} className="flex items-center flex-1">
                      <div className="flex flex-col items-center text-center w-full">
                        {/* Step Circle */}
                        <div className={`
                          relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 mb-1
                          ${status === 'completed' 
                            ? 'bg-primary border-primary text-primary-foreground shadow-sm' 
                            : status === 'current'
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                          }
                        `}>
                          {status === 'completed' ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Icon className="h-3 w-3" />
                          )}
                          
                          {/* Step Number Badge */}
                          <div className={`
                            absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full text-xs font-bold flex items-center justify-center
                            ${status === 'completed' || status === 'current'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                            }
                          `}>
                            <span className="text-[8px]">{index + 1}</span>
                          </div>
                        </div>
                        
                        {/* Step Content */}
                        <div className="space-y-0.5">
                          <h3 className={`text-[10px] font-medium leading-tight ${
                            status === 'current' ? 'text-primary' : 
                            status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {mobileTitle}
                          </h3>
                          
                          {/* Status Indicator */}
                          {status === 'completed' && (
                            <div className="w-1 h-1 bg-primary rounded-full mx-auto"></div>
                          )}
                          {status === 'current' && (
                            <div className="w-1 h-1 bg-primary/60 rounded-full mx-auto animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Horizontal Connection Line */}
                      {index < steps.length - 1 && (
                        <div className={`
                          flex-1 h-0.5 mx-1 mt-[-16px] transition-colors
                          ${getStepStatus(steps[index + 1].id) === 'completed' || 
                            getStepStatus(steps[index + 1].id) === 'current'
                            ? 'bg-primary' 
                            : 'bg-muted-foreground/30'
                          }
                        `} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 'upload' && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Upload className="h-6 w-6 text-primary" />
                  Step 1: Upload Your Photo
                </CardTitle>
                <CardDescription>
                  Start by uploading a clear photo of yourself or choose from our example images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PhotoUpload onPhotoUpload={handlePhotoUpload} />
              </CardContent>
            </Card>
          )}

          {currentStep === 'gender' && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Step 2: Select Your Gender
                </CardTitle>
                <CardDescription>
                  This helps us show you the most relevant hairstyle options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('upload')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Upload
                  </Button>
                  <Badge variant="secondary" className="px-3 py-1">
                    Step 2 of 4
                  </Badge>
                </div>
                <GenderSelection 
                  onGenderSelect={handleGenderSelect}
                  onBack={() => setCurrentStep('upload')}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 'hairstyle' && selectedGender && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Scissors className="h-6 w-6 text-primary" />
                  Step 3: Choose Your Hairstyle
                </CardTitle>
                <CardDescription>
                  Browse through our collection of {selectedGender === 'male' ? 'men\'s' : 'women\'s'} hairstyles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('gender')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Gender
                  </Button>
                  <Badge variant="secondary" className="px-3 py-1">
                    Step 3 of 4
                  </Badge>
                </div>
                <HaircutGallery 
                  userPhoto={uploadedPhoto}
                  selectedGender={selectedGender} 
                  onHaircutSelect={handleHairstyleSelect}
                  onBack={() => setCurrentStep('gender')}
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 'result' && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  Step 4: Your New Look
                </CardTitle>
                <CardDescription>
                  Here's how you look with your selected hairstyle!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('hairstyle')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Hairstyles
                  </Button>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="px-3 py-1">
                      Step 4 of 4
                    </Badge>
                    <Badge variant="default" className="px-3 py-1">
                      Complete!
                    </Badge>
                  </div>
                </div>
                <VirtualTryOn 
                  userPhoto={uploadedPhoto}
                  selectedHaircut={selectedHairstyle}
                  onReset={resetFlow}
                  onBack={() => setCurrentStep('hairstyle')}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Additional Info */}
        <Card className="mt-12 bg-muted/50">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">
              How It Works
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Upload Photo</h4>
                <p className="text-sm text-muted-foreground">
                  Take or upload a clear front-facing photo
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Scissors className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Choose Style</h4>
                <p className="text-sm text-muted-foreground">
                  Browse and select from hundreds of hairstyles
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">See Results</h4>
                <p className="text-sm text-muted-foreground">
                  Get instant AI-powered hairstyle preview
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}