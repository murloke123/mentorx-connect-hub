import { Button } from "@/components/ui/button";
import { Brain, Rocket } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-gold/20 to-background"></div>
      <div className="absolute inset-0 opacity-20">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-white text-shadow-gold">
            PRONTO PARA TRANSFORMAR
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-8">
            SUA MENTORIA?
          </h3>
          <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto text-white/90 leading-relaxed">
            Junte-se a milhares de mentores que já descobriram o poder da IA para 
            escalar seus negócios e transformar vidas.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-white text-gold font-bold py-6 px-12 rounded-2xl hover:bg-white/90 transform hover:scale-105 transition-all duration-300 shadow-lg text-xl"
          >
            <Brain className="mr-3 h-6 w-6" />
            COMEÇAR GRATUITAMENTE
          </Button>
          
          <Button 
            size="lg" 
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gold font-bold py-6 px-12 rounded-2xl transform hover:scale-105 transition-all duration-300 text-xl"
          >
            <Rocket className="mr-3 h-6 w-6" />
            AGENDAR DEMO
          </Button>
        </div>

        <div className="mt-12 glass-card inline-block px-8 py-4">
          <p className="text-white/80 text-sm">
            🎯 <strong>7 dias grátis</strong> • Sem cartão de crédito • Cancele quando quiser
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;