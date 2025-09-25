"use client";

import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: 1,
    question: "How accurate are the virtual try-on results?",
    answer: "Our AI technology provides highly accurate results with a 95% satisfaction rate. The virtual try-on uses advanced facial recognition and hair simulation to show realistic previews of how different hairstyles will look on you."
  },
  {
    id: 2,
    question: "Is HaircutFun really free to use?",
    answer: "Yes! You can try on multiple hairstyles completely free. We offer premium features for users who want access to our full style library and advanced customization options."
  },
  {
    id: 3,
    question: "Do I need to create an account to use the app?",
    answer: "No account required for basic features! You can start trying on hairstyles immediately. Creating an account allows you to save your favorite looks and access your personal gallery."
  },
  {
    id: 4,
    question: "What photo quality works best?",
    answer: "For best results, use a clear, front-facing photo with good lighting. Avoid shadows on your face, and make sure your hair is visible. The photo should be high resolution (at least 500x500 pixels)."
  },
  {
    id: 5,
    question: "Can I share my results with my stylist?",
    answer: "Absolutely! You can save and share your virtual try-on results directly with your stylist. This helps ensure you get exactly the look you want during your salon visit."
  },
  {
    id: 6,
    question: "How many hairstyles can I try?",
    answer: "Our free version includes access to 5+ popular hairstyles. Premium users get access to our full library of 15+ professional hairstyles, including the latest trends and celebrity looks."
  },
  {
    id: 7,
    question: "Is my photo data secure?",
    answer: "Yes, your privacy is our priority. Photos are processed securely and are not stored permanently on our servers. We follow strict data protection guidelines to keep your information safe."
  },
  {
    id: 8,
    question: "Does it work on mobile devices?",
    answer: "Yes! HaircutFun is fully optimized for mobile devices. You can use it on your smartphone, tablet, or desktop computer with the same great experience."
  }
];

export function FAQSection() {

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
            <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Support
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 sm:mb-6 px-2">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Everything you need to know about HaircutFun
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="multiple" className="space-y-3 sm:space-y-4">
            {faqs.map((faq) => (
              <AccordionItem 
                key={faq.id} 
                value={`item-${faq.id}`} 
                className="border rounded-lg px-4 sm:px-6 bg-card/50 hover:bg-card/80 transition-colors duration-200"
              >
                <AccordionTrigger 
                  className="text-base sm:text-lg font-semibold text-foreground hover:no-underline py-4 sm:py-5 text-left [&[data-state=open]>svg]:rotate-180 touch-manipulation"
                  aria-expanded="false"
                >
                  <span className="pr-2">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2 pb-4 sm:pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <div className="bg-muted/30 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto border border-border/50">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
              Still have questions?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-2 sm:px-0">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a 
                href="mailto:admin@blackcubesolutions.com" 
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95 touch-manipulation text-sm sm:text-base"
                aria-label="Contact support via email"
              >
                Contact Support
              </a>
              <a 
                href="/about" 
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted/50 transition-all duration-200 active:scale-95 touch-manipulation text-sm sm:text-base"
                aria-label="Learn more about HaircutFun"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}