import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import SampleReportSection from "@/components/landing/SampleReportSection";
import BoardroomSection from "@/components/landing/BoardroomSection";
import First10MinutesSection from "@/components/landing/First10MinutesSection";
import RoadmapFocusSection from "@/components/landing/RoadmapFocusSection";
import NotForSection from "@/components/landing/NotForSection";
import BetaPricingSection from "@/components/landing/BetaPricingSection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";
import Starfield from "@/components/landing/Starfield";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <Starfield />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <SampleReportSection />
        <BoardroomSection />
        <First10MinutesSection />
        <RoadmapFocusSection />
        <NotForSection />
        <BetaPricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
