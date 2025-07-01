
import React from 'react';

interface TestimonialCardProps {
  name: string;
  profession: string;
  content: string;
  rating: number;
}

const TestimonialCard = ({ name, profession, content, rating }: TestimonialCardProps) => {
  const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
      ⭐
    </span>
  ));

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-orange-500">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600">{profession}</p>
        </div>
      </div>
      
      <div className="flex space-x-1 mb-3">
        {stars}
      </div>
      
      <p className="text-gray-700 italic">"{content}"</p>
    </div>
  );
};

export default TestimonialCard;
