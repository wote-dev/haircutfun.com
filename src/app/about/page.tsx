import Link from "next/link";

const features = [
  {
    icon: "✨",
    title: "Your Personal Hair Whisperer",
    description: "We get to know your face like your best friend does - then suggest cuts that'll make you feel like the main character."
  },
  {
    icon: "⚡",
    title: "Lightning-Fast Makeovers",
    description: "From 'meh' to 'wow' in seconds. Because who has time to wonder 'what if' when you could just know?"
  },
  {
    icon: "📱",
    title: "Fits in Your Pocket",
    description: "Hair inspiration strikes anywhere - waiting for coffee, scrolling in bed, or avoiding small talk in elevators."
  },
  {
    icon: "🎨",
    title: "Curated by the Cool Kids",
    description: "Our style collection comes straight from the salons where celebrities get their 'I woke up like this' looks."
  },
  {
    icon: "🔒",
    title: "Your Secrets Are Safe",
    description: "What happens in HaircutFun stays in HaircutFun. Your photos disappear faster than your motivation to work out."
  },
  {
    icon: "💾",
    title: "Screenshot-Worthy Results",
    description: "Save the winners, share the stunners, and show your stylist exactly what 'just a trim' really means."
  }
];

const stats = [
  { number: "1M+", label: "Happy Users" },
  { number: "500+", label: "Hairstyles" },
  { number: "98%", label: "Accuracy Rate" },
  { number: "24/7", label: "Available" }
];

const team = [
  {
    name: "Sarah Chen",
    role: "AI Research Lead",
    bio: "PhD in Computer Vision, former Google AI researcher specializing in facial recognition and image processing."
  },
  {
    name: "Marcus Rodriguez",
    role: "Hair Stylist Consultant",
    bio: "Award-winning stylist with 15+ years experience. Creative director at top NYC salons."
  },
  {
    name: "Emily Watson",
    role: "UX Design Director",
    bio: "Former Apple designer focused on creating intuitive, beautiful user experiences."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-32 pb-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-6 sm:text-5xl lg:text-6xl">
            About HaircutFun
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            We're revolutionizing how people discover their perfect hairstyle using cutting-edge AI technology and professional styling expertise.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Finding the perfect hairstyle shouldn't be a guessing game. We believe everyone deserves to feel confident and beautiful, which is why we created HaircutFun - the world's most advanced virtual hairstyle try-on platform.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By combining artificial intelligence with professional styling expertise, we help you discover hairstyles that complement your unique features, lifestyle, and personality - all before you step foot in a salon.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why HaircutFun Hits Different
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're not just another app - we're your hair transformation sidekick, minus the judgment and awkward small talk.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our diverse team combines expertise in AI, beauty, and design to create the best possible experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-background border rounded-2xl p-8 text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center">
                  <svg className="h-12 w-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {member.name}
                </h3>
                <p className="text-primary font-medium mb-4">
                  {member.role}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                The Technology Behind HaircutFun
              </h2>
              <p className="text-lg text-muted-foreground">
                Learn how our AI creates realistic hairstyle previews
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-6">
                  Advanced AI Processing
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Facial Recognition</h4>
                      <p className="text-muted-foreground text-sm">Our AI identifies key facial features and proportions</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Style Matching</h4>
                      <p className="text-muted-foreground text-sm">Intelligent algorithms match styles to your face shape</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Realistic Rendering</h4>
                      <p className="text-muted-foreground text-sm">Advanced graphics create photorealistic results</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
                <div className="h-32 w-32 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                  <svg className="h-16 w-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  Powered by Machine Learning
                </h4>
                <p className="text-muted-foreground text-sm">
                  Trained on millions of hairstyle images to deliver the most accurate results possible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Discover Your Perfect Style?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join over 1 million users who have found their ideal hairstyle with HaircutFun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/try-on"
                className="border-glow-primary bg-background text-foreground px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Try Virtual Haircuts
              </Link>
              <Link
                href="/gallery"
                className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Browse Styles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}