import { TypingAnimation } from "@/components/magicui/typing-animation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Bot, Play, X } from 'lucide-react';
import { useState } from 'react';

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const openVideoModal = () => {
    setIsVideoOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoOpen(false);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/images/hero-bg.jpg" 
          alt="Luxury mentor office"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/40"></div>
      </div>

      {/* Floating Particles - Otimizado para performance mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Partículas para mobile (reduzidas) */}
        <div className="block sm:hidden">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`mobile-${i}`}
              className="absolute w-1.5 h-1.5 bg-gold/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Partículas para tablet */}
        <div className="hidden sm:block md:hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={`tablet-${i}`}
              className="absolute w-2 h-2 bg-gold/25 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${5 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
        
        {/* Partículas para desktop (completas) */}
        <div className="hidden md:block">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={`desktop-${i}`}
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
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight">
            <span className="gradient-text text-shadow-gold">
              TRANSFORME SEU CONHECIMENTO
            </span>
            <br />
            <span className="text-foreground text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl italic">
              COM SUA PRÓPRIA PLATAFORMA DE ENSINO GRATUITAMENTE
            </span>
            <br />
            <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 xl:mt-16">
              <span className="text-gold animate-glow-pulse flex items-center justify-center gap-2 sm:gap-3">
                <Bot className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-18 lg:w-18 xl:h-20 xl:w-20 text-gold animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <span className="text-gold font-black drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] shadow-gold animate-glow-pulse text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  COM IA
                </span>
              </span>
            </div>
          </h1>
          
          <TypingAnimation
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-silver-light mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed font-light italic px-4 sm:px-0"
            duration={50}
            repeat={true}
            showCursor={true}
            allowHTML={true}
          >
            {'A única plataforma com <span class="text-gold font-semibold">Inteligência Artificial</span> que permite acompanhar cada passo da jornada dos seus mentorados...'}
          </TypingAnimation>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center px-4 mb-12">
          <Button 
            onClick={openVideoModal}
            className="btn-gold text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl shadow-2xl hover:shadow-glow transform hover:scale-105 transition-all duration-300 flex items-center gap-2 sm:gap-3 font-bold w-full sm:w-auto max-w-sm sm:max-w-none"
          >
            <Play className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            <span className="text-center">SAIBA MAIS SOBRE A PLATAFORMA</span>
          </Button>
        </div>

        {/* Video Modal */}
         <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
           <DialogContent className="max-w-[100vw] max-h-[100vh] h-[100vh] sm:max-w-lg sm:max-h-none sm:h-auto md:max-w-2xl lg:max-w-4xl w-full p-0 bg-black border-gold/30 overflow-hidden m-0 sm:mx-auto">
             {/* Efeito de brilho de fundo */}
             <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10 animate-pulse" />
             
             {/* Botão de fechar customizado - maior para mobile */}
             <button
               onClick={closeVideoModal}
               className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-black/80 border-2 border-gold/50 flex items-center justify-center hover:bg-gold/20 hover:border-gold transition-all duration-300 group touch-manipulation"
             >
               <X className="h-6 w-6 sm:h-5 sm:w-5 text-gold group-hover:text-white" />
             </button>
             
             {/* Iframe do vídeo - responsivo */}
             <div className="relative w-full h-full sm:h-0 sm:pb-[56.25%]">
               <iframe
                 src="https://player.vimeo.com/video/1109649210?autoplay=1&loop=1&controls=0"
                 className="absolute top-0 left-0 w-full h-full"
                 frameBorder="0"
                 allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                 allowFullScreen
                 title="Introdução - Mentora AI"
               />
             </div>
           </DialogContent>
         </Dialog>
      </div>

      {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;