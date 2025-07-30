import { Trophy } from "lucide-react";

const BadgesSection = () => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-2xl border border-gold/20 shadow-lg hover:shadow-gold/20 transition-all duration-300 h-[300px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gold gradient-text">
          Brasões
        </h3>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        <Trophy className="h-12 w-12 text-gold/60" />
        <div className="text-center space-y-2">
          <p className="text-gold/80 font-medium">
            Brasões em desenvolvimento
          </p>
          <p className="text-sm text-gray-400">
            Sistema de conquistas em breve
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgesSection;
