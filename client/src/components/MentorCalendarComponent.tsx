import { Calendar } from 'lucide-react';
import React, { useState } from 'react';
import SchedulesModal from './SchedulesModal';

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
}

interface MentorCalendarComponentProps {
  settings: CalendarSettings;
  className?: string;
  mentorId?: string;
  mentorName?: string;
  isClickable?: boolean;
  onAppointmentChange?: () => void;
}

const MentorCalendarComponent: React.FC<MentorCalendarComponentProps> = ({
  settings,
  className = "",
  mentorId,
  mentorName,
  isClickable = false,
  onAppointmentChange
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

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

  const isWorkingDay = (dayOfWeek: number) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return settings.workingDays.includes(dayKeys[dayOfWeek]);
  };

  const handleDayClick = (day: number, dayOfWeek: number) => {
    if (!isClickable || !mentorId || !mentorName) return;
    
    const isCurrentDay = day === currentDay;
    const isWorking = isWorkingDay(dayOfWeek);
    
    // Só permite clicar em dias disponíveis (que não sejam indisponíveis)
    if (isWorking || isCurrentDay) {
      const clickedDate = new Date(currentYear, currentMonth, day);
      
      // Função para formatar data local sem problemas de fuso horário
      const formatDateForDatabase = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      console.log('📅 [handleDayClick] Dia clicado:', {
        clickedDay: day,
        clickedDate: clickedDate,
        formattedDate: formatDateForDatabase(clickedDate),
        isoString: clickedDate.toISOString(),
        isoSplit: clickedDate.toISOString().split('T')[0],
        isWorking,
        isCurrentDay
      });
      
      setSelectedDate(clickedDate);
      setShowDayModal(true);
    }
  };

  const getDayClass = (day: number, dayOfWeek: number) => {
    const isCurrentDay = day === currentDay;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Domingo ou Sábado
    const isWorking = isWorkingDay(dayOfWeek);
    
    let baseClass = 'text-base rounded-xl transition-all duration-200 flex items-center justify-center h-12 w-12 font-semibold';
    
    // Adicionar cursor pointer apenas para dias clicáveis
    if (isClickable && mentorId && mentorName && (isWorking || isCurrentDay)) {
      baseClass += ' cursor-pointer hover:scale-105 hover:shadow-md';
    }
    
    if (isCurrentDay) {
      return `${baseClass} bg-blue-500 text-white hover:bg-blue-600 shadow-lg ring-2 ring-blue-200`;
    } else if (!isWorking) {
      return `${baseClass} bg-red-100 text-red-600 cursor-not-allowed hover:scale-100 hover:shadow-none`;
    } else if (isWeekend && isWorking) {
      return `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`;
    } else {
      return `${baseClass} bg-white text-gray-800 hover:bg-purple-100 border-2 border-gray-200 hover:border-purple-300`;
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
    <>
      <div className={`bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl border border-purple-200 shadow-sm ${className}`}>
        {/* Cabeçalho com ícone e título */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Calendar className="h-6 w-6 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-800">
            {currentMonthName} {currentYear}
          </h3>
        </div>
        
        <div className="grid grid-cols-7 gap-3">
          {/* Cabeçalho dos dias da semana */}
          {weekDays.map((day) => (
            <div 
              key={day} 
              className="font-bold text-sm text-gray-600 text-center h-8 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
          
          {/* Dias do mês */}
          {calendarDays.map((dayInfo, index) => {
            if (dayInfo === null) {
              // Espaço vazio para dias antes do primeiro dia do mês
              return <div key={index} className="h-12 w-12"></div>;
            }
            
            const { day, dayOfWeek } = dayInfo;
            const isCurrentDay = day === currentDay;
            const isWorking = isWorkingDay(dayOfWeek);
            
            return (
              <div 
                key={day} 
                className={getDayClass(day, dayOfWeek)}
                onClick={() => handleDayClick(day, dayOfWeek)}
                title={
                  isCurrentDay 
                    ? `Hoje - ${day}${isClickable ? ' (clique para ver agendamentos)' : ''}` 
                    : !isWorking 
                      ? `Indisponível - ${day}` 
                      : `Disponível - ${day}${isClickable ? ' (clique para ver agendamentos)' : ''}`
                }
              >
                {day}
              </div>
            );
          })}
        </div>
        
        {/* Legenda melhorada */}
        <div className="mt-8 p-4 bg-white/50 rounded-xl border border-purple-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">Legenda</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded-lg shadow-sm ring-1 ring-blue-200"></div>
              <span className="text-sm font-medium text-gray-700">Hoje</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded-lg"></div>
              <span className="text-sm font-medium text-gray-700">
                Disponível{isClickable ? ' (clicável)' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-200 rounded-lg"></div>
              <span className="text-sm font-medium text-gray-700">Fim de semana</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-lg"></div>
              <span className="text-sm font-medium text-gray-700">Indisponível</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de agendamentos do dia */}
      {selectedDate && mentorId && mentorName && (
        <SchedulesModal
          isOpen={showDayModal}
          onClose={() => setShowDayModal(false)}
          selectedDate={selectedDate}
          mentorId={mentorId}
          mentorName={mentorName}
          settings={settings}
          onAppointmentChange={onAppointmentChange}
        />
      )}
    </>
  );
};

export default MentorCalendarComponent; 