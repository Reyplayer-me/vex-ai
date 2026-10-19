import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import DemoSection from "@/components/landing/DemoSection";
import BoardroomSection from "@/components/landing/BoardroomSection";
import ServicesSection from "@/components/landing/ServicesSection";
import First10MinutesSection from "@/components/landing/First10MinutesSection";
import RoadmapFocusSection from "@/components/landing/RoadmapFocusSection";
import ProcessSection from "@/components/landing/ProcessSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import NotForSection from "@/components/landing/NotForSection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import Starfield from "@/components/landing/Starfield";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Starfield />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <DemoSection />
        <BoardroomSection />
        <First10MinutesSection />
        <ServicesSection />
        <RoadmapFocusSection />
        <ProcessSection />
        <BenefitsSection />
        <NotForSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
