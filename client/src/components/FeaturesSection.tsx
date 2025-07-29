import { BarChart3, Brain, Rocket, Shield, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: "IA Que Potencializa Seus Resultados",
    description: "Nossa IA analisa o comportamento dos mentorados e sugere automaticamente melhorias para aumentar o engajamento e conclusão dos cursos",
    color: "from-purple-500 to-blue-500"
  },
  {
    icon: BarChart3,
    title: "Analytics Avançados",
    description: "Relatórios detalhados com insights de IA sobre o progresso dos seus mentorados e oportunidades de melhoria",
    color: "from-gold to-gold-light"
  },
  {
    icon: Users,
    title: "Gestão Inteligente de Mentorados",
    description: "Sistema automatizado para acompanhar cada aluno individualmente com recomendações personalizadas",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Automação Completa",
    description: "Automatize tarefas repetitivas e foque no que realmente importa: criar conteúdo de qualidade",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Shield,
    title: "Segurança Premium",
    description: "Proteção avançada para seu conteúdo e dados dos mentorados com criptografia de nível bancário",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Rocket,
    title: "Crescimento Acelerado",
    description: "Ferramentas de marketing integradas para escalar seu negócio de mentoria rapidamente",
    color: "from-pink-500 to-red-500"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 relative bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-background"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            POR QUE MENTORES ESCOLHEM
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            MENTORA AI
          </h3>
          <p className="text-xl text-silver-light max-w-3xl mx-auto">
            A plataforma mais avançada do Brasil, potencializada por Inteligência Artificial
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="premium-card group hover:scale-105 transform transition-all duration-500"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-gold transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-silver-light leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            );
          })}
        </div>

        {/* Special IA Feature Card */}
        <div className="mt-16">
          <div className="glass-card max-w-4xl mx-auto p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-silver/10"></div>
            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-5 mx-auto mb-6 glow-pulse">
                <Brain className="w-full h-full text-white" />
              </div>
              <h3 className="text-3xl font-bold gradient-text mb-4">
                Inteligência Artificial Integrada
              </h3>
              <p className="text-xl text-silver-light max-w-2xl mx-auto mb-6">
                Nossa IA exclusiva aprende com os dados dos seus mentorados e otimiza automaticamente 
                a experiência de aprendizado, aumentando em <span className="text-gold font-bold">até 300%</span> a taxa de conclusão dos cursos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold mb-2">94.7%</div>
                  <div className="text-silver">Taxa de Satisfação</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold mb-2">300%</div>
                  <div className="text-silver">Aumento no Engajamento</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gold mb-2">85%</div>
                  <div className="text-silver">Conclusão de Cursos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;