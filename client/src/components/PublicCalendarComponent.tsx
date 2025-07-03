import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import React from 'react';

interface PublicCalendarComponentProps {
  title?: string;
  buttonText?: string;
  onScheduleClick?: () => void;
  className?: string;
}

const PublicCalendarComponent: React.FC<PublicCalendarComponentProps> = ({
  title = "Agenda uma Conversa",
  buttonText = "Agendar Agora",
  onScheduleClick,
  className = ""
}) => {
  const schedules = [
    "Segunda a Sexta: 09:00 - 18:00",
    "Sábado: 09:00 - 12:00", 
    "Domingo: Não atendo"
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
  // Obter data atual
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  
  // Obter informações do mês atual
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = domingo, 1 = segunda, etc.
  
  // Nome do mês
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const currentMonthName = monthNames[currentMonth];

  const handleScheduleClick = () => {
    if (onScheduleClick) {
      onScheduleClick();
    } else {
      // Ação padrão - pode ser redirecionamento para página de agendamento
      console.log('Agendamento solicitado');
    }
  };

  const getDayClass = (day: number, dayOfWeek: number) => {
    const isCurrentDay = day === currentDay;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Domingo ou Sábado
    const isSunday = dayOfWeek === 0; // Domingo (indisponível)
    
    let baseClass = 'text-sm rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center h-10 w-10 font-medium hover:scale-105';
    
    if (isCurrentDay) {
      return `${baseClass} bg-blue-500 text-white font-bold hover:bg-blue-600 shadow-md`;
    } else if (isSunday) {
      return `${baseClass} bg-red-100 text-red-600 cursor-not-allowed hover:scale-100`;
    } else if (isWeekend) {
      return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`;
    } else {
      return `${baseClass} bg-white text-gray-800 hover:bg-purple-200 border border-gray-200 hover:border-purple-300`;
    }
  };

  // Criar array de dias para renderizar
  const calendarDays = [];
  
  // Adicionar espaços vazios para os dias antes do primeiro dia do mês
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Adicionar todos os dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
    calendarDays.push({ day, dayOfWeek });
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 border ${className}`}>
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        {title}
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Lado esquerdo - Horários disponíveis */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Horários Disponíveis</h3>
          
          <div className="space-y-3">
            {schedules.map((schedule, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">{schedule}</span>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleScheduleClick}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 rounded-lg transition-all duration-200"
          >
            {buttonText}
          </Button>
        </div>
        
        {/* Lado direito - Calendário do mês */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-800 text-center">
            {currentMonthName} {currentYear}
          </h3>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Cabeçalho dos dias da semana */}
            {weekDays.map((day) => (
              <div 
                key={day} 
                className="font-semibold text-sm py-3 text-gray-600 text-center h-10 flex items-center justify-center -ml-4"
              >
                {day}
              </div>
            ))}
            
            {/* Dias do mês */}
            {calendarDays.map((dayInfo, index) => {
              if (dayInfo === null) {
                // Espaço vazio para dias antes do primeiro dia do mês
                return <div key={index} className="h-10 w-10"></div>;
              }
              
              const { day, dayOfWeek } = dayInfo;
              const isCurrentDay = day === currentDay;
              const isSunday = dayOfWeek === 0;
              
              return (
                <div 
                  key={day} 
                  className={getDayClass(day, dayOfWeek)}
                  title={
                    isCurrentDay 
                      ? `Hoje - ${day}` 
                      : isSunday 
                        ? `Indisponível - ${day}` 
                        : `Clique para agendar - ${day}`
                  }
                >
                  {day}
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 text-xs text-gray-600">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-md shadow-sm"></div>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white border border-gray-300 rounded-md"></div>
                <span>Disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-200 rounded-md"></div>
                <span>Fim de semana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-md"></div>
                <span>Indisponível</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCalendarComponent; 