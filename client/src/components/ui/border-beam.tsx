import { cn } from "@/utils/utils";
import { motion } from "framer-motion";
import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  borderWidth?: number;
  reverse?: boolean;
  initialOffset?: number;
  style?: React.CSSProperties;
  transition?: any;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 50,
  duration = 6,
  delay = 0,
  colorFrom = "#FFD700", // Dourado
  colorTo = "#FFFFFF", // Branco
  borderWidth = 1,
  reverse = false,
  initialOffset = 0,
  style,
  transition,
}) => {
  return (
    <div 
      className="pointer-events-none absolute inset-0 rounded-[inherit] border-transparent overflow-hidden"
      style={{
        border: `${borderWidth}px solid transparent`,
        background: `linear-gradient(var(--border-angle, 0deg), transparent 30%, ${colorFrom}50 50%, ${colorTo}80 70%, transparent 100%) border-box`,
        WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
      }}
    >
      <motion.div
        className={cn(
          "absolute aspect-square",
          "rounded-full",
          className
        )}
        style={{
          width: size,
          height: size,
          background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
          filter: "blur(0.5px)",
          offsetPath: `rect(0 auto auto 0 round ${borderWidth}px)`,
          ...style,
        }}
        initial={{ 
          offsetDistance: `${initialOffset}%`,
          rotate: 0
        }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
          rotate: reverse ? [-360, 0] : [0, 360]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration,
          delay: -delay,
          ...transition,
        }}
      />
      
      {/* Segunda camada para efeito mais intenso */}
      <motion.div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(90deg, transparent, ${colorFrom}20, ${colorTo}30, transparent)`,
          ...style,
        }}
        initial={{ opacity: 0.3 }}
        animate={{ 
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.02, 1]
        }}
        transition={{
          repeat: Infinity,
          ease: "easeInOut",
          duration: duration * 0.8,
          delay: -delay,
        }}
      />
    </div>
  );
};