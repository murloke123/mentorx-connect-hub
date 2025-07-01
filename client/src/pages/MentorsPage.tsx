import { MentorCard } from "@/components/shared/MentorCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/hooks/useCategories";
import { getAllPublicMentors } from "@/services/mentorService";
import { Mentor } from "@/types/database";
import { categoryIconMap, getCategoryIcon } from "@/utils/categoryIcons";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const MentorsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { categories } = useCategories();

  // Fetch all public mentors
  useEffect(() => {
    const loadMentors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllPublicMentors();
        setMentors(data);
      } catch (err) {
        console.error("Error loading mentors:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMentors();
  }, []);

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
        name: "Todos os Mentores", 
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
        const matchName = mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchBio = (mentor.bio || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchMessage = (mentor.highlight_message || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchName || matchBio || matchMessage;
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <div className="relative w-full">
        <div className="w-full h-[600px] overflow-hidden relative">
          <img 
            src="https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=1500&q=80"
            alt="Mentores Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/70 to-blue-600/70"></div>
          
          {/* Aurora Boreal Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="aurora-container">
              <div className="aurora aurora-1"></div>
              <div className="aurora aurora-2"></div>
              <div className="aurora aurora-3"></div>
            </div>
          </div>

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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  Conecte-se com Mentores
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto italic">
                  Encontre o mentor ideal para acelerar seu crescimento pessoal e profissional
                </p>
              </motion.div>
              
              {/* Search Container */}
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-5xl mx-auto mb-12 sm:mb-16">
                {/* Search Input */}
                <div className="relative flex-1 max-w-2xl w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <Input 
                    type="text" 
                    placeholder="Busque por nome, especialidade ou área de atuação..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg rounded-2xl border-0 shadow-xl bg-white transition-all duration-300 focus:outline-none focus:ring-0 focus:shadow-2xl focus:shadow-white/20"
                    style={{
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 4px rgba(255, 255, 255, 0.3), 0 10px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                    }}
                  />
                </div>
                
                {/* Filter Button */}
                <div className="flex gap-4">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "secondary"}
                    onClick={() => {
                      setSelectedCategory("all");
                      setSearchTerm("");
                    }}
                    className={`rounded-full px-6 py-6 font-medium transition-all duration-300 focus:outline-none focus:ring-0 flex items-center gap-2 ${
                      selectedCategory === "all" 
                        ? "bg-white text-purple-700 shadow-lg hover:shadow-xl focus:shadow-xl focus:shadow-white/20 border-2 border-purple-200" 
                        : "bg-white/20 text-white border border-white/30 hover:bg-white/30 focus:shadow-lg focus:shadow-white/20"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    Todos
                  </Button>
                </div>
              </div>

              {/* Categories Grid */}
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
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                        selectedCategory === category.id ? 'ring-4 ring-white shadow-2xl scale-105' : ''
                      }`}>
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: category.color }}
                        >
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className={`font-medium text-sm transition-colors duration-300 ${
                        selectedCategory === category.id ? 'text-white' : 'text-white/90 group-hover:text-white'
                      }`}>
                        {category.name}
                      </p>
                      <span className={`text-xs transition-colors duration-300 ${
                        selectedCategory === category.id ? 'text-white/80' : 'text-white/60 group-hover:text-white/80'
                      }`}>
                        ({category.count} mentores)
                      </span>
                    </div>
                  );
                })}
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
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {selectedCategory === "all" ? "Todos os Mentores" : categoriesWithAll.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Descubra mentores incríveis{searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
          
          {/* Active Filters */}
          {(selectedCategory !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
              <span className="text-xs sm:text-sm text-gray-600 w-full lg:w-auto text-center lg:text-left mb-2 lg:mb-0">
                Filtros ativos:
              </span>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer text-xs hover:bg-gray-300 transition-colors" onClick={() => setSelectedCategory("all")}>
                    {categoriesWithAll.find(c => c.id === selectedCategory)?.name} ×
                  </Badge>
                )}
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer text-xs hover:bg-gray-300 transition-colors" onClick={() => setSearchTerm("")}>
                    "{searchTerm}" ×
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 animate-spin">
              <Users className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg">Carregando mentores incríveis...</p>
          </div>
        )}

        {/* Mentors Grid */}
        {!isLoading && filteredMentors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMentors.map((mentor, index) => (
              <div
                key={mentor.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MentorCard mentor={mentor} />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredMentors.length === 0 && (
          <div className="text-center py-12 sm:py-16 lg:py-20 px-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            {selectedCategory !== "all" && !searchTerm ? (
              <>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Em breve teremos mentores nesta categoria
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                  Estamos trabalhando para trazer os melhores mentores de {categoriesWithAll.find(c => c.id === selectedCategory)?.name.toLowerCase()}. 
                  Fique atento às novidades!
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                  Nenhum mentor encontrado
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-sm sm:max-w-md lg:max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
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
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Add CSS animations and Aurora Effect */}
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
        
        @keyframes aurora {
          0%, 100% { transform: translateX(-100%) translateY(-50%) rotate(0deg); }
          50% { transform: translateX(100%) translateY(-50%) rotate(180deg); }
        }
        
        @keyframes aurora2 {
          0%, 100% { transform: translateX(100%) translateY(-50%) rotate(180deg); }
          50% { transform: translateX(-100%) translateY(-50%) rotate(0deg); }
        }
        
        @keyframes aurora3 {
          0%, 100% { transform: translateX(-50%) translateY(-100%) rotate(90deg); }
          50% { transform: translateX(-50%) translateY(100%) rotate(270deg); }
        }
        
        .aurora-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }
        
        .aurora {
          position: absolute;
          width: 200%;
          height: 100px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.1), 
            rgba(255, 255, 255, 0.2), 
            rgba(255, 255, 255, 0.1), 
            transparent
          );
          border-radius: 50px;
          filter: blur(20px);
        }
        
        .aurora-1 {
          top: 20%;
          animation: aurora 15s ease-in-out infinite;
          animation-delay: 0s;
        }
        
        .aurora-2 {
          top: 60%;
          animation: aurora2 20s ease-in-out infinite;
          animation-delay: 5s;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.05), 
            rgba(255, 255, 255, 0.15), 
            rgba(255, 255, 255, 0.05), 
            transparent
          );
        }
        
        .aurora-3 {
          left: 50%;
          width: 100px;
          height: 200%;
          animation: aurora3 25s ease-in-out infinite;
          animation-delay: 10s;
          background: linear-gradient(0deg, 
            transparent, 
            rgba(255, 255, 255, 0.03), 
            rgba(255, 255, 255, 0.08), 
            rgba(255, 255, 255, 0.03), 
            transparent
          );
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

export default MentorsPage; 