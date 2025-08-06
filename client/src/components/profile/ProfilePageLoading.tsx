
const ProfilePageLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background com partículas douradas */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90"></div>
        
        {/* Partículas douradas animadas */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Conteúdo do loading */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Círculo de loading dourado */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-slate-600 rounded-full"></div>
          <div className="absolute top-0 left-0 w-20 h-20 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Texto personalizado */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gold">Carregando seu perfil</h2>
          <p className="text-gray-300 max-w-md">
            Preparando suas informações pessoais e configurações...
          </p>
        </div>

        {/* Pontos de loading animados */}
        <div className="flex space-x-2 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gold rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Estilos CSS para animações */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePageLoading;