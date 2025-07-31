import { Course } from "@/types/database";
import { navigateToTop } from "@/utils/utils";
import { motion } from "framer-motion";
import { Bot, Clock, Play } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface CourseCardProps {
  course: Course;
  index?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, index = 0 }) => {
  const [categoryName, setCategoryName] = useState<string>('Categoria não definida');
  const navigate = useNavigate();

  const getCourseCategory = useCallback(() => {
    if (course.category) {
      return course.category;
    }
    
    // Fallback para dados antigos sem categoria
    const title = course.title.toLowerCase();
    if (title.includes('marketing') || title.includes('digital')) return 'Marketing Digital';
    if (title.includes('desenvolvimento') || title.includes('programação') || title.includes('code')) return 'Desenvolvimento';
    if (title.includes('finanças') || title.includes('investimento')) return 'Finanças';
    if (title.includes('liderança') || title.includes('gestão')) return 'Liderança';
    if (title.includes('negócios') || title.includes('empreendedorismo')) return 'Negócios';
    if (title.includes('design')) return 'Design';
    if (title.includes('vendas')) return 'Vendas';

    return 'Sem categoria';
  }, [course.category, course.title]);

  useEffect(() => {
      setCategoryName(getCourseCategory());
  }, [getCourseCategory]);

  // Função para obter as iniciais do mentor
  const getMentorInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para navegar ao perfil público do mentor
  const handleMentorClick = () => {
    if (course.mentor_id) {
      navigateToTop(navigate, `/mentor/publicview/${course.mentor_id}`);
    }
  };

  const handleCourseDetailsClick = () => {
    // Redirecionar para a nova página de visualização pública da landing page
    navigate(`/curso/${course.id}`);
  };


  const mentorName = course.mentor_info?.full_name || 'Mentor';
  const mentorAvatar = course.mentor_info?.avatar_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="w-full group"
    >
      {/* Container principal premium - Layout horizontal */}
      <div className="relative bg-background rounded-2xl shadow-2xl border border-white/10 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 glass-card">
        {/* Overlay com gradiente dourado no hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        
        {/* Layout Vertical */}
        <div className="flex flex-col h-full">
          {/* Seção da Imagem - Superior (sem bordas) */}
          <div className="relative h-48 overflow-hidden rounded-t-2xl">
            {/* Imagem do curso - encosta nas bordas */}
            <img 
              src={course.image_url} 
              alt={course.title}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay premium */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent"></div>
            
            {/* Efeitos Premium com Gradiente Dourado */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Efeito Shimmer 1 */}
              <div
                className="absolute -top-10 -left-20 w-72 h-72 bg-gold/8 rounded-full blur-3xl opacity-80 animate-pulse"
                style={{ animationDuration: '10s' }}
              ></div>

              {/* Efeito Shimmer 2 */}
              <div
                className="absolute -bottom-10 -right-10 w-60 h-60 bg-gold-light/10 rounded-full blur-2xl opacity-70 animate-pulse"
                style={{ animationDuration: '12s', animationDelay: '2s' }}
              ></div>
            </div>
            
            {/* Tag de preço no canto superior direito */}
            <div className="absolute top-2 right-2 z-20">
              <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/90 to-gold-light/90 text-background text-xs font-semibold shadow-lg backdrop-blur-sm border border-gold/20">
                {course.is_paid ? 
                  (course.discounted_price ? `R$ ${course.discounted_price.toFixed(0)}` : 
                   course.price ? `R$ ${course.price.toFixed(0)}` : 'PAGO') 
                  : 'GRATUITO'
                }
              </div>
            </div>
          </div>

          {/* Seção do Conteúdo - Abaixo da imagem */}
          <div className="px-2 py-2 flex flex-col flex-1">
            {/* Título do Curso com Avatar do Mentor */}
            <div className="flex items-center gap-2 mb-2">
              {/* Avatar do mentor */}
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-br from-gold to-gold-light border-2 border-white shadow-lg flex items-center justify-center text-background text-xs font-bold cursor-pointer hover:scale-110 transition-all duration-200 flex-shrink-0"
                onClick={handleMentorClick}
              >
                {mentorAvatar ? (
                  <img 
                    src={mentorAvatar} 
                    alt={mentorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getMentorInitials(mentorName)
                )}
              </div>
              
              {/* Título */}
              <h3 className="text-lg font-bold text-foreground line-clamp-2 leading-tight flex-1">
                {course.title}
              </h3>
            </div>

            {/* Descrição resumida */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
              {course.description ? 
                (course.description.length > 120 ? 
                  course.description.substring(0, 120) + '...' : 
                  course.description
                ) : 
                "Aprenda com um dos melhores mentores da plataforma e transforme sua carreira profissional."
              }
            </p>

            {/* Informações do curso */}
            <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>Vídeo aulas</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Acesso vitalício</span>
              </div>
              <div className="flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>Com IA</span>
              </div>
            </div>

            {/* Botão Ver Detalhes */}
            <button 
              onClick={handleCourseDetailsClick}
              className="w-full bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-background font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-xs mt-auto"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
