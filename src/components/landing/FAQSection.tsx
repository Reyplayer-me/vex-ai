import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "./AnimatedSection";

const faqs = [
  {
    question: "How can AI automation help my business?",
    answer:
      "AI automation can streamline repetitive tasks, improve decision-making with data-driven insights, enhance customer experiences through personalized interactions, and reduce operational costs. It allows you to focus on strategic growth while AI handles the execution.",
  },
  {
    question: "Is AI automation difficult to integrate?",
    answer:
      "Not at all. VEX is designed to integrate seamlessly with your existing workflows. Our platform handles the technical complexity so you can focus on your business. Most users are up and running within minutes.",
  },
  {
    question: "What industries can benefit from AI automation?",
    answer:
      "Virtually every industry can benefit from AI automation — from startups and tech companies to healthcare, education, finance, e-commerce, and more. Any business that wants to work smarter and scale faster can leverage AI.",
  },
  {
    question: "Do I need technical knowledge to use AI automation?",
    answer:
      "No technical expertise is required. VEX is built for founders and creators, not engineers. Our intuitive interface guides you through every step, and our AI handles all the complex work behind the scenes.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We offer comprehensive support including email and chat support for all plans, priority support for Professional users, and 24/7 VIP support for Enterprise customers. Our team is always ready to help you succeed.",
  },
];

const FAQSection = () => {
  return (
    <section id="faqs" className="relative px-6 py-32">
      <div className="mx-auto max-w-3xl">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground mb-6">
            FAQs
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground mb-4">
            We've Got the Answers
            <br />
            You're Looking For
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Quick answers to your AI automation questions.
          </p>
        </AnimatedSection>

        {/* FAQ Accordion */}
        <AnimatedSection delay={200}>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border bg-card/30 px-6 transition-all duration-300 data-[state=open]:border-purple/30 hover:border-purple/20"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 transition-colors duration-300 hover:text-purple">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FAQSection;
