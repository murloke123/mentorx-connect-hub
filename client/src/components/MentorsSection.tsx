import { Award, Rocket, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFeaturedMentors } from '../services/mentorService';
import { Profile } from '../types/database';
import MentorCard2 from './shared/MentorCard2';

const MentorsSection = () => {
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState(2847);

  useEffect(() => {
    const loadMentors = async () => {
      try {
        setIsLoading(true);
        const featuredMentors = await getFeaturedMentors();
        setMentors(featuredMentors);
      } catch (error) {
        console.error('Erro ao carregar mentores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMentors();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/palestrante.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            OS MAIORES ESPECIALISTAS DO BRASIL
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            JÁ ESTÃO AQUI
          </h3>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full"></div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading placeholders
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="premium-card bg-card/80 backdrop-blur-sm animate-pulse"
              >
                <div className="h-96 bg-muted/20 rounded-2xl"></div>
              </div>
            ))
          ) : (
            mentors.map((mentor) => (
              <MentorCard2 key={mentor.id} mentor={mentor} />
            ))
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-xl text-silver-light mb-6">
            Junte-se aos melhores mentores do Brasil
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            {/* Processo Seletivo Card */}
            <div className="glass-card px-6 py-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-gold" />
                <span className="text-gold font-semibold">Processo seletivo rigoroso</span>
                <span className="text-silver">•</span>
                <span className="text-silver">Apenas 3% são aprovados</span>
              </div>
            </div>
            
            {/* Counter Card - Abaixo do processo seletivo */}
            <div className="glass-card px-6 py-3">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-gold animate-pulse" />
                <span className="text-silver">
                  Mais de <span className="text-gold font-semibold">{count.toLocaleString()}</span> mentores já transformaram suas vidas
                </span>
                <Star className="w-5 h-5 text-gold animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorsSection;