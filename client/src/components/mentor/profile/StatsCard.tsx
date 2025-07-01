
import React from 'react';

interface StatsCardProps {
  value: string;
  label: string;
  icon: string;
}

const StatsCard = ({ value, label, icon }: StatsCardProps) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{icon}</div>
        <div>
          <div className="text-xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
