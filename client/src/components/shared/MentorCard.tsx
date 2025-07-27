import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mentor } from "@/types/database";
import { motion } from "framer-motion";
import { BarChart3, Calendar, Code, Crown, Grid3X3, Handshake, MessageCircle, Star, User } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface MentorCardProps {
  mentor: Mentor;
  index?: number;
}

// Função para mapear categoria ao ícone e cor correspondente
const getCategoryIcon = (category: string | null) => {
  if (!category) return null;
  
  const categoryLower = category.toLowerCase().trim();
  
  // Mapeamento de categorias para ícones e cores
  const categoryMap = {
    'desenvolvimento pessoal': { icon: User, color: '#8B5CF6' },
    'personal development': { icon: User, color: '#8B5CF6' },
    'liderança': { icon: Crown, color: '#3B82F6' },
    'leadership': { icon: Crown, color: '#3B82F6' },
    'marketing': { icon: BarChart3, color: '#F59E0B' },
    'digital marketing': { icon: BarChart3, color: '#F59E0B' },
    'tecnologia': { icon: Code, color: '#10B981' },
    'technology': { icon: Code, color: '#10B981' },
    'programação': { icon: Code, color: '#10B981' },
    'programming': { icon: Code, color: '#10B981' },
    'vendas': { icon: Handshake, color: '#EF4444' },
    'sales': { icon: Handshake, color: '#EF4444' }
  };
  
  // Procurar correspondência exata ou parcial
  for (const [key, value] of Object.entries(categoryMap)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }
  
  // Fallback para categoria não mapeada
  return { icon: Grid3X3, color: '#6B7280' };
};

// Função para remover tags HTML e renderizar texto limpo
const stripHtmlTags = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

// Função para truncar texto em aproximadamente 5 linhas (cerca de 300 caracteres)
const truncateText = (text: string, maxLength: number = 300) => {
  if (text.length <= maxLength) return text;
  
  // Encontra o último espaço antes do limite para não cortar palavras
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, index = 0 }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleViewProfile = () => {
    navigate(`/mentor/publicview/${mentor.id}`);
  };

  const handleContact = () => {
    if (mentor.phone) {
      window.open(`https://wa.me/${mentor.phone.replace(/\D/g, '')}`, '_blank');
    }
  };

  const handleViewSchedule = () => {
    navigate(`/mentor/publicschedule/${mentor.id}`);
  };

  // Obter ícone e cor da categoria
  const categoryInfo = getCategoryIcon(mentor.category || null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      className="w-full max-w-sm mx-auto"
    >
      {/* Container principal que conecta os dois cards */}
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Card principal com efeito flip */}
        <div 
          className="relative w-full h-80 [perspective:1000px] cursor-pointer"
          onMouseEnter={() => setIsFlipped(true)}
          onMouseLeave={() => setIsFlipped(false)}
          onClick={handleViewProfile}
        >
          <motion.div
            className="relative w-full h-full [transform-style:preserve-3d]"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
          {/* Frente do Card */}
           <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white overflow-hidden">
             {/* Header com Efeito de Nuvens Roxas */}
             <div className="relative overflow-hidden" style={{ height: '110px' }}>
               {/* Efeito de Nuvens Roxas */}
               <div className="absolute inset-0 overflow-hidden">
                 {/* Base Gradient for Sky */}
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700"></div>

                 {/* Cloud 1 - Lighter, larger, more blurred */}
                 <div
                   className="absolute -top-10 -left-20 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl opacity-80 animate-pulse"
                   style={{ animationDuration: '10s' }}
                 ></div>

                 {/* Cloud 2 - Slightly darker, medium size, less blurred */}
                 <div
                   className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-400/40 rounded-full blur-2xl opacity-70 animate-pulse"
                   style={{ animationDuration: '12s', animationDelay: '2s' }}
                 ></div>
                 
                 {/* Cloud 3 - Different shade, smaller, more defined */}
                 <div
                   className="absolute top-5 left-1/3 w-48 h-48 bg-indigo-300/30 rounded-full blur-xl opacity-90 animate-pulse"
                   style={{ animationDuration: '11s', animationDelay: '1s' }}
                 ></div>
               </div>
              
              {/* Tag Mentor Verificado à Esquerda (onde era a categoria) */}
              <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100/90 text-purple-700 text-xs font-semibold shadow-lg backdrop-blur-sm border border-purple-200/50">
                  <Star className="w-3 h-3" />
                  <span>Mentor Verificado</span>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative flex justify-center" style={{ marginTop: '-50px' }}>
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={mentor.avatar_url || undefined} 
                    alt={mentor.full_name || "Mentor"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-xl font-bold">
                    {mentor.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>

            {/* Conteúdo da Frente */}
            <div className="p-6 pt-4 text-center">
              {/* Nome e Tag de Categoria (onde era o mentor verificado) */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {mentor.full_name || "Mentor"}
                </h3>
                
                {/* Categoria do Mentor (agora no centro, onde era o mentor verificado) */}
                {mentor.category && categoryInfo && (
                  <div className="mb-2">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-lg backdrop-blur-sm border border-white/20"
                      style={{ backgroundColor: `${categoryInfo.color}E6` }}
                    >
                      {React.createElement(categoryInfo.icon, { className: "w-3 h-3" })}
                      <span>{mentor.category}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Highlight Message */}
              {mentor.highlight_message && (
                <p className="text-sm text-gray-700 italic mb-4">
                  "{mentor.highlight_message}"
                </p>
              )}

              {/* Indicação para virar o card */}
              <p className="text-xs text-gray-600 mt-auto pt-4">Passe o mouse para saber mais</p>
            </div>
          </div>

          {/* Verso do Card */}
           <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white overflow-hidden">
            <div className="p-6 h-full flex flex-col">
              {/* Header do verso com foto */}
              <div className="text-center mb-4">
                <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-purple-200">
                  <AvatarImage 
                    src={mentor.avatar_url || undefined} 
                    alt={mentor.full_name || "Mentor"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg font-bold">
                    {mentor.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-bold text-gray-800">
                  Sobre {mentor.full_name?.split(' ')[0] || "o Mentor"}
                </h3>
              </div>

              {/* Bio com borda */}
              <div className="flex-1 mb-4">
                {mentor.bio ? (
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <p className="whitespace-pre-line">{truncateText(stripHtmlTags(mentor.bio))}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="text-sm text-gray-500 italic text-center">
                      Este mentor ainda não adicionou uma biografia.
                    </div>
                  </div>
                )}
              </div>

              {/* Call to action */}
              <div className="text-center mb-4">
                <p className="text-xs text-gray-600 mb-2">
                  Clique no card para ver o perfil completo
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                  size="sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Ver Perfil Completo
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSchedule();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  title="Agendar Conversa"
                >
                  <Calendar className="w-4 h-4" />
                </Button>
                {mentor.phone && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Rodapé fixo que não vira com o card - integrado ao container */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 p-3">
        <div className="flex justify-center">
          {/* Botão de agendar centralizado */}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewSchedule();
            }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full"
            size="sm"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Button>
        </div>
      </div>
    </div>
      
      {/* Estilos CSS para o efeito Aurora e Grid Pattern da MagicUI */}
      <style>{`
        /* Estilos remanescentes podem ser colocados aqui, se houver. */
        /* Os estilos de .grid-pattern, .aurora-bg, .aurora-layer-* e .bg-gradient-radial foram removidos. */
      `}</style>
    </motion.div>
  );
};

export default MentorCard;
