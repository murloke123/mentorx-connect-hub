import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Profile } from '@/types/database';
import { Brain, Briefcase, Calendar, Code, DollarSign, Palette, Star, TrendingUp } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MentorCard2Props {
  mentor: Profile;
}

const MentorCard2: React.FC<MentorCard2Props> = ({ mentor }) => {
  const navigate = useNavigate();

  // Função para navegar para o perfil público do mentor
  const handleCardClick = () => {
    navigate(`/mentor/publicview/${mentor.id}`);
  };

  // Função para navegar para a página de agendamento
  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique no botão dispare o clique do card
    navigate(`/mentor/publicschedule/${mentor.id}`);
  };
  // Função para gerar iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para truncar mensagem de destaque
  const truncateMessage = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Mensagem padrão caso não tenha highlight_message
  const getHighlightMessage = () => {
    if (mentor.highlight_message) {
      return truncateMessage(mentor.highlight_message, 100);
    }
    return "Transformando vidas através da mentoria especializada e experiência comprovada.";
  };

  // Função para obter ícone da categoria
  const getCategoryIcon = (category: string) => {
    // Normalizar a categoria para lowercase e remover acentos/espaços
    const normalizedCategory = category?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .trim();

    const categoryIcons: { [key: string]: React.ReactNode } = {
      // Tecnologia - várias variações
      'tecnologia': <Code className="w-4 h-4" />,
      'technology': <Code className="w-4 h-4" />,
      'tech': <Code className="w-4 h-4" />,
      
      // Design - várias variações
      'design': <Palette className="w-4 h-4" />,
      'designer': <Palette className="w-4 h-4" />,
      
      // Outras categorias
      'negocios': <Briefcase className="w-4 h-4" />,
      'business': <Briefcase className="w-4 h-4" />,
      'marketing': <TrendingUp className="w-4 h-4" />,
      'financas': <DollarSign className="w-4 h-4" />,
      'finance': <DollarSign className="w-4 h-4" />,
      'desenvolvimento-pessoal': <Brain className="w-4 h-4" />,
      'personal-development': <Brain className="w-4 h-4" />,
    };
    
    return categoryIcons[normalizedCategory] || null;
  };

  const categoryIcon = getCategoryIcon(mentor.category || '');

  return (
    <div 
      className="premium-card group hover:scale-105 transform transition-all duration-500 bg-card/80 backdrop-blur-sm relative flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Badge Fixo - VERIFICADO */}
      <div className="absolute -top-3 left-6 z-10">
        <span className="badge-premium flex items-center gap-1">
          <Star className="w-4 h-4" />
          VERIFICADO
        </span>
      </div>

      {/* Content Container - flex-grow para ocupar espaço disponível */}
      <div className="flex-grow flex flex-col">
        {/* Mentor Image */}
        <div className="relative mb-6 pt-4">
          <div className="w-24 h-24 mx-auto relative">
            <Avatar className="w-full h-full border-4 border-gold/30 group-hover:border-gold transition-all duration-300">
              <AvatarImage 
                src={mentor.avatar_url || ''} 
                alt={mentor.full_name || 'Mentor'}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-gold/20 to-gold-light/20 text-gold font-bold text-lg">
                {getInitials(mentor.full_name || 'Mentor')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full border-4 border-gold/50 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDuration: '3s' }}></div>
          </div>
        </div>

        {/* Mentor Info */}
        <div className="text-center flex-grow flex flex-col">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
            {mentor.full_name || 'Mentor Especialista'}
          </h3>
          
          {/* Specialty/Category com ícone */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {categoryIcon && (
              <span className="text-gold">
                {categoryIcon}
              </span>
            )}
            <p className="text-silver font-medium capitalize">
              {mentor.category?.replace('-', ' ') || 'Mentor Especialista'}
            </p>
          </div>

          {/* Highlight Message - flex-grow para ocupar espaço restante */}
          <div className="flex-grow flex items-center justify-center">
            <p className="text-base text-gold/90 px-2 leading-relaxed font-serif italic text-center">
              "{getHighlightMessage()}"
            </p>
          </div>
        </div>
      </div>

      {/* Action Button - fixo no rodapé */}
      <div className="mt-6 pt-4 border-t border-gold/20">
        <Button 
          className="btn-gold w-full group-hover:shadow-lg group-hover:shadow-gold/25 transition-all duration-300"
          onClick={handleScheduleClick}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Agendar Mentoria
        </Button>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
    </div>
  );
};

export default MentorCard2;