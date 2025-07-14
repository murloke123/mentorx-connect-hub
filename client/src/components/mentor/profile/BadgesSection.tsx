import { Trophy } from "lucide-react";

const BadgesSection = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 border border-gray-700 mt-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-3 rounded-xl shadow-lg mr-3 transform hover:scale-105 transition-transform duration-200">
            <Trophy className="w-6 h-6 text-white drop-shadow-sm" />
          </div>
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

      {/* Placeholder for future badges */}
      <div className="flex justify-center items-center py-8">
        <div className="text-center text-gray-400">
          <p className="text-sm">Brasões em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
};

export default BadgesSection;
