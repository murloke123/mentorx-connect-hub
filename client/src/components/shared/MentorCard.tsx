import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mentor } from "@/types/database";
import { navigateToTop } from "@/utils/utils";
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
  if (!html || html.trim().length === 0) return "";
  
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const textContent = doc.body.textContent || "";
    
    // Remove espaços extras, quebras de linha desnecessárias e caracteres especiais
    return textContent
      .replace(/\s+/g, ' ')  // Substitui múltiplos espaços por um único espaço
      .replace(/\n+/g, ' ')  // Substitui quebras de linha por espaços
      .trim();               // Remove espaços no início e fim
  } catch (error) {
    // Fallback caso o DOMParser falhe
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
};

// Função para truncar texto em aproximadamente 350 caracteres
const truncateText = (text: string, maxLength: number = 350) => {
  if (!text || text.trim().length === 0) return "";
  
  // Remove espaços extras e quebras de linha desnecessárias
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  if (cleanText.length <= maxLength) return cleanText;
  
  // Encontra o último espaço antes do limite para não cortar palavras
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, index = 0 }) => {
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleViewProfile = () => {
    navigateToTop(navigate, `/mentor/publicview/${mentor.id}`);
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
      className="w-full max-w-sm mx-auto group"
    >
      {/* Container principal que conecta os dois cards */}
      <div className="relative bg-background rounded-2xl shadow-2xl border border-white/10 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 glass-card">
        {/* Overlay com gradiente dourado no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        {/* Card principal com efeito flip */}
        <div 
          className="relative w-full h-96 [perspective:1000px] cursor-pointer"
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
           <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-background overflow-hidden relative z-10">
             {/* Header com Efeito Premium Dourado */}
             <div className="relative overflow-hidden" style={{ height: '110px' }}>
               {/* Efeito Premium com Gradiente Dourado */}
               <div className="absolute inset-0 overflow-hidden">
                 {/* Base Gradient Premium */}
                 <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-gold-light/15 to-background"></div>

                 {/* Efeito Shimmer 1 */}
                 <div
                   className="absolute -top-10 -left-20 w-72 h-72 bg-gold/10 rounded-full blur-3xl opacity-80 animate-pulse"
                   style={{ animationDuration: '10s' }}
                 ></div>

                 {/* Efeito Shimmer 2 */}
                 <div
                   className="absolute -bottom-10 -right-10 w-60 h-60 bg-gold-light/15 rounded-full blur-2xl opacity-70 animate-pulse"
                   style={{ animationDuration: '12s', animationDelay: '2s' }}
                 ></div>
                 
                 {/* Efeito Shimmer 3 */}
                 <div
                   className="absolute top-5 left-1/3 w-48 h-48 bg-gold/8 rounded-full blur-xl opacity-90 animate-pulse"
                   style={{ animationDuration: '11s', animationDelay: '1s' }}
                 ></div>
               </div>
              
              {/* Tag Mentor Verificado Premium */}
              <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/20 text-gold border border-gold/30 text-xs font-semibold shadow-lg backdrop-blur-sm">
                  <Star className="w-3 h-3" />
                  <span>Mentor Verificado</span>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative flex justify-center" style={{ marginTop: '-50px' }}>
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-gold/30 shadow-lg shadow-gold/20">
                  <AvatarImage 
                    src={mentor.avatar_url || undefined} 
                    alt={mentor.full_name || "Mentor"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-gold to-gold-light text-background text-xl font-bold">
                    {mentor.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-background rounded-full"></div>
              </div>
            </div>

            {/* Conteúdo da Frente */}
            <div className="p-6 pt-4 text-center">
              {/* Nome e Tag de Categoria */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {mentor.full_name || "Mentor"}
                </h3>
                
                {/* Categoria do Mentor Premium */}
                {mentor.category && categoryInfo && (
                  <div className="mb-2">
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-background text-xs font-semibold shadow-lg backdrop-blur-sm border border-gold/30 bg-gradient-to-r from-gold to-gold-light"
                    >
                      {React.createElement(categoryInfo.icon, { className: "w-3 h-3" })}
                      <span>{mentor.category}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Highlight Message */}
              {mentor.highlight_message && (
                <p className="text-sm text-muted-foreground italic mb-4">
                  "{mentor.highlight_message}"
                </p>
              )}

              {/* Indicação para virar o card */}
              <p className="text-xs text-muted-foreground mt-auto pt-4">Passe o mouse para saber mais</p>
            </div>
          </div>

          {/* Verso do Card */}
           <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-background overflow-hidden relative z-10">
            <div className="p-4 h-full flex flex-col">
              {/* Header do verso com foto - mais compacto */}
              <div className="text-center mb-3">
                <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-gold/30">
                  <AvatarImage 
                    src={mentor.avatar_url || undefined} 
                    alt={mentor.full_name || "Mentor"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-gold to-gold-light text-background text-sm font-bold">
                    {mentor.full_name?.charAt(0) || "M"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-base font-bold text-foreground">
                  Sobre {mentor.full_name?.split(' ')[0] || "o Mentor"}
                </h3>
              </div>

              {/* Bio com borda premium - área flexível */}
              <div className="flex-1 mb-3 min-h-0">
                {mentor.bio ? (
                  <div className="border-2 border-gold/20 rounded-lg p-3 bg-gold/5 backdrop-blur-sm h-full overflow-y-auto">
                    <div className="text-xs text-foreground leading-relaxed text-justify">
                      <p className="whitespace-pre-line">{truncateText(stripHtmlTags(mentor.bio), 250)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-gold/20 rounded-lg p-3 bg-gold/5 backdrop-blur-sm h-full flex items-center justify-center">
                    <div className="text-xs text-muted-foreground italic text-center">
                      Este mentor ainda não adicionou uma biografia.
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de ação premium - mais compactos */}
              <div className="flex gap-1">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProfile();
                  }}
                  className="flex-1 bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-background shadow-lg hover:shadow-xl transition-all duration-200 text-xs"
                  size="sm"
                >
                  <User className="w-3 h-3 mr-1" />
                  Ver Perfil
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSchedule();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 px-2"
                  title="Agendar Conversa"
                >
                  <Calendar className="w-3 h-3" />
                </Button>
                {mentor.phone && (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContact();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 px-2"
                  >
                    <MessageCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Rodapé fixo premium que não vira com o card */}
      <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border-t border-gold/20 p-3 backdrop-blur-sm">
        <div className="flex justify-center">
          {/* Botão de agendar centralizado premium */}
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewSchedule();
            }}
            className="bg-gradient-to-r from-gold to-gold-light hover:from-gold-light hover:to-gold text-background shadow-lg hover:shadow-xl transition-all duration-200 w-full btn-gold"
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
