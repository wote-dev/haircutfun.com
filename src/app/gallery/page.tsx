import Link from "next/link";

const haircutCategories = [
  {
    name: "Short Styles",
    description: "Bold and chic cuts that make a statement",
    styles: [
      { name: "Pixie Cut", popularity: 95 },
      { name: "Buzz Cut", popularity: 78 },
      { name: "Short Bob", popularity: 88 },
      { name: "Undercut Fade", popularity: 82 },
    ],
  },
  {
    name: "Medium Length",
    description: "Versatile styles perfect for any occasion",
    styles: [
      { name: "Classic Bob", popularity: 88 },
      { name: "Modern Shag", popularity: 85 },
      { name: "Wavy Lob", popularity: 90 },
      { name: "Shoulder Length", popularity: 87 },
    ],
  },
  {
    name: "Long Styles",
    description: "Flowing cuts with movement and elegance",
    styles: [
      { name: "Long Layers", popularity: 92 },
      { name: "Curtain Bangs", popularity: 87 },
      { name: "Beach Waves", popularity: 89 },
      { name: "Straight & Sleek", popularity: 84 },
    ],
  },
];

const trendingStyles = [
  {
    name: "Wolf Cut",
    description: "The edgy mullet-shag hybrid taking social media by storm",
    trend: "🔥 Trending",
    popularity: 96,
  },
  {
    name: "Curtain Bangs",
    description: "Face-framing bangs that work with any hair length",
    trend: "✨ Popular",
    popularity: 94,
  },
  {
    name: "Modern Shag",
    description: "Updated 70s classic with contemporary flair",
    trend: "💫 Rising",
    popularity: 91,
  },
];

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4 sm:text-5xl">
            Hairstyle Gallery
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore hundreds of professional hairstyles and find your perfect match
          </p>
          <Link
            href="/try-on"
            className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Virtual Haircuts
            <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Trending Styles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Trending Now
            </h2>
            <p className="text-lg text-muted-foreground">
              The hottest hairstyles everyone&apos;s talking about
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {trendingStyles.map((style, index) => (
              <div key={style.name} className="bg-background border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative">
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      {style.trend}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-20 w-20 rounded-full bg-primary/30 mx-auto mb-4 flex items-center justify-center">
                        <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {style.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {style.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {style.popularity}% match rate
                    </div>
                    <Link
                      href="/try-on"
                      className="text-primary hover:text-primary/80 font-medium text-sm"
                    >
                      Try Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Style Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Browse by Length
            </h2>
            <p className="text-lg text-muted-foreground">
              Find styles that match your preferred hair length
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {haircutCategories.map((category) => (
              <div key={category.name} className="bg-background border rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  {category.name}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {category.description}
                </p>
                
                <div className="space-y-4">
                  {category.styles.map((style) => (
                    <div key={style.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium text-foreground">
                          {style.name}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {style.popularity}%
                      </div>
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/try-on"
                  className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                >
                  Try These Styles
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Find Your Perfect Style?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Upload your photo and try on any of these styles instantly with our AI-powered virtual try-on technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/try-on"
                className="border-glow-primary bg-background text-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Start Virtual Try-On
              </Link>
              <Link
                href="/about"
                className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}