import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Gem, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface PricingSectionProps {
  initialSelectedPlan?: string;
}

const PricingSection = ({ initialSelectedPlan }: PricingSectionProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>("GOLD");

  useEffect(() => {
    if (initialSelectedPlan) {
      setSelectedPlan(initialSelectedPlan);
    }
  }, [initialSelectedPlan]);

  useEffect(() => {
    const handleSelectPlatinum = () => {
      setSelectedPlan("PLATINUM");
    };

    window.addEventListener('selectPlatinum', handleSelectPlatinum);
    
    return () => {
      window.removeEventListener('selectPlatinum', handleSelectPlatinum);
    };
  }, []);

  const plans = [
    {
      name: "SILVER",
      description: "Plano Básico - Para quem está começando",
      price: "R$ 97",
      originalPrice: "R$ 197",
      icon: <Gem className="w-8 h-8" />,
      popular: false,
      features: [
        "Painel de Análise",
        "Criação de Conteúdo Digital",
        "Plataforma Multi-Mentor",
        "Módulo de Agendamento",
        "Módulo de Progresso",
        "Módulo de Pagamentos",
        "Suporte em horário comercial – Nível 3",
        "Material complementar"
      ],
      buttonText: "COMEÇAR AGORA",
      gradient: "from-slate-400 to-slate-600"
    },
    {
      name: "GOLD",
      description: "Plano Intermediário - O mais escolhido",
      price: "R$ 197",
      originalPrice: "R$ 397",
      icon: <Star className="w-8 h-8" />,
      popular: false,
      features: [
        "Tudo do plano Silver, mais:",
        "Orientações em grupo semanais",
        "Auxílio na criação de conteúdo",
        "Suporte prioritário – Nível 2",
        "Agente de IA para criação de conteúdos",
        "Agente de IA para suporte aos mentorados",
        "Material exclusivo"
      ],
      buttonText: "ESCOLHER GOLD",
      gradient: "from-yellow-400 to-yellow-600"
    },
    {
      name: "PLATINUM",
      description: "Plano Avançado - Para a excelência máxima",
      price: "R$ 397",
      originalPrice: "R$ 797",
      icon: <Crown className="w-8 h-8" />,
      popular: false,
      features: [
        "Tudo dos planos Silver e Gold, mais:",
        "Plataforma exclusiva só sua",
        "Criação da sua marca e domínio",
        "Performance garantida",
        "Agentes de IA altamente treinados",
        "Suporte nível máximo 24/7",
        "Engajamento da sua marca",
        "Parcerias e descontos para novos projetos"
      ],
      buttonText: "ESCOLHER PLATINUM",
      gradient: "from-gray-300 to-gray-500"
    }
  ];

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background opacity-90" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            NOSSOS PLANOS E
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            PREÇOS
          </h3>
          
          {/* Card com ícones e frase */}
          <div className="mb-6">
            <div className="glass-card inline-block px-6 py-3">
              <div className="flex items-center space-x-2">
                <Gem className="w-5 h-5 text-gold animate-pulse" />
                <span className="text-silver">
                  Transforme sua carreira com nossos <span className="text-gold font-semibold">planos exclusivos</span>
                </span>
                <Crown className="w-5 h-5 text-gold animate-pulse" />
              </div>
            </div>
          </div>
          
          <p className="text-xl text-silver-light italic">
            <em>"Cada mentorado é um diamante em potencial. Escolha o plano que vai lapidar seu talento e acelerar sua jornada."</em>
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto px-4">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              onClick={() => setSelectedPlan(plan.name)}
              className={`relative overflow-hidden transition-all duration-500 cursor-pointer transform-gpu ${
                selectedPlan === plan.name
                  ? 'border-gold shadow-2xl shadow-gold/30 ring-1 ring-gold/40 bg-gradient-to-b from-gold/5 to-transparent scale-105' 
                  : 'border-border hover:border-gold/30 hover:scale-102'
              } hover:shadow-xl`}
            >
              {selectedPlan === plan.name && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gold via-yellow-400 to-gold text-black text-center py-3 text-sm font-bold tracking-wider">
                  SELECIONADO
                </div>
              )}
              
              <CardHeader className={`text-center pb-4 ${selectedPlan === plan.name ? 'pt-16' : 'pt-8'}`}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-white`}>
                  {plan.icon}
                </div>
                
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                
                <CardDescription className="text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-lg text-muted-foreground line-through">{plan.originalPrice}</span>
                  </div>
                  <p className="text-sm text-gold font-semibold">
                    Economia de {Math.round(((parseInt(plan.originalPrice.replace('R$ ', '')) - parseInt(plan.price.replace('R$ ', ''))) / parseInt(plan.originalPrice.replace('R$ ', ''))) * 100)}%
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full py-6 text-lg font-bold transition-all duration-300 ${
                    selectedPlan === plan.name
                      ? 'btn-gold hover:shadow-glow' 
                      : 'bg-gradient-to-r from-border to-muted hover:from-gold/20 hover:to-gold-light/20 hover:text-gold'
                  }`}
                >
                  {plan.buttonText}
                </Button>

                {selectedPlan === plan.name && (
                  <div className="text-center">
                    <p className="text-xs text-gold font-semibold">
                      🔥 Oferta por tempo limitado!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            💎 Não encontrou o plano ideal? Entre em contato conosco!
          </p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-primary-foreground">
            FALAR COM ESPECIALISTA
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;