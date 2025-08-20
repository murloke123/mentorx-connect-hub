import GoldenBanner from "@/components/shared/GoldenBanner";
import LoadingComponent from "@/components/shared/LoadingComponent";
import MentorCard from "@/components/shared/MentorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { getAllPublicMentors } from "@/services/mentorService";
import { Mentor } from '@/types/database';
import { categoryIconMap, getCategoryIcon } from "@/utils/categoryIcons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Filter, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const MentorsMobilePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const { categories } = useCategories();

  // Fetch public mentors
  const { data: mentors = [], isLoading, error } = useQuery<Mentor[]>({
    queryKey: ['publicMentors'],
    queryFn: getAllPublicMentors
  });

  // Função SIMPLES de comparação de categoria
  const mentorMatchesCategory = (mentor: Mentor, categoryName: string) => {
    if (categoryName === "all") return true;
    
    // ✅ CORREÇÃO: Comparação case-insensitive
    return mentor.category?.toLowerCase() === categoryName.toLowerCase();
  };

  // Categorias com contagem dinâmica
  const categoriesWithAll = useMemo(() => {
    const result = [
      { 
        id: "all", 
        name: "Todos", 
        icon: categoryIconMap["all"].icon,
        color: categoryIconMap["all"].color,
        count: mentors.length
      },
      // Categorias do banco usando NOMES
      ...categories.map(category => {
        const matchingMentors = mentors.filter(mentor => mentorMatchesCategory(mentor, category.name));
        const iconData = getCategoryIcon(category.name);
        return {
          id: category.name, // ✅ Usar nome ORIGINAL como ID
          name: category.name,
          icon: iconData.icon, // ✅ Extrair apenas icon e color
          color: iconData.color,
          count: matchingMentors.length
        };
      })
    ];
    
    return result;
  }, [mentors, categories]);

  // Filtro principal
  const filteredMentors = useMemo(() => {
    let result = mentors;
    
    // 1. Filtro de busca por texto
    if (searchTerm) {
      result = result.filter((mentor) => {
        const matchName = mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchBio = (mentor.bio || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchCategory = (mentor.category || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchName || matchBio || matchCategory;
      });
    }
    
    // 2. Filtro de categoria
    if (selectedCategory !== "all") {
      result = result.filter((mentor) => {
        return mentorMatchesCategory(mentor, selectedCategory);
      });
    }
    
    return result;
  }, [mentors, searchTerm, selectedCategory]);

  // Debug quando categoria muda
  useEffect(() => {
    if (selectedCategory !== "all") {
      console.log(`✅ Filtro "${selectedCategory}": ${filteredMentors.length} mentores encontrados`);
    }
  }, [selectedCategory, filteredMentors.length]);

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Hero Section - Sem vídeo */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black/80 px-4 pt-2.5 pb-2.5">
        <div className="max-w-sm mx-auto text-center">
          {/* Banner Dourado */}
          {showBanner && (
            <div className="mb-2.5">
              <GoldenBanner
                title="Conecte-se com mentores especialistas"
                subtitle="Encontre o mentor ideal para acelerar sua jornada profissional e alcançar seus objetivos."
                onClose={() => setShowBanner(false)}
              />
            </div>
          )}
          
          {/* Campo de busca */}
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mentores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-slate-400 transition-all duration-200 shadow-lg backdrop-blur-sm"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full mb-2.5 h-10 bg-black/30 text-white border-gold/30 hover:bg-gold/10 flex items-center justify-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Especialidades
          </Button>
          
          {/* Collapsible Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-2.5"
            >
              {/* Category Tags - Mobile Optimized */}
              <div className="space-y-2">
                <p className="text-sm text-gray-300 text-center">Especialidades:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {categoriesWithAll.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Badge
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "secondary"}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`cursor-pointer px-3 py-2 text-xs flex items-center gap-1 transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-gold to-gold-light text-black border-gold"
                            : "bg-slate-800/50 text-white border-gold/30 hover:bg-gold/20"
                        }`}
                      >
                        <IconComponent className="h-3 w-3" />
                        {category.name}
                        {category.count > 0 && (
                          <span className="ml-1 text-xs opacity-75">({category.count})</span>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="px-4 py-6">
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gold mb-2 text-center">
            {selectedCategory === "all" ? "Todos os Mentores" : categoriesWithAll.find(c => c.id === selectedCategory)?.name}
          </h2>
          <p className="text-gray-300 text-sm text-center">
            {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 'es' : ''} encontrado{filteredMentors.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
          
          {/* Active Filters */}
          {(selectedCategory !== "all" || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {selectedCategory !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer text-xs bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30" 
                  onClick={() => setSelectedCategory("all")}
                >
                  {categoriesWithAll.find(c => c.id === selectedCategory)?.name} ×
                </Badge>
              )}
              {searchTerm && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer text-xs bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30" 
                  onClick={() => setSearchTerm("")}
                >
                  "{searchTerm}" ×
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingComponent message="Carregando mentores especialistas" />
        )}

        {/* Mentors Grid - Mobile Optimized */}
        {!isLoading && filteredMentors.length > 0 && (
          <div className="space-y-4">
            {filteredMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="w-full"
              >
                <MentorCard mentor={mentor} index={index} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMentors.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gold" />
            </div>
            {selectedCategory !== "all" && !searchTerm ? (
              <>
                <h3 className="text-lg font-bold text-gold mb-3">
                  Em breve teremos mentores nesta especialidade
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Estamos trabalhando para trazer os melhores mentores de {categoriesWithAll.find(c => c.id === selectedCategory)?.name.toLowerCase()}. 
                  Fique atento às novidades!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gold mb-3">
                  Nenhum mentor encontrado
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Não encontramos mentores que correspondam aos seus critérios de busca. 
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </>
            )}
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="bg-gradient-to-r from-gold via-gold-light to-gold text-black hover:from-gold-light hover:to-gold px-6 py-2 text-sm font-medium"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsMobilePage;