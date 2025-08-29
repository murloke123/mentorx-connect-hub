import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NavigateFunction } from "react-router-dom"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Navega para uma rota e rola a página para o topo
 * @param navigate - Função de navegação do React Router
 * @param path - Caminho para navegar
 * @param delay - Delay em ms antes de rolar (padrão: 300ms)
 */
export function navigateToTop(navigate: NavigateFunction, path: string, delay: number = 300) {
  navigate(path);
  
  // Aguardar a navegação e então rolar para o topo
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Fallback adicional para garantir o scroll
    setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 100);
  }, delay);
}
