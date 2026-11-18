import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import AnimatedSection from "./AnimatedSection";

const faqs = [
  {
    question: "How does Vex score ideas?",
    answer:
      "First we search the web for products that already do what you describe, what they charge, and any regulations that might apply. Then an AI model, acting as a board of five advisors, scores your idea from 0 to 10 on problem clarity, market demand, execution difficulty and differentiation, using those search results as evidence. The board then argues the case for and against, and places the idea on a fixed scale of how likely it is to work. Under 4 is KILL: it most likely won't work. 4 to 6.9 is PIVOT: it could work with a change, or once a key assumption is proven. 7 or more is PROCEED: it most likely could work as described. An idea can't get PROCEED if it has no real demand or is a copy of what already exists, and a fatal flaw, such as being illegal, always means KILL. Every result shows a confidence level so you know how much evidence it rests on.",
  },
  {
    question: "Where do the competitors come from?",
    answer:
      "Only from live web search results. Each competitor links to the page it was found on, and we check that the product is actually named on that page. If a price isn't in the results, we say so instead of guessing. If the search fails, we show \"competitors unverified\" and lower the confidence rather than make anything up.",
  },
  {
    question: "Is my idea private?",
    answer:
      "Yes, by default. Your idea is stored so we can show you your result and, if you sign in, save it to your account. It's never public unless you press Share, and even then the public page only shows the verdict, the score, the one-line summary and a shortened version of your idea, never the full report. Your idea text is sent to our AI and search providers to produce the result. You can delete everything from your account at any time.",
  },
  {
    question: "Is this financial or legal advice?",
    answer:
      "No. Vex gives structured opinions, not guarantees. AI can be wrong, and search results can be incomplete or out of date. Use the verdict as a starting point for your own research and the conversations you have with real customers, and talk to a qualified professional about legal, tax or financial questions.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, during beta. You can run 3 ideas a day without an account. With a free account you get more runs plus the full report: the boardroom debate, roadmap, build plan and launch plan. After beta we plan to charge $9 per full report. The free verdict will stay free.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <AnimatedSection className="mb-10 text-center">
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">Questions, answered straight</h2>
        </AnimatedSection>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="rounded-xl border border-border bg-card/40 px-5">
              <AccordionTrigger className="min-h-[56px] text-left font-sans text-base font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
