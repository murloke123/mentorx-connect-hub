interface LoadingComponentProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'full-screen';
}

const LoadingComponent = ({ 
  message = "Carregando Dados", 
  size = 'md',
  variant = 'default'
}: LoadingComponentProps) => {
  
  const sizeClasses = {
    sm: {
      container: 'w-12 h-12',
      dots: 'w-1.5 h-1.5',
      text: 'text-sm'
    },
    md: {
      container: 'w-16 h-16',
      dots: 'w-2 h-2',
      text: 'text-lg'
    },
    lg: {
      container: 'w-20 h-20',
      dots: 'w-2.5 h-2.5',
      text: 'text-xl'
    }
  };

  const currentSize = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className={`${currentSize.container} border-4 border-gold/20 border-t-gold rounded-full animate-spin`}></div>
        <span className={`${currentSize.text} font-medium text-foreground`}>{message}</span>
      </div>
    );
  }

  if (variant === 'full-screen') {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-slate-800 rounded-lg p-8 shadow-xl border border-gold/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className={`${currentSize.container} border-4 border-gold/20 border-t-gold rounded-full animate-spin`}></div>
              <div className={`absolute inset-0 ${currentSize.container} border-4 border-transparent border-t-gold/60 rounded-full animate-spin`} 
                   style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-center">
              <p className={`${currentSize.text} font-medium text-foreground mb-2`}>{message}</p>
              <div className="flex items-center justify-center space-x-1">
                <div className={`${currentSize.dots} bg-gold rounded-full animate-bounce`}></div>
                <div className={`${currentSize.dots} bg-gold rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
                <div className={`${currentSize.dots} bg-gold rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant 'default'
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className={`${currentSize.container} border-4 border-gold/20 border-t-gold rounded-full animate-spin`}></div>
          <div className={`absolute inset-0 ${currentSize.container} border-4 border-transparent border-t-gold/60 rounded-full animate-spin`} 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <div className="text-center">
          <p className={`${currentSize.text} font-medium text-foreground mb-2`}>{message}</p>
          <div className="flex items-center justify-center space-x-1">
            <div className={`${currentSize.dots} bg-gold rounded-full animate-bounce`}></div>
            <div className={`${currentSize.dots} bg-gold rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }}></div>
            <div className={`${currentSize.dots} bg-gold rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingComponent;