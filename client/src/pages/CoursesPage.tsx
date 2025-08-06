import CourseCard from "@/components/shared/CourseCard";
import LoadingComponent from "@/components/shared/LoadingComponent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";
import { getPublicCourses } from "@/services/courseService";
import { Course } from '@/types/database';
import { categoryIconMap, getCategoryIcon } from "@/utils/categoryIcons";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Book, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filter, setFilter] = useState("all"); // "all", "free", "paid"

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
        name: "Todos os Cursos", 
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
      {/* Hero Banner Section */}
      <div className="relative w-full">
        <div className="w-full h-[600px] overflow-hidden relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            ref={(video) => {
              if (video) {
                video.playbackRate = 0.6;
              }
            }}
          >
            <source src="/images/ensinando.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-gold/20 to-black/60"></div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-6xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="relative flex flex-col gap-4 items-center justify-center"
              >
                <div className="bg-black/40 backdrop-blur-sm w-full py-8 px-4 shadow-2xl mb-12">
                  <motion.h1 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight text-center" 
                    style={{
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  >
                    Jornada de cursos específica para você
                  </motion.h1>
                  <motion.p 
                    className="text-lg md:text-xl text-white mb-0 max-w-5xl mx-auto italic text-center whitespace-nowrap" 
                    style={{
                      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                    }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  >
                    Nossa IA é um reflexo da mente dos nossos mentores e foi treinada para guiar e potencializar o seu aprendizado.
                  </motion.p>
                </div>
              </motion.div>
              
              {/* Search and Filter Container */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-5xl mx-auto mb-16">
                {/* Search Input */}
                <div className="relative flex-1 max-w-2xl w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
          <Input 
            type="text" 
                    placeholder="O que você quer aprender hoje?" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg text-gray-900 placeholder-gray-500 rounded-2xl border-2 border-gold/40 shadow-xl bg-white transition-all duration-300 focus:outline-none focus:ring-0 focus:border-gold focus:shadow-2xl focus:shadow-gold/30"
                    style={{
                      boxShadow: '0 0 0 2px rgba(255, 215, 0, 0.2), 0 10px 25px rgba(0, 0, 0, 0.1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 4px rgba(255, 215, 0, 0.5), 0 10px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 215, 0, 0.2), 0 10px 25px rgba(0, 0, 0, 0.1)';
                    }}
          />
        </div>
                
                {/* Filter Pills */}
                <div className="flex gap-4">
                  <Button
                    variant={filter === "all" ? "default" : "secondary"}
                    onClick={() => {
                      setFilter("all");
                      setSelectedCategory("all");
                      setSearchTerm("");
                    }}
                    className={`rounded-full px-6 py-6 font-medium transition-all duration-300 focus:outline-none focus:ring-0 flex items-center gap-2 ${
                      filter === "all" 
                        ? "bg-gradient-to-r from-gold via-gold-light to-gold text-black shadow-lg hover:shadow-xl focus:shadow-xl focus:shadow-gold/20 border-2 border-gold/30" 
                        : "bg-black/30 text-white border border-gold/30 hover:bg-gold/10 focus:shadow-lg focus:shadow-gold/20"
                    }`}
                  >
                    <Book className="h-4 w-4" />
                    Todos
                  </Button>
                  <Button
                    variant={filter === "free" ? "default" : "secondary"}
                    onClick={() => setFilter("free")}
                    className={`rounded-full px-6 py-6 font-medium transition-all duration-300 focus:outline-none focus:ring-0 ${
                      filter === "free" 
                        ? "bg-gradient-to-r from-gold via-gold-light to-gold text-black shadow-lg hover:shadow-xl focus:shadow-xl focus:shadow-gold/20 border-2 border-gold/30" 
                        : "bg-black/30 text-white border border-gold/30 hover:bg-gold/10 focus:shadow-lg focus:shadow-gold/20"
                    }`}
                  >
                    Gratuitos
                  </Button>
                  <Button
                    variant={filter === "paid" ? "default" : "secondary"}
                    onClick={() => setFilter("paid")}
                    className={`rounded-full px-6 py-6 font-medium transition-all duration-300 focus:outline-none focus:ring-0 ${
                      filter === "paid" 
                        ? "bg-gradient-to-r from-gold via-gold-light to-gold text-black shadow-lg hover:shadow-xl focus:shadow-xl focus:shadow-gold/20 border-2 border-gold/30" 
                        : "bg-black/30 text-white border border-gold/30 hover:bg-gold/10 focus:shadow-lg focus:shadow-gold/20"
                    }`}
                  >
                    Pagos
                  </Button>
        </div>
      </div>

              {/* Categories Filters */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 lg:gap-6 max-w-5xl mx-auto">
                  {categoriesWithAll.filter(cat => cat.id !== "all").map((category, index) => {
                    const IconComponent = category.icon;
                    return (
                      <div
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`cursor-pointer transition-all duration-300 hover:-translate-y-2 group ${
                          selectedCategory === category.id ? 'transform -translate-y-2' : ''
                        }`}
                        style={{ animationDelay: `${(index + 1) * 100}ms` }}
                      >
                        <div className={`w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 mx-auto mb-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                          selectedCategory === category.id ? 'ring-2 ring-gold shadow-xl scale-105' : ''
                        }`}>
                          <div 
                            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                          >
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-black" />
                          </div>
                        </div>
                        <p className={`font-medium text-xs sm:text-sm transition-colors duration-300 text-center px-1 ${
                          selectedCategory === category.id ? 'text-white' : 'text-white/90 group-hover:text-white'
                        }`}>
                          {category.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gold mb-2">
              {selectedCategory === "all" ? "Todos os Cursos" : categoriesWithAll.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Segue nossa lista de cursos{searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
          
          {/* Active Filters */}
          {(selectedCategory !== "all" || filter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
              <span className="text-xs sm:text-sm text-gray-300 w-full lg:w-auto text-center lg:text-left mb-2 lg:mb-0">
                Filtros ativos:
              </span>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer text-xs bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-colors" onClick={() => setSelectedCategory("all")}>
                    {categoriesWithAll.find(c => c.id === selectedCategory)?.name} ×
                  </Badge>
                )}
                {filter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer text-xs bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-colors" onClick={() => setFilter("all")}>
                    {filter === "free" ? "Gratuitos" : "Pagos"} ×
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer text-xs bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30 transition-colors" onClick={() => setSearchTerm("")}>
                    "{searchTerm}" ×
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingComponent message="Carregando cursos incríveis" />
        )}

        {/* Courses Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id} 
                className="animate-fade-in-up w-full flex justify-center"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CourseCard course={course} index={index} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-gold/30 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gold" />
            </div>
            {selectedCategory !== "all" && !searchTerm && filter === "all" ? (
              <>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gold mb-3 sm:mb-4">
                  Em breve teremos cursos com esse tópico
                </h3>
                <p className="text-gray-300 mb-6 sm:mb-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                  Estamos trabalhando para trazer os melhores cursos de {categoriesWithAll.find(c => c.id === selectedCategory)?.name.toLowerCase()}. 
                  Fique atento às novidades!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gold mb-3 sm:mb-4">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-300 mb-6 sm:mb-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
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
              className="bg-gradient-to-r from-gold via-gold-light to-gold text-black hover:from-gold-light hover:to-gold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.8s ease-out 0.3s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default CoursesPage;
