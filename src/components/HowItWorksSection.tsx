const steps = [
  {
    id: "01",
    name: "Upload Your Photo",
    description: "Take a selfie or upload a clear photo of yourself. Our AI works best with front-facing photos in good lighting.",
    icon: (
      <svg className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "02",
    name: "Choose Your Style",
    description: "Browse our extensive gallery of hairstyles or let our AI recommend styles based on your face shape and preferences.",
    icon: (
      <svg className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "03",
    name: "See the Magic",
    description: "Watch as our advanced AI technology applies your chosen hairstyle to your photo in real-time with stunning accuracy.",
    icon: (
      <svg className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground">
            Get your perfect haircut in just three simple steps. It's that easy!
          </p>
        </div>
        
        <div className="mx-auto mt-12 sm:mt-16 max-w-6xl">
          {/* Mobile: Vertical layout with connecting lines */}
          <div className="block sm:hidden space-y-6">
            {steps.map((step, stepIdx) => (
              <div key={step.name} className="relative">
                {/* Vertical connection line for mobile */}
                {stepIdx < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-6 bg-border z-0" />
                )}
                
                <div className="relative bg-background border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground">
                      {step.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-primary mb-1">
                        Step {step.id}
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-2">
                        {step.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet and Desktop: Grid layout */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
            {steps.map((step, stepIdx) => (
              <div key={step.name} className="relative h-full">
                <div className="relative bg-background border rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary text-primary-foreground mx-auto mb-3 sm:mb-4">
                    {step.icon}
                  </div>
                  
                  <div className="text-center flex-1 flex flex-col">
                    <div className="text-xs sm:text-sm font-semibold text-primary mb-1 sm:mb-2">
                      Step {step.id}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">
                      {step.name}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
            Ready to transform your look?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              100% Free to Use
            </div>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              No Registration Required
            </div>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <svg className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant Results
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}