import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Brain, Star, TrendingUp } from 'lucide-react';
import heroBackground from '@/assets/hero-bg.jpg';
import logo from '@/assets/logo.jpg';

const HeroSection = () => {
  const [count, setCount] = useState(2847);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "TRANSFORME SEU CONHECIMENTO";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground} 
          alt="Luxury mentor office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/60 to-background/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gold/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header with Logo */}
      <div className="absolute top-6 left-6 z-30 flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Mentora AI" className="w-12 h-12 glow-pulse" />
          <div>
            <h1 className="text-2xl font-bold gradient-text">Mentora AI</h1>
            <p className="text-xs text-silver opacity-80">by Mentor X</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text text-shadow-gold">
              {displayedText}
              <span className="animate-pulse">|</span>
            </span>
            <br />
            <span className="text-foreground">
              EM UM IMPÉRIO DIGITAL
            </span>
            <br />
            <span className="text-gold animate-glow-pulse">
              COM IA
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-silver-light mb-8 max-w-4xl mx-auto leading-relaxed">
            A única plataforma com <span className="text-gold font-semibold">Inteligência Artificial</span> que permite 
            acompanhar cada passo da jornada dos seus mentorados
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Button className="btn-gold text-xl py-6 px-12 rounded-2xl shadow-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300">
            <Brain className="mr-3 h-6 w-6" />
            QUERO MINHA PLATAFORMA EXCLUSIVA
          </Button>
        </div>

        {/* Counter */}
        <div className="glass-card inline-block px-8 py-4 animate-bounce-slow">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-gold animate-bounce" />
            <span className="text-lg text-silver-light">
              Mais de <span className="text-gold font-bold text-2xl">{count.toLocaleString()}</span> mentores já transformaram suas vidas
            </span>
            <Star className="h-6 w-6 text-gold animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
    </section>
  );
};

export default HeroSection;