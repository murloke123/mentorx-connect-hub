import {
    BarChart3,
    Briefcase,
    Code,
    DollarSign,
    Grid3X3,
    LucideIcon,
    Palette,
    User
} from "lucide-react";

export interface CategoryIcon {
  id: string;
  icon: LucideIcon;
  color: string;
}

// Mapeamento de ícones baseado nas categorias reais do banco
export const categoryIconMap: Record<string, CategoryIcon> = {
  "all": {
    id: "all",
    icon: Grid3X3,
    color: "#8B5CF6"
  },
  "desenvolvimento pessoal": {
    id: "desenvolvimento-pessoal",
    icon: User,
    color: "#8B5CF6"
  },
  "design": {
    id: "design", 
    icon: Palette,
    color: "#EC4899"
  },
  "finanças": {
    id: "financas",
    icon: DollarSign,
    color: "#F97316"
  },
  "marketing": {
    id: "marketing",
    icon: BarChart3,
    color: "#F59E0B"
  },
  "negócios": {
    id: "negocios",
    icon: Briefcase,
    color: "#3B82F6"
  },
  "tecnologia": {
    id: "tecnologia",
    icon: Code,
    color: "#10B981"
  }
};

// Função helper para obter o ícone e cor de uma categoria
export const getCategoryIcon = (categoryName: string | null | undefined): CategoryIcon => {
  if (!categoryName) {
    return categoryIconMap["all"];
  }
  
  const normalizedName = categoryName.toLowerCase().trim();
  return categoryIconMap[normalizedName] || categoryIconMap["all"];
};

// Função helper para obter o ícone por ID da categoria
export const getCategoryIconById = (categoryId: string | null | undefined, categories: any[]): CategoryIcon => {
  if (!categoryId) {
    return categoryIconMap["all"];
  }
  
  const category = categories.find(cat => cat.id === categoryId);
  if (category) {
    return getCategoryIcon(category.name);
  }
  
  return categoryIconMap["all"];
}; 