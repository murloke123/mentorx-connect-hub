import React, { useEffect, useState } from 'react';

interface FlipCountdownProps {
  value: number;
  label: string;
}

const FlipCountdown: React.FC<FlipCountdownProps> = ({ value, label }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [nextValue, setNextValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (value !== currentValue) {
      setNextValue(value);
      setIsFlipping(true);
      
      // Após a animação, atualiza o valor atual
      setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
      }, 800);
    }
  }, [value, currentValue]);

  const formatValue = (val: number) => val.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Container principal */}
        <div className="w-full h-full relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg border border-gold/30 overflow-hidden">
          
          {/* Parte superior fixa */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-2xl md:text-3xl font-bold text-gold font-mono leading-none">
                {formatValue(currentValue)}
              </span>
            </div>
          </div>

          {/* Parte inferior fixa */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 flex items-start justify-center pt-1">
              <span className="text-2xl md:text-3xl font-bold text-gold font-mono leading-none">
                {formatValue(nextValue)}
              </span>
            </div>
          </div>

          {/* Folha que cai (parte superior animada) */}
          {isFlipping && (
            <div 
              className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden rounded-t-lg z-10 origin-bottom animate-flip-fall"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 flex items-end justify-center pb-1">
                <span className="text-2xl md:text-3xl font-bold text-gold font-mono leading-none">
                  {formatValue(currentValue)}
                </span>
              </div>
            </div>
          )}

          {/* Linha divisória no meio */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-black/80 z-20 transform -translate-y-0.5" />
          
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
      </div>
      
      <div className="text-xs md:text-sm font-semibold text-gold uppercase tracking-wider text-center">
        {label}
      </div>
    </div>
  );
};

export default FlipCountdown;