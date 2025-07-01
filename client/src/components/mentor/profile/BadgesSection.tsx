import React from "react";

const BadgesSection = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-700 mt-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/src/assets/icons/trophy.png" 
            alt="Troféu" 
            className="w-8 h-8 mr-3"
          />
          <h5 className="text-lg font-bold text-white">
            Brasões do Mentor
          </h5>
        </div>
        <p className="text-white leading-relaxed text-center" style={{ 
          fontSize: '16px', 
          fontFamily: 'sans-serif'
        }}>
          Após esse mentor conquistar esses <span className="text-white font-semibold">três Brasões</span>, 
          seus seguidores terão <span className="text-white font-semibold">descontos automaticamente</span>. 
          <br /><br />
          Não deixe para seguir tarde, pois você poderá <span className="text-white font-semibold">perder esses descontos e promoções futuras</span>!
        </p>
      </div>

      {/* Badges Container */}
      <div className="flex justify-center items-center">
        <div className="relative">
          {/* Badge Image - Aumentado mais 20% e subido 50px */}
          <div className="w-58 h-58 mx-auto" style={{ transform: 'translateY(-50px)' }}>
            <img 
              src="/src/assets/images/brasoessemfundo.png"
              alt="Brasões do Mentor"
              className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              style={{ 
                imageRendering: 'crisp-edges',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
                transform: 'perspective(1000px) rotateX(5deg)',
                width: '230px',
                height: '230px'
              }}
            />
          </div>
          
          {/* Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BadgesSection;
