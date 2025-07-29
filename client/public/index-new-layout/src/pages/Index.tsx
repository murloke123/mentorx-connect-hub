import HeroSection from "@/components/HeroSection";
import MentorsSection from "@/components/MentorsSection";
import CoursesSection from "@/components/CoursesSection";
import FeaturesSection from "@/components/FeaturesSection";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import StatsSection from "@/components/StatsSection";
import PricingSection from "@/components/PricingSection";
import FinalCTASection from "@/components/FinalCTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <MentorsSection />
      <CoursesSection />
      <FeaturesSection />
      <HighlightsCarousel />
      <StatsSection />
      <PricingSection />
      <FinalCTASection />
    </div>
  );
};

export default Index;
