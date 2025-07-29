import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Zap, Clock, Brain, Crown, TrendingUp } from 'lucide-react';

const FinalCTASection = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset to 24 hours when it reaches 0
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
        
        {/* AI Processing Animation */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-gold/30 to-silver/30 rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-gold" />
              </div>
            </div>
          ))}
        </div>

        {/* Data Stream Lines */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent animate-shimmer"
              style={{
                top: `${10 + i * 12}%`,
                width: '100%',
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Main Content */}
        <div className="text-center">
          {/* Main Headline */}
          <div className="mb-8">
            <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              <span className="gradient-text text-shadow-gold animate-glow-pulse">
                A REVOLUÇÃO DA MENTORIA
              </span>
              <br />
              <span className="text-foreground">
                COM IA JÁ COMEÇOU
              </span>
            </h2>
          </div>

          {/* Urgency Section */}
          <div className="mb-12">
            <div className="glass-card max-w-4xl mx-auto p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-silver/10"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <Clock className="w-8 h-8 text-gold animate-bounce" />
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    Últimas 24 horas
                  </h3>
                  <Clock className="w-8 h-8 text-gold animate-bounce" />
                </div>
                
                <p className="text-xl md:text-2xl text-silver-light mb-6">
                  Acesso vitalício por apenas 
                  <span className="text-4xl font-black text-gold mx-2">R$ 497</span>
                  <span className="line-through text-silver opacity-60">(era R$ 1.997)</span>
                </p>

                {/* Countdown Timer */}
                <div className="flex items-center justify-center space-x-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-black text-gold bg-card-premium rounded-lg p-4 min-w-[80px]">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-silver-light mt-2">HORAS</div>
                  </div>
                  
                  <div className="text-2xl text-gold animate-pulse">:</div>
                  
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-black text-gold bg-card-premium rounded-lg p-4 min-w-[80px]">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-silver-light mt-2">MINUTOS</div>
                  </div>
                  
                  <div className="text-2xl text-gold animate-pulse">:</div>
                  
                  <div className="text-center">
                    <div className="text-3xl md:text-4xl font-black text-gold bg-card-premium rounded-lg p-4 min-w-[80px]">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-silver-light mt-2">SEGUNDOS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA Button */}
          <div className="mb-12">
            <Button className="btn-gold text-2xl py-8 px-16 rounded-2xl shadow-glow hover:shadow-gold transform hover:scale-110 transition-all duration-300 animate-glow-pulse">
              <Zap className="mr-4 h-8 w-8 animate-bounce" />
              GARANTIR ACESSO VITALÍCIO AGORA
              <Crown className="ml-4 h-8 w-8 animate-bounce" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6">
              <TrendingUp className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-lg font-bold text-foreground mb-2">+2.847 Mentores</div>
              <div className="text-sm text-silver-light">Já transformaram suas vidas</div>
            </div>
            
            <div className="glass-card p-6">
              <Brain className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-lg font-bold text-foreground mb-2">IA Exclusiva</div>
              <div className="text-sm text-silver-light">Tecnologia única no Brasil</div>
            </div>
            
            <div className="glass-card p-6">
              <Crown className="w-8 h-8 text-gold mx-auto mb-3" />
              <div className="text-lg font-bold text-foreground mb-2">Garantia Total</div>
              <div className="text-sm text-silver-light">30 dias ou seu dinheiro de volta</div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center space-x-8 text-silver-light text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Pagamento Seguro</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>SSL Certificado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Dados Protegidos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default FinalCTASection;