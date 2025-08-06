import Card from "@/components/magicui/contador";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Shield, Star, Users } from "lucide-react";

const FinalCTASection = () => {

  const trustIndicators = [
    {
      icon: <Users className="w-5 h-5" />,
      text: "+10.000 alunos transformados"
    },
    {
      icon: <Star className="w-5 h-5" />,
      text: "4.9/5 estrelas de avaliação"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Garantia de 7 dias"
    }
  ];

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gold/5 via-transparent to-purple-500/5" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" />
      
      <div className="container mx-auto relative z-10 text-center">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            PROMOÇÃO PARA NOVOS
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            MEMBROS
          </h3>
          
          {/* Card com ícones e frase */}
          <div className="mb-6">
            <div className="glass-card inline-block px-6 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-silver">
                  Oferta por tempo limitado com <span className="text-gold font-semibold">25% de desconto</span>
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-silver-light">
            Aproveite esta oportunidade única de transformar sua carreira
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Countdown Timer */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-gold" />
            <span className="text-lg font-semibold text-gold">Oferta expira em:</span>
          </div>
          
          <div className="flex justify-center mb-4">
            <Card />
          </div>
          
          <p className="text-lg text-muted-foreground/60 italic text-center">
            Oferta pode acabar a qualquer momento, também de acordo com o número de novos membros
          </p>
        </div>

        {/* Price Highlight */}
        <div className="mb-12">
          <div className="inline-block glass-card p-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-3xl md:text-4xl font-bold text-muted-foreground line-through">
                De R$ 1.997
              </span>
              <span className="text-4xl md:text-6xl font-bold gradient-text">
                Por R$ 197
              </span>
            </div>
            <p className="text-gold font-semibold text-lg flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5" />
              Economia de mais de 90%!
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Button className="btn-gold text-xl px-12 py-6 mb-4 hover:scale-105 transform transition-all duration-300 shadow-glow">
            🚀 GARANTIR ACESSO VITALÍCIO AGORA
          </Button>
          <p className="text-sm text-muted-foreground">
            ✅ Acesso imediato • ✅ Sem mensalidades • ✅ Garantia de 7 dias
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {trustIndicators.map((indicator, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <div className="text-gold">
                {indicator.icon}
              </div>
              <span className="text-sm font-medium">{indicator.text}</span>
            </div>
          ))}
        </div>

        {/* Final Warning */}
        <div className="glass-card p-6 max-w-2xl mx-auto border-gold/30">
          <p className="text-lg font-semibold text-gold mb-2">
            ⚠️ ATENÇÃO: Esta oferta não se repetirá!
          </p>
          <p className="text-muted-foreground">
            Após o término da promoção, o valor retornará para R$ 1.997. 
            Não deixe essa oportunidade passar!
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;