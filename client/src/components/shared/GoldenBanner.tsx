import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface GoldenBannerProps {
  title: string;
  subtitle: string;
  onClose?: () => void;
  className?: string;
}

const GoldenBanner = ({ title, subtitle, onClose, className = "" }: GoldenBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-2xl border border-slate-600 ${className}`}
    >
      {/* Efeito de reflexo dourado animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      

      
      {/* Botão de fechar */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center transition-all duration-200 group"
      >
        <X className="h-3 w-3 text-white/70 group-hover:text-white" />
      </button>
      
      {/* Conteúdo do banner */}
      <div className="relative z-5 px-8 py-4 text-center">
        <h2 className="text-lg font-bold text-white mb-2 leading-tight pr-6">
          {title}
        </h2>
        <p className="text-xs text-white/80 leading-relaxed pr-6">
          {subtitle}
        </p>
      </div>
      
      {/* Partículas douradas flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-slate-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default GoldenBanner;