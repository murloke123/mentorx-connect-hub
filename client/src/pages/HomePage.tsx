import CoursesSection from "@/components/CoursesSection";
import FeaturesSection from "@/components/FeaturesSection";
import FinalCTASection from "@/components/FinalCTASection";
import HeroSection from "@/components/HeroSection";
import HighlightsCarousel from "@/components/HighlightsCarousel";
import MentorsSection from "@/components/MentorsSection";
import PricingSection from "@/components/PricingSection";
import CourseCard from "@/components/shared/CourseCard";
import Footer from "@/components/shared/Footer";
import MentorCard2 from "@/components/shared/MentorCard2";
import StatsSection from "@/components/StatsSection";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getPublicCourses } from "@/services/courseService";
import { getFeaturedMentors } from "@/services/mentorService";
import { Course, Mentor } from '@/types/database';
import React from "react";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const { toast } = useToast();
    const [liveCourses, setLiveCourses] = React.useState<Course[]>([]);
  const [featuredMentors, setFeaturedMentors] = React.useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🏠 HomePage: Iniciando carregamento de dados...');
        setIsLoading(true);
        const [courses, mentors] = await Promise.all([
          getPublicCourses(),
          getFeaturedMentors()
        ]);
        
        console.log('🏠 HomePage: Dados recebidos:', {
          totalCursos: courses.length,
          totalMentores: mentors.length
        });
        
        // Exibir até 8 cursos em destaque
        setLiveCourses(courses.slice(0, 8));
        setFeaturedMentors(mentors);
        
        console.log('🏠 HomePage: Estados atualizados:', {
          cursosExibidos: courses.slice(0, 8).length,
          mentoresExibidos: mentors.length
        });
      } catch (error) {
        console.error("Error loading homepage data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível buscar os cursos e mentores.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

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
      
      {/* Pricing Section - Seção de preços */}
      <PricingSection />
      
      {/* Live Courses Section - Mantendo seção original com styling melhorado */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
              CURSOS EM
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              DESTAQUE
            </h3>
            <p className="text-xl text-silver-light max-w-3xl mx-auto mb-8">
              Descubra os cursos mais procurados da plataforma
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mb-8"></div>
            <Link to="/courses">
              <Button className="btn-gold">Ver todos os cursos</Button>
            </Link>
          </div>
          
          {/* Grid responsivo: 1 coluna no mobile, 2 no tablet, 4 no desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {!isLoading && liveCourses.map((course) => (
              <div key={course.id} className="transform hover:scale-105 transition-all duration-300">
                <CourseCard course={course} />
              </div>
            ))}
            {isLoading && (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="h-48 glass-card animate-pulse" />
                ))}
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Featured Mentors Section - Mantendo seção original com styling melhorado */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
              MENTORES EM
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              DESTAQUE
            </h3>
            <p className="text-xl text-silver-light max-w-3xl mx-auto mb-8">
              Conheça os mentores mais experientes da nossa plataforma
            </p>
            <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mb-8"></div>
            <Link to="/mentors">
              <Button className="btn-gold">Conheça nossos mentores</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {!isLoading && featuredMentors.map((mentor) => (
              <MentorCard2 
                key={mentor.id} 
                mentor={mentor}
              />
            ))}
            {isLoading && (
              <>
                <div className="h-96 glass-card animate-pulse" />
                <div className="h-96 glass-card animate-pulse" />
                <div className="h-96 glass-card animate-pulse" />
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Final CTA Section do novo layout */}
      <FinalCTASection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
