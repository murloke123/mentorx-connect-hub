import CourseCard from "@/components/shared/CourseCard";
import GoldenBanner from "@/components/shared/GoldenBanner";
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { getPublicCourses } from "@/services/courseService";
import { Course } from '@/types/database';
import { categoryIconMap, getCategoryIcon } from "@/utils/categoryIcons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Book, Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CoursesMobilePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filter, setFilter] = useState("all"); // "all", "free", "paid"
  const [showFilters, setShowFilters] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const { categories } = useCategories();

  // Fetch public courses
  const { data: courses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: ['publicCourses'],
    queryFn: getPublicCourses
  });

  // Função SIMPLES de comparação de categoria
  const courseMatchesCategory = (course: Course, categoryName: string) => {
    if (categoryName === "all") return true;
    
    // ✅ CORREÇÃO: Comparação case-insensitive
    return course.category?.toLowerCase() === categoryName.toLowerCase();
  };

  // Categorias com contagem dinâmica
  const categoriesWithAll = useMemo(() => {
    const result = [
      { 
        id: "all", 
        name: "Todos", 
        icon: categoryIconMap["all"].icon,
        color: categoryIconMap["all"].color,
        count: courses.length
      },
      // Categorias do banco usando NOMES
      ...categories.map(category => {
        const matchingCourses = courses.filter(course => courseMatchesCategory(course, category.name));
        const iconData = getCategoryIcon(category.name);
        return {
          id: category.name, // ✅ Usar nome ORIGINAL como ID
          name: category.name,
          icon: iconData.icon, // ✅ Extrair apenas icon e color
          color: iconData.color,
          count: matchingCourses.length
        };
      })
    ];
    
    return result;
  }, [courses, categories]);

  // Filtro principal
  const filteredCourses = useMemo(() => {
    let result = courses;
    
    // 1. Filtro de busca por texto
    if (searchTerm) {
      result = result.filter((course) => {
        const matchTitle = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchDesc = (course.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchTitle || matchDesc;
      });
    }
    
    // 2. Filtro de categoria
    if (selectedCategory !== "all") {
      result = result.filter((course) => {
        return courseMatchesCategory(course, selectedCategory);
      });
    }
    
    // 3. Filtro de preço
    if (filter !== "all") {
      result = result.filter((course) => {
        if (filter === "free") return !course.is_paid;
        if (filter === "paid") return course.is_paid;
        return true;
      });
    }
    
    return result;
  }, [courses, searchTerm, selectedCategory, filter]);

  // Debug quando categoria muda
  useEffect(() => {
    if (selectedCategory !== "all") {
      console.log(`✅ Filtro "${selectedCategory}": ${filteredCourses.length} cursos encontrados`);
    }
  }, [selectedCategory, filteredCourses.length]);

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Hero Section - Sem vídeo */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black/80 px-4 pt-2.5 pb-2.5">
        <div className="max-w-sm mx-auto text-center">
          {/* Banner Dourado */}
          {showBanner && (
            <div className="mb-2.5">
              <GoldenBanner
                title="Jornada de cursos específica para você"
                subtitle="Nossa IA é um reflexo da mente dos nossos mentores e foi treinada para guiar e potencializar o seu aprendizado."
                onClose={() => setShowBanner(false)}
              />
            </div>
          )}
          
          {/* Campo de busca */}
          <div className="relative mb-2.5">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
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
            Filtros
          </Button>
          
          {/* Collapsible Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-2.5"
            >
              {/* Price Filter Pills */}
              <div className="flex gap-2 justify-center">
                <Button
                  variant={filter === "all" ? "default" : "secondary"}
                  onClick={() => setFilter("all")}
                  size="sm"
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "all" 
                      ? "bg-gradient-to-r from-gold to-gold-light text-black" 
                      : "bg-black/30 text-white border border-gold/30"
                  }`}
                >
                  <Book className="h-3 w-3 mr-1" />
                  Todos
                </Button>
                <Button
                  variant={filter === "free" ? "default" : "secondary"}
                  onClick={() => setFilter("free")}
                  size="sm"
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "free" 
                      ? "bg-gradient-to-r from-gold to-gold-light text-black" 
                      : "bg-black/30 text-white border border-gold/30"
                  }`}
                >
                  Gratuitos
                </Button>
                <Button
                  variant={filter === "paid" ? "default" : "secondary"}
                  onClick={() => setFilter("paid")}
                  size="sm"
                  className={`rounded-full px-4 py-2 text-sm ${
                    filter === "paid" 
                      ? "bg-gradient-to-r from-gold to-gold-light text-black" 
                      : "bg-black/30 text-white border border-gold/30"
                  }`}
                >
                  Pagos
                </Button>
              </div>
              
              {/* Category Tags - Mobile Optimized */}
              <div className="space-y-2">
                <p className="text-sm text-gray-300 text-center">Categorias:</p>
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
            {selectedCategory === "all" ? "Todos os Cursos" : categoriesWithAll.find(c => c.id === selectedCategory)?.name}
          </h2>
          <p className="text-gray-300 text-sm text-center">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
          
          {/* Active Filters */}
          {(selectedCategory !== "all" || filter !== "all" || searchTerm) && (
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
              {filter !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer text-xs bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30" 
                  onClick={() => setFilter("all")}
                >
                  {filter === "free" ? "Gratuitos" : "Pagos"} ×
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
          <LoadingComponent message="Carregando cursos incríveis" />
        )}

        {/* Courses Grid - Mobile Optimized */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="space-y-4">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="w-full"
              >
                <CourseCard course={course} index={index} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gold" />
            </div>
            {selectedCategory !== "all" && !searchTerm && filter === "all" ? (
              <>
                <h3 className="text-lg font-bold text-gold mb-3">
                  Em breve teremos cursos com esse tópico
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Estamos trabalhando para trazer os melhores cursos de {categoriesWithAll.find(c => c.id === selectedCategory)?.name.toLowerCase()}. 
                  Fique atento às novidades!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gold mb-3">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                  Não encontramos cursos que correspondam aos seus critérios de busca. 
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </>
            )}
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setFilter("all");
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

export default CoursesMobilePage;