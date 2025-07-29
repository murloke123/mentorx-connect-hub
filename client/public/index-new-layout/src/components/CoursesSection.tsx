import { Play, Clock, Users, Star, TrendingUp, Zap, Crown, Video } from 'lucide-react';
import { Button } from "@/components/ui/button";

const courses = [
  {
    id: 1,
    title: "Trader Milionário em 90 Dias",
    mentor: "Dr. Ricardo Financas",
    thumbnail: "📊",
    price: "R$ 997",
    originalPrice: "R$ 497",
    modules: 12,
    hours: 40,
    students: "3.2K",
    rating: 4.9,
    badge: "🔥 BESTSELLER",
    badgeClass: "bg-gradient-to-r from-red-500 to-orange-500 text-white"
  },
  {
    id: 2,
    title: "Instagram Magnético - 100K em 6 Meses",
    mentor: "Ana Marketing Digital",
    thumbnail: "📱",
    price: "R$ 397",
    originalPrice: null,
    modules: 15,
    hours: 25,
    students: "5.1K",
    rating: 4.8,
    badge: "🚀 NOVO",
    badgeClass: "badge-premium"
  },
  {
    id: 3,
    title: "Python do Zero ao Expert IA",
    mentor: "Prof. Carlos Tech",
    thumbnail: "💻",
    price: "R$ 597",
    originalPrice: null,
    modules: 20,
    hours: 60,
    students: "2.8K",
    rating: 4.9,
    badge: "🤖 IA READY",
    badgeClass: "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
  },
  {
    id: 4,
    title: "Mindset Milionário Definitivo",
    mentor: "Dra. Julia Mindset",
    thumbnail: "🧠",
    price: "R$ 297",
    originalPrice: null,
    modules: 8,
    hours: 20,
    students: "6.7K",
    rating: 5.0,
    badge: "💎 TRANSFORMADOR",
    badgeClass: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  },
  {
    id: 5,
    title: "Império Digital do Zero",
    mentor: "Bruno Empreendedor",
    thumbnail: "🏢",
    price: "R$ 797",
    originalPrice: null,
    modules: 18,
    hours: 45,
    students: "1.9K",
    rating: 4.7,
    badge: "👑 PREMIUM",
    badgeClass: "badge-popular"
  },
  {
    id: 6,
    title: "Viral Creator Academy",
    mentor: "Marina Creator",
    thumbnail: "🎬",
    price: "R$ 447",
    originalPrice: null,
    modules: 12,
    hours: 30,
    students: "4.3K",
    rating: 4.8,
    badge: "📹 VIRAL",
    badgeClass: "bg-gradient-to-r from-pink-500 to-red-500 text-white"
  },
  {
    id: 7,
    title: "Copywriting Magnético",
    mentor: "Ana Marketing Digital",
    thumbnail: "✍️",
    price: "R$ 347",
    originalPrice: null,
    modules: 10,
    hours: 22,
    students: "3.8K",
    rating: 4.9,
    badge: "💫 ESSENCIAL",
    badgeClass: "badge-premium"
  },
  {
    id: 8,
    title: "Automação com IA para Negócios",
    mentor: "Prof. Carlos Tech",
    thumbnail: "🤖",
    price: "R$ 697",
    originalPrice: null,
    modules: 14,
    hours: 35,
    students: "2.1K",
    rating: 4.8,
    badge: "🔮 FUTURO",
    badgeClass: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
  }
];

const CoursesSection = () => {
  return (
    <section className="py-20 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-secondary to-background"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black mb-6 gradient-text text-shadow-gold">
            MAIS DE 500 CURSOS PREMIUM
          </h2>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            DISPONÍVEIS NA PLATAFORMA
          </h3>
          <p className="text-xl text-silver-light max-w-3xl mx-auto">
            Transforme sua vida com conhecimento de alta qualidade dos melhores especialistas do Brasil
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-gold to-gold-light mx-auto rounded-full mt-6"></div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="premium-card group hover:scale-105 transform transition-all duration-500 relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.badgeClass}`}>
                  {course.badge}
                </span>
              </div>

              {/* Thumbnail */}
              <div className="mb-4 relative">
                <div className="w-full h-32 bg-gradient-to-br from-gold/20 to-silver/20 rounded-xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                  {course.thumbnail}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent rounded-xl"></div>
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2 btn-silver text-xs py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              </div>

              {/* Course Info */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground group-hover:text-gold transition-colors duration-300 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-sm text-silver font-medium">
                  {course.mentor}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs text-silver-light">
                  <div className="flex items-center space-x-1">
                    <Video className="w-3 h-3 text-gold" />
                    <span>{course.modules} módulos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gold" />
                    <span>{course.hours}h</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-gold" />
                    <span>{course.students} alunos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-gold" />
                    <span>{course.rating}⭐</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {course.originalPrice && (
                      <span className="text-sm text-silver-light line-through">
                        {course.originalPrice}
                      </span>
                    )}
                    <span className="text-xl font-bold text-gold">
                      {course.price}
                    </span>
                  </div>
                  <Button size="sm" className="btn-gold text-xs py-1 px-3">
                    <Zap className="w-3 h-3 mr-1" />
                    Comprar
                  </Button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="glass-card inline-block px-8 py-6 max-w-2xl">
            <TrendingUp className="w-8 h-8 text-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Novos cursos toda semana
            </h3>
            <p className="text-silver-light mb-4">
              Nossa IA analisa as tendências do mercado e sugere novos conteúdos automaticamente
            </p>
            <Button className="btn-gold">
              Ver Todos os Cursos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;