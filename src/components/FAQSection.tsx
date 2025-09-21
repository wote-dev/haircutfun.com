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
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            <HelpCircle className="h-4 w-4 mr-2" />
            Support
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about HaircutFun
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="multiple" className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-muted/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:admin@blackcubesolutions.com" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="/about" 
                className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted/50 transition-colors"
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