import CoursesSection from "@/components/CoursesSection";
import FeaturesSection from "@/components/FeaturesSection";
import FinalCTASection from "@/components/FinalCTASection";
import HeroSection from "@/components/HeroSection";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import MentorsSection from "@/components/MentorsSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/shared/Footer";
import StatsSection from "@/components/StatsSection";
import React from "react";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section do novo layout */}
      <HeroSection />
      
      {/* Placeholder para MentorsSection (será implementada depois) */}
      <MentorsSection />
      
      {/* Placeholder para CoursesSection (será implementada depois) */}
      <CoursesSection />
      
      {/* Features Section - Nova seção premium com IA */}
      <FeaturesSection />
      
      {/* Highlights Carousel - Seção de destaques animada */}
      <HighlightsCarousel />
      
      {/* Stats Section - Seção de estatísticas impressionantes */}
      <StatsSection />
      
      {/* Pricing Section - Seção "ESCOLHA SUA JOIA RARA" */}
      <PricingSection />
      
      {/* Final CTA Section do novo layout */}
      <FinalCTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
