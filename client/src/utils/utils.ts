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
 * @param delay - Delay em ms antes de rolar (padrão: 100ms)
 */
export function navigateToTop(navigate: NavigateFunction, path: string, delay: number = 100) {
  navigate(path);
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, delay);
}
