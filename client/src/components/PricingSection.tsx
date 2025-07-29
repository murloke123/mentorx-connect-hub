import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Básico",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para começar sua jornada como mentor",
      features: [
        "Até 100 alunos",
        "Relatórios básicos",
        "Suporte por email",
        "Templates básicos"
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 197",
      period: "/mês",
      description: "Para mentores que querem crescer rapidamente",
      features: [
        "Alunos ilimitados",
        "IA avançada",
        "Analytics completos",
        "Suporte prioritário",
        "Automações",
        "Templates premium"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 497",
      period: "/mês",
      description: "Solução completa para grandes operações",
      features: [
        "Tudo do Profissional",
        "White label",
        "API personalizada",
        "Suporte dedicado",
        "Treinamento exclusivo",
        "Customizações"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 relative bg-background">
      <div className="absolute inset-0 bg-background"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            PLANOS E
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            PREÇOS
          </h3>
          <p className="text-xl text-silver-light max-w-3xl mx-auto">
            Escolha o plano ideal para escalar sua mentoria
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`premium-card relative ${plan.popular ? 'ring-2 ring-gold scale-105' : ''} hover:scale-110 transform transition-all duration-500`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="badge-popular">
                    MAIS POPULAR
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black gradient-text">{plan.price}</span>
                  <span className="text-silver-light">{plan.period}</span>
                </div>
                <p className="text-silver-light">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-gold mr-3 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${plan.popular ? 'btn-gold' : 'btn-silver'}`}
              >
                Começar Agora
              </Button>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-silver-light mb-4">
            Não tem certeza qual plano escolher? Fale conosco!
          </p>
          <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-primary-foreground">
            Agendar Demonstração
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;