import { useIsMobile } from '@/hooks/use-mobile';
import { Calendar, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import SchedulesModal from './SchedulesModal';

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
  price?: number;
}

interface MentorCalendarComponentProps {
  settings: CalendarSettings;
  className?: string;
  mentorId?: string;
  mentorName?: string;
  isClickable?: boolean;
  onAppointmentChange?: () => void;
  smallSquares?: boolean;
  smallSquaresProfile?: boolean;
}

const MentorCalendarComponent: React.FC<MentorCalendarComponentProps> = ({
  settings,
  className = "",
  mentorId,
  mentorName,
  isClickable = false,
  onAppointmentChange,
  smallSquares = false,
  smallSquaresProfile = false
}) => {
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0); // 0 = mês atual, 1 = próximo mês
  const [showLegend, setShowLegend] = useState(isMobile);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  
  // Calcular dados do calendário usando useMemo para garantir re-renderização
  const calendarData = useMemo(() => {
    // Obter data atual e aplicar offset do mês
    const now = new Date();
    
    // Calcular ano e mês do calendário a ser exibido
    const displayYear = now.getFullYear();
    const displayMonth = now.getMonth() + monthOffset;
    
    // Criar data do primeiro dia do mês sendo exibido
    const firstDayOfMonth = new Date(displayYear, displayMonth, 1);
    const currentYear = firstDayOfMonth.getFullYear();
    const currentMonth = firstDayOfMonth.getMonth();
    
    // Dados do dia atual (para comparações)
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    
    // Obter informações do mês sendo exibido
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = domingo, 1 = segunda, etc.
    
    // Nome do mês
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const currentMonthName = monthNames[currentMonth];

    // Criar array de dias para renderizar
    const calendarDays = [];
    
    // Debug: verificar valores
    console.log('🗓️ [Calendar Debug]:', {
      currentMonthName,
      currentYear,
      currentMonth,
      monthOffset,
      startingDayOfWeek,
      daysInMonth,
      firstDayOfMonth: firstDayOfMonth.toDateString()
    });
    
    // Adicionar espaços vazios para os dias antes do primeiro dia do mês
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      // Calcular o dia da semana corretamente para cada data específica
      const currentDayDate = new Date(currentYear, currentMonth, day);
      const dayOfWeek = currentDayDate.getDay(); // 0 = domingo, 1 = segunda, etc.
      calendarDays.push({ day, dayOfWeek });
    }

    return {
      currentYear,
      currentMonth,
      currentMonthName,
      todayDay,
      todayMonth,
      todayYear,
      daysInMonth,
      startingDayOfWeek,
      calendarDays
    };
  }, [monthOffset]); // Recalcular sempre que monthOffset mudar

  // useEffect para debug e forçar re-renderização
  useEffect(() => {
    console.log('🔄 [Calendar useEffect] monthOffset changed:', monthOffset);
    console.log('📅 [Calendar useEffect] calendarData updated:', {
      month: calendarData.currentMonthName,
      year: calendarData.currentYear,
      startingDay: calendarData.startingDayOfWeek
    });
  }, [monthOffset, calendarData]);

  const isWorkingDay = (dayOfWeek: number) => {
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return settings.workingDays.includes(dayKeys[dayOfWeek]);
  };

  // Função para avançar para o próximo mês
  const goToNextMonth = () => {
    console.log('➡️ [goToNextMonth] Current monthOffset:', monthOffset);
    if (monthOffset === 0) { // Só permite avançar se estiver no mês atual
      console.log('✅ [goToNextMonth] Advancing to next month');
      setMonthOffset(1);
    } else {
      console.log('❌ [goToNextMonth] Already at next month');
    }
  };

  // Função para voltar para o mês anterior
  const goToPreviousMonth = () => {
    console.log('⬅️ [goToPreviousMonth] Current monthOffset:', monthOffset);
    if (monthOffset === 1) { // Só permite voltar se estiver no próximo mês
      console.log('✅ [goToPreviousMonth] Going back to current month');
      setMonthOffset(0);
    } else {
      console.log('❌ [goToPreviousMonth] Already at current month');
    }
  };

  const handleDayClick = (day: number, dayOfWeek: number) => {
    if (!isClickable || !mentorId || !mentorName) return;
    
    // Verificar se é dia atual (considerando o mês sendo exibido)
    const isCurrentDay = day === calendarData.todayDay && calendarData.currentMonth === calendarData.todayMonth && calendarData.currentYear === calendarData.todayYear;
    
    // Verificar se é um dia passado (considerando o mês sendo exibido)
    const clickedDate = new Date(calendarData.currentYear, calendarData.currentMonth, day);
    const today = new Date(calendarData.todayYear, calendarData.todayMonth, calendarData.todayDay);
    const isPastDay = clickedDate < today;
    
    const isWorking = isWorkingDay(dayOfWeek);
    
    // Só permite clicar em dias disponíveis (que não sejam passados nem indisponíveis)
    // Permite clicar apenas no dia atual ou dias futuros
    if ((isWorking || isCurrentDay) && !isPastDay) {
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
        isCurrentDay,
        isPastDay,
        monthOffset
      });
      
      setSelectedDate(clickedDate);
      setShowDayModal(true);
    }
  };

  const getDayClass = (day: number, dayOfWeek: number) => {
    // Verificar se é dia atual (considerando o mês sendo exibido)
    const isCurrentDay = day === calendarData.todayDay && calendarData.currentMonth === calendarData.todayMonth && calendarData.currentYear === calendarData.todayYear;
    
    // Verificar se é um dia passado (considerando o mês sendo exibido)
    const clickedDate = new Date(calendarData.currentYear, calendarData.currentMonth, day);
    const today = new Date(calendarData.todayYear, calendarData.todayMonth, calendarData.todayDay);
    const isPastDay = clickedDate < today;
    
    const isWorking = isWorkingDay(dayOfWeek);
    
    const squareSize = smallSquares ? 'h-8 w-8 md:h-12 md:w-12' : smallSquaresProfile ? 'h-8 w-8 md:h-12 md:w-12' : 'h-8 w-8 md:h-14 md:w-14';
    const marginClass = smallSquaresProfile ? 'ml-2 md:ml-2' : 'ml-2 md:ml-4';
     let baseClass = `text-sm md:text-lg rounded-md md:rounded-xl transition-all duration-200 flex items-center justify-center ${squareSize} font-semibold ${marginClass}`;
    
    // Adicionar cursor pointer apenas para dias clicáveis (não passados)
    if (isClickable && mentorId && mentorName && (isWorking || isCurrentDay) && !isPastDay) {
      baseClass += ' cursor-pointer hover:scale-105 hover:shadow-md';
    }
    
    if (isCurrentDay) {
      return `${baseClass} bg-gold text-slate-900 hover:bg-gold-light shadow-lg ring-2 ring-gold/50`;
    } else if (isPastDay) {
      // Dias passados: mais claro, não clicável
      return `${baseClass} bg-slate-600/60 text-slate-300 cursor-not-allowed opacity-70 hover:scale-100 hover:shadow-none border border-slate-500/40`;
    } else if (!isWorking) {
      return `${baseClass} bg-red-900/30 text-red-400 border border-red-500/30 cursor-not-allowed hover:scale-100 hover:shadow-none`;
    } else {
      return `${baseClass} bg-slate-800/50 text-gold hover:bg-gold/10 border border-gold/30 hover:border-gold/50`;
    }
  };

  return (
    <>
      <div 
        key={`calendar-${monthOffset}`}
        className={`bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 rounded-2xl border border-gold/30 shadow-lg shadow-gold/10 hover:shadow-xl hover:shadow-gold/20 transition-all duration-300 h-[650px] flex flex-col max-w-[650px] mx-auto ${className}`}
      >
        {/* Cabeçalho com ícone, título e botão de navegação */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-gold" />
            <h3 className="text-2xl font-bold text-gold">
              {calendarData.currentMonthName} {calendarData.currentYear}
            </h3>
          </div>
          
          {/* Botão de navegação - seta direita no mês atual, seta esquerda no próximo mês */}
          {monthOffset === 0 ? (
            <button
              onClick={goToNextMonth}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 hover:bg-gold/20 text-gold hover:text-gold border border-gold/30 transition-all duration-200 hover:scale-105"
              title="Avançar para o próximo mês"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={goToPreviousMonth}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 hover:bg-gold/20 text-gold hover:text-gold border border-gold/30 transition-all duration-200 hover:scale-105"
              title="Voltar para o mês anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div key={`calendar-grid-${monthOffset}`} className="grid grid-cols-7 gap-x-2 gap-y-1 md:gap-3 flex-1">
          {/* Cabeçalho dos dias da semana */}
          {weekDays.map((day) => {
            const headerMarginClass = smallSquaresProfile ? 'ml-3 md:ml-2' : 'ml-3 md:ml-4';
            return (
              <div 
                key={day} 
                className={`font-bold text-sm text-gold/80 text-center h-6 flex items-center justify-center ${headerMarginClass}`}
              >
                {day}
              </div>
            );
          })}
          
          {/* Dias do mês */}
          {calendarData.calendarDays.map((dayInfo, index) => {
                          if (dayInfo === null) {
                // Espaço vazio para dias antes do primeiro dia do mês
                const emptySquareSize = smallSquares ? 'h-8 w-8 md:h-12 md:w-12' : smallSquaresProfile ? 'h-8 w-8 md:h-12 md:w-12' : 'h-8 w-8 md:h-14 md:w-14';
                const emptyMarginClass = smallSquaresProfile ? 'ml-3 md:ml-2' : 'ml-3 md:ml-4';
                return <div key={`empty-${monthOffset}-${index}`} className={`${emptySquareSize} ${emptyMarginClass}`}></div>;
              }
            
            const { day, dayOfWeek } = dayInfo;
            
            // Verificar se é dia atual (considerando o mês sendo exibido)
            const isCurrentDay = day === calendarData.todayDay && calendarData.currentMonth === calendarData.todayMonth && calendarData.currentYear === calendarData.todayYear;
            
            // Verificar se é um dia passado (considerando o mês sendo exibido)
            const clickedDate = new Date(calendarData.currentYear, calendarData.currentMonth, day);
            const today = new Date(calendarData.todayYear, calendarData.todayMonth, calendarData.todayDay);
            const isPastDay = clickedDate < today;
            
            const isWorking = isWorkingDay(dayOfWeek);
            
            return (
              <div 
                key={`day-${monthOffset}-${calendarData.currentMonth}-${day}`}
                className={getDayClass(day, dayOfWeek)}
                onClick={() => handleDayClick(day, dayOfWeek)}
                title={
                  isCurrentDay 
                    ? `Hoje - ${day}${isClickable ? ' (clique para ver agendamentos)' : ''}` 
                    : isPastDay
                      ? `Dia passado - ${day} (bloqueado)`
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
        
        {/* Botão para mostrar/ocultar legenda - oculto no mobile */}
        {!isMobile && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-gold/20 text-gold hover:text-gold border border-gold/30 rounded-lg transition-all duration-200 hover:scale-105"
              title={showLegend ? "Ocultar legenda" : "Mostrar legenda"}
            >
              <Info className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
              </span>
            </button>
          </div>
        )}

        {/* Legenda melhorada com padrão premium - sempre visível no mobile, condicional no desktop */}
        {(isMobile || showLegend) && (
          <div className="mt-4 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-gold/30 shadow-lg shadow-gold/10 animate-in slide-in-from-top-2 duration-300">
            <h4 className="text-sm font-semibold text-gold mb-3 text-center">Legenda</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gold rounded-lg shadow-sm ring-1 ring-gold/50"></div>
                <span className="text-sm font-medium text-gold/80">Hoje</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-800/50 border border-gold/30 rounded-lg"></div>
                <span className="text-sm font-medium text-gold/80">
                  Disponível{isClickable ? ' (clicável)' : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-4 h-4 bg-slate-600/60 border border-slate-500/40 rounded-lg opacity-70"></div>
                 <span className="text-sm font-medium text-gold/80">Dia passado (bloqueado)</span>
               </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-900/30 border border-red-500/30 rounded-lg"></div>
                <span className="text-sm font-medium text-gold/80">Indisponível</span>
              </div>
            </div>
          </div>
        )}
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