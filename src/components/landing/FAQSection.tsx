import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this just ChatGPT with a different skin?",
    answer: "It uses AI models, yes. The difference is structure: your idea is saved once, five advisors with fixed roles respond to it, and you get a scored verdict and a concrete plan instead of an open-ended chat.",
  },
  {
    question: "Will it tell me my idea is bad?",
    answer: "Yes, if it is. KILL is a real verdict and one of the advisors exists only to argue against you. It's better to hear it now than after three months of building.",
  },
  {
    question: "Do I need to code?",
    answer: "No. During signup you tell us whether you're technical, and the build plan adjusts. Non-technical founders get no-code options and a list of what to hand a developer.",
  },
  {
    question: "What happens to my idea?",
    answer: "It's stored in your account so you can return to it. It's sent to our AI provider only to generate your results. We don't sell it or share it, and you can ask us to delete it any time through the contact page.",
  },
  {
    question: "Why is it free?",
    answer: "We're in early access and want people using it and telling us what's missing. Paid plans will come later. Early users will hear about it well before anything changes.",
  },
];

const FAQSection = () => (
  <section id="faqs" className="px-6 py-24">
    <div className="mx-auto max-w-[1100px]">
      <h2 className="mb-10 text-3xl font-semibold text-foreground md:text-4xl">Questions people ask</h2>
      <Accordion type="single" collapsible className="max-w-3xl border-t border-border">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
            <AccordionTrigger className="py-5 text-left text-foreground hover:no-underline">{faq.question}</AccordionTrigger>
            <AccordionContent className="pb-5 text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQSection;
