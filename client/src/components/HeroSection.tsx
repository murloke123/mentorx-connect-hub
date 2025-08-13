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

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gold/30 rounded-full float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="gradient-text text-shadow-gold">
              TRANSFORME SEU CONHECIMENTO
            </span>
            <br />
            <span className="text-foreground text-3xl md:text-5xl italic">
              COM SUA PRÓPRIA PLATAFORMA DE MENTORIAS POTENCIALIZADA
            </span>
            <br />
            <div style={{ marginTop: '50px' }}>
              <span className="text-gold animate-glow-pulse flex items-center justify-center gap-3">
                <Bot className="h-16 w-16 md:h-20 md:w-20 text-gold animate-pulse drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <span className="text-gold font-black drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] shadow-gold animate-glow-pulse">
                  COM IA
                </span>
              </span>
            </div>
          </h1>
          
          <TypingAnimation
            className="text-xl md:text-2xl text-silver-light mb-8 max-w-4xl mx-auto leading-relaxed font-light italic"
            duration={50}
            repeat={true}
            showCursor={true}
            allowHTML={true}
          >
            {'A única plataforma com <span class="text-gold font-semibold">Inteligência Artificial</span> que permite acompanhar cada passo da jornada dos seus mentorados...'}
          </TypingAnimation>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Button 
            onClick={openVideoModal}
            className="btn-gold text-xl py-6 px-12 rounded-2xl shadow-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300"
          >
            <Play className="mr-3 h-6 w-6" />
            SAIBA MAIS SOBRE A PLATAFORMA
          </Button>
        </div>

        {/* Video Modal */}
         <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
           <DialogContent className="max-w-6xl w-full h-[90vh] p-0 bg-black border-none overflow-hidden">
             <div className="relative w-full h-full">

               
               {/* Glow Effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10 animate-pulse" />
               
               {/* Close Button */}
               <button
                 onClick={closeVideoModal}
                 className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-gold/20 text-white hover:text-gold rounded-full p-3 transition-all duration-300 shadow-glow border border-gold/30"
               >
                 <X className="h-6 w-6" />
               </button>
               
               {/* Video */}
               <iframe
                 src="https://player.vimeo.com/video/1109649210?autoplay=1&loop=1&controls=0"
                 className="w-full h-full"
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