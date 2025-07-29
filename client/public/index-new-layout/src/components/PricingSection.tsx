import { Check, Crown, Gem, Star, Zap, Users, Brain, PhoneCall } from 'lucide-react';
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "DIAMANTE BRUTO",
    price: "47",
    icon: Gem,
    description: "Para mentores iniciantes",
    badge: null,
    features: [
      "Orientações para criação de conteúdos digitais",
      "IA básica para sugestões de melhoria",
      "Sistema de abertura de chamados",
      "Analytics básicos dos mentorados",
      "Ferramentas de criação de curso"
    ],
    buttonText: "Começar Agora",
    buttonClass: "btn-silver",
    popular: false
  },
  {
    name: "DIAMANTE LAPIDADO",
    price: "97",
    icon: Star,
    description: "Para mentores em crescimento",
    badge: "MAIS POPULAR",
    features: [
      "Tudo do plano anterior",
      "IA avançada para criação automática de cursos",
      "Agentes IA para suporte aos alunos 24/7",
      "Gerenciamento inteligente de agenda",
      "Relatórios com insights de IA",
      "Suporte em horário comercial"
    ],
    buttonText: "Escolher Plano",
    buttonClass: "btn-gold",
    popular: true
  },
  {
    name: "DIAMANTE IMPERIAL",
    price: "197",
    icon: Crown,
    description: "Para mentores de elite",
    badge: "EXCLUSIVO",
    features: [
      "Tudo dos planos anteriores",
      "Contato DIRETO com o CEO da Mentor X",
      "Plataforma 100% personalizada com sua marca",
      "Publicação gratuita de 3 cursos premium",
      "IA personalizada treinada para seu nicho",
      "Prioridade em novas funcionalidades",
      "Participação em novos projetos Mentor X"
    ],
    buttonText: "Acesso VIP",
    buttonClass: "btn-gold",
    popular: false
  }
];

const PricingSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
      
      {/* Premium Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsl(var(--gold)) 1px, transparent 1px),
                           radial-gradient(circle at 80% 50%, hsl(var(--silver)) 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 100px 100px',
          backgroundPosition: '0 0, 50px 50px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            ESCOLHA SUA
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            JOIA RARA
          </h3>
          <p className="text-xl text-silver-light max-w-3xl mx-auto">
            Planos exclusivos com tecnologia de ponta para transformar sua mentoria
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={index}
                className={`relative premium-card group hover:scale-105 transform transition-all duration-500 ${
                  plan.popular ? 'border-gold shadow-gold lg:-mt-8' : ''
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="badge-popular">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${
                    plan.popular ? 'from-gold to-gold-light' : 'from-silver to-silver-light'
                  } p-5 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
                    {plan.name}
                  </h3>
                  
                  <p className="text-silver-light mb-4">
                    {plan.description}
                  </p>
                  
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-5xl font-black gradient-text">
                      R$ {plan.price}
                    </span>
                    <span className="text-xl text-silver-light ml-2">/mês</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                      <span className="text-silver-light text-sm leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button className={`w-full ${plan.buttonClass} text-lg py-6`}>
                  {plan.popular && <Zap className="w-5 h-5 mr-2" />}
                  {plan.name === "DIAMANTE IMPERIAL" && <Crown className="w-5 h-5 mr-2" />}
                  {plan.name === "DIAMANTE BRUTO" && <Gem className="w-5 h-5 mr-2" />}
                  {plan.buttonText}
                </Button>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-t ${
                  plan.popular ? 'from-gold/10' : 'from-silver/5'
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none`}></div>
              </div>
            );
          })}
        </div>

        {/* Special Features Highlight */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card text-center p-6">
            <Brain className="w-12 h-12 text-gold mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">IA Personalizada</h3>
            <p className="text-silver-light text-sm">Algoritmos exclusivos para seu nicho</p>
          </div>
          
          <div className="glass-card text-center p-6">
            <Users className="w-12 h-12 text-gold mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Suporte 24/7</h3>
            <p className="text-silver-light text-sm">Agentes IA sempre disponíveis</p>
          </div>
          
          <div className="glass-card text-center p-6">
            <PhoneCall className="w-12 h-12 text-gold mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Acesso ao CEO</h3>
            <p className="text-silver-light text-sm">Contato direto no plano Imperial</p>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="glass-card inline-block px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">
                  Garantia de 30 dias
                </div>
                <div className="text-sm text-silver-light">
                  100% do seu dinheiro de volta se não ficar satisfeito
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;