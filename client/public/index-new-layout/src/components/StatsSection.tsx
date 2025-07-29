import { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Star, BookOpen, Clock } from 'lucide-react';

const StatsSection = () => {
  const [stats, setStats] = useState({
    mentors: 2847,
    students: 847392,
    revenue: 47200000,
    satisfaction: 94.7,
    courses: 523,
    hours: 2800000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        mentors: prev.mentors + Math.floor(Math.random() * 2),
        students: prev.students + Math.floor(Math.random() * 5),
        revenue: prev.revenue + Math.floor(Math.random() * 1000),
        satisfaction: Math.min(99.9, prev.satisfaction + Math.random() * 0.1),
        courses: prev.courses + (Math.random() > 0.8 ? 1 : 0),
        hours: prev.hours + Math.floor(Math.random() * 10)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatMoney = (value: number) => {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const statItems = [
    {
      icon: Users,
      label: "Mentores Ativos",
      value: stats.mentors.toLocaleString(),
      color: "from-blue-500 to-cyan-500",
      suffix: ""
    },
    {
      icon: TrendingUp,
      label: "Mentorados Cadastrados",
      value: formatNumber(stats.students),
      color: "from-green-500 to-emerald-500",
      suffix: ""
    },
    {
      icon: DollarSign,
      label: "Gerados pelos Mentores",
      value: formatMoney(stats.revenue),
      color: "from-gold to-gold-light",
      suffix: ""
    },
    {
      icon: Star,
      label: "Taxa de Satisfação",
      value: stats.satisfaction.toFixed(1),
      color: "from-purple-500 to-pink-500",
      suffix: "%"
    },
    {
      icon: BookOpen,
      label: "Cursos Disponíveis",
      value: stats.courses.toLocaleString(),
      color: "from-orange-500 to-red-500",
      suffix: ""
    },
    {
      icon: Clock,
      label: "Horas de Conteúdo",
      value: formatNumber(stats.hours),
      color: "from-indigo-500 to-purple-500",
      suffix: ""
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background-secondary via-background to-background-secondary"></div>
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            NÚMEROS QUE
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            IMPRESSIONAM
          </h3>
          <p className="text-xl text-silver-light">
            Dados atualizados em tempo real da nossa plataforma
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass-card group hover:scale-105 transform transition-all duration-500"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} p-4 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                    <Icon className="w-full h-full text-white" />
                  </div>

                  {/* Stats */}
                  <div className="mb-4">
                    <div className="text-4xl md:text-5xl font-black gradient-text mb-2 animate-glow-pulse">
                      {stat.value}
                      <span className="text-2xl">{stat.suffix}</span>
                    </div>
                    <div className="text-silver-light font-medium">
                      {stat.label}
                    </div>
                  </div>

                  {/* Live Indicator */}
                  <div className="flex items-center justify-center space-x-2 text-xs text-gold">
                    <div className="w-2 h-2 bg-gold rounded-full animate-pulse"></div>
                    <span>Ao vivo</span>
                  </div>
                </div>

                {/* Hover Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Highlight */}
        <div className="mt-16 text-center">
          <div className="glass-card inline-block px-8 py-6">
            <div className="flex items-center space-x-4">
              <TrendingUp className="w-8 h-8 text-gold" />
              <div>
                <div className="text-lg font-bold text-foreground">
                  Crescimento de <span className="text-gold">+247%</span> nos últimos 12 meses
                </div>
                <div className="text-sm text-silver-light">
                  A plataforma de mentoria que mais cresce no Brasil
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;