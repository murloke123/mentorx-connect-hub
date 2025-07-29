const HighlightsCarousel = () => {
  const highlights = [
    "🎙️ Em breve: Parcerias em Podcast",
    "🤖 IA Cada vez mais avançada para criar seus conteúdos automaticamente",
    "💎 Descontos em novos projetos da nossa empresa para membros 'Life'",
    "⚡ Mentoria personalizada com IA avançada",
    "🚀 Plataforma em constante evolução"
  ];

  return (
    <section className="relative h-24 w-full overflow-hidden bg-gradient-to-r from-background/50 via-primary/10 to-background/50 border-y border-gold/20">
      {/* Background animated particles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-1/4 w-2 h-2 bg-gold rounded-full animate-pulse"></div>
        <div className="absolute top-6 right-1/3 w-1 h-1 bg-silver rounded-full animate-bounce"></div>
        <div className="absolute bottom-4 left-1/2 w-1.5 h-1.5 bg-primary rounded-full glow-pulse"></div>
      </div>
      
      {/* Scrolling content */}
      <div className="flex items-center h-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...highlights, ...highlights].map((highlight, index) => (
            <div
              key={index}
              className="mx-8 px-6 py-2 bg-card/30 backdrop-blur-sm border border-gold/30 rounded-full shadow-lg hover:shadow-gold/20 transition-all duration-300"
            >
              <span className="text-sm font-medium text-foreground/90 tracking-wide">
                {highlight}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
    </section>
  );
};

export default HighlightsCarousel;