import { Award, Users } from 'lucide-react';

const mentors = [
  {
    id: 1,
    name: "Dr. Ricardo Financas",
    image: "/images/brasoessemfundo.png", // Usando imagem existente como placeholder
    specialty: "Investimentos & Trading",
    badge: "⭐ TOP MENTOR",
    badgeClass: "badge-premium",
    stats: "847 mentorados | 4.9⭐ | R$ 2.3M gerados"
  },
  {
    id: 2,
    name: "Ana Marketing Digital",
    image: "/images/brasoessemfundo.png", // Usando imagem existente como placeholder
    specialty: "Marketing Digital & Vendas",
    badge: "🚀 RISING STAR",
    badgeClass: "badge-premium",
    stats: "1.2K mentorados | 4.8⭐ | +300% ROI médio"
  },
  {
    id: 3,
    name: "Prof. Carlos Tech",
    image: "/images/brasoessemfundo.png", // Usando imagem existente como placeholder
    specialty: "Programação & IA",
    badge: "🤖 TECH GURU",
    badgeClass: "badge-premium",
    stats: "956 mentorados | 4.9⭐ | 89% empregabilidade"
  },
  {
    id: 4,
    name: "Dra. Julia Mindset",
    image: "/images/brasoessemfundo.png", // Usando imagem existente como placeholder
    specialty: "Desenvolvimento Pessoal",
    badge: "💎 LIFE COACH",
    badgeClass: "badge-premium",
    stats: "2.1K mentorados | 5.0⭐ | 94% satisfação"
  },
  {
    id: 5,
    name: "Bruno Empreendedor",
    image: "/images/brasoessemfundo.png", // Usando imagem existente como placeholder
    specialty: "Empreendedorismo & Negócios",
    badge: "👑 BUSINESS EXPERT",
    badgeClass: "badge-premium",
    stats: "643 mentorados | 4.7⭐ | 156 negócios criados"
  },
  {
    id: 6,
    name: "Marina Creator",
    image: "/images/brasoessemfundo.png", // Usando imagem existente como placeholder
    specialty: "Criação de Conteúdo",
    badge: "📹 CONTENT QUEEN",
    badgeClass: "badge-premium",
    stats: "1.8K mentorados | 4.8⭐ | +50M views geradas"
  }
];

const MentorsSection = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/palestrante.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/70"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            OS MAIORES ESPECIALISTAS DO BRASIL
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            JÁ ESTÃO AQUI
          </h3>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full"></div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors.map((mentor, index) => (
            <div
              key={mentor.id}
              className="premium-card group hover:scale-105 transform transition-all duration-500 bg-card/80 backdrop-blur-sm"
            >
              {/* Badge */}
              <div className="absolute -top-3 left-6 z-10">
                <span className={mentor.badgeClass}>
                  {mentor.badge}
                </span>
              </div>

              {/* Mentor Image */}
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto relative">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="w-full h-full rounded-full object-cover border-4 border-gold/30 group-hover:border-gold transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-gold/50 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDuration: '3s' }}></div>
                </div>
              </div>

              {/* Mentor Info */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
                  {mentor.name}
                </h3>
                <p className="text-silver mb-4 font-medium">
                  {mentor.specialty}
                </p>

                {/* Stats */}
                <div className="space-y-2 text-sm text-silver-light">
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4 text-gold" />
                    <span>{mentor.stats}</span>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-xl text-silver-light mb-6">
            Junte-se aos melhores mentores do Brasil
          </p>
          <div className="glass-card inline-block px-6 py-3">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-gold" />
              <span className="text-gold font-semibold">Processo seletivo rigoroso</span>
              <span className="text-silver">•</span>
              <span className="text-silver">Apenas 3% são aprovados</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorsSection;