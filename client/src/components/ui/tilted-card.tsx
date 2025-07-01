import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/utils";

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDegree?: number;
  hoverScale?: number;
  duration?: number;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className,
  tiltDegree = 5,
  hoverScale = 1.05,
  duration = 0.3,
}) => {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg bg-white shadow-lg border",
        className
      )}
      initial={{ 
        rotateX: 0, 
        rotateY: 0,
        scale: 1
      }}
      whileHover={{
        rotateX: tiltDegree,
        rotateY: tiltDegree,
        scale: hoverScale,
        transition: { duration }
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Gradient overlay for depth effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration }}
      />
    </motion.div>
  );
};

export default TiltedCard; 