import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import BoardroomSection from "@/components/landing/BoardroomSection";
import ComparisonSection from "@/components/landing/ComparisonSection";
import ServicesSection from "@/components/landing/ServicesSection";
import RoadmapFocusSection from "@/components/landing/RoadmapFocusSection";
import NotForSection from "@/components/landing/NotForSection";
import WhyIBuiltSection from "@/components/landing/WhyIBuiltSection";
import PricingSection from "@/components/landing/PricingSection";
import EarlyAccessSection from "@/components/landing/EarlyAccessSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen overflow-x-hidden bg-background">
    <Header />
    <main>
      <HeroSection />
      <HowItWorksSection />
      <BoardroomSection />
      <ComparisonSection />
      <ServicesSection />
      <RoadmapFocusSection />
      <NotForSection />
      <WhyIBuiltSection />
      <PricingSection />
      <EarlyAccessSection />
      <FAQSection />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default Index;
