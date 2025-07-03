// Lista de fusos horários organizados por região
export const timezones = [
  // Brasil
  { value: 'America/Sao_Paulo', label: 'Brasil (Brasília) - UTC-3', region: 'Brasil' },
  { value: 'America/Manaus', label: 'Brasil (Manaus) - UTC-4', region: 'Brasil' },
  { value: 'America/Rio_Branco', label: 'Brasil (Acre) - UTC-5', region: 'Brasil' },
  { value: 'America/Noronha', label: 'Brasil (Fernando de Noronha) - UTC-2', region: 'Brasil' },
  
  // Portugal
  { value: 'Europe/Lisbon', label: 'Portugal (Lisboa) - UTC+0/+1', region: 'Portugal' },
  { value: 'Atlantic/Madeira', label: 'Portugal (Madeira) - UTC+0/+1', region: 'Portugal' },
  { value: 'Atlantic/Azores', label: 'Portugal (Açores) - UTC-1/+0', region: 'Portugal' },
  
  // Irlanda
  { value: 'Europe/Dublin', label: 'Irlanda (Dublin) - UTC+0/+1', region: 'Irlanda' },
  
  // Reino Unido
  { value: 'Europe/London', label: 'Reino Unido (Londres) - UTC+0/+1', region: 'Reino Unido' },
  
  // Estados Unidos (principais)
  { value: 'America/New_York', label: 'EUA (Nova York) - UTC-5/-4', region: 'Estados Unidos' },
  { value: 'America/Chicago', label: 'EUA (Chicago) - UTC-6/-5', region: 'Estados Unidos' },
  { value: 'America/Denver', label: 'EUA (Denver) - UTC-7/-6', region: 'Estados Unidos' },
  { value: 'America/Los_Angeles', label: 'EUA (Los Angeles) - UTC-8/-7', region: 'Estados Unidos' },
  
  // Canadá
  { value: 'America/Toronto', label: 'Canadá (Toronto) - UTC-5/-4', region: 'Canadá' },
  { value: 'America/Vancouver', label: 'Canadá (Vancouver) - UTC-8/-7', region: 'Canadá' },
  
  // França
  { value: 'Europe/Paris', label: 'França (Paris) - UTC+1/+2', region: 'França' },
  
  // Alemanha
  { value: 'Europe/Berlin', label: 'Alemanha (Berlim) - UTC+1/+2', region: 'Alemanha' },
  
  // Espanha
  { value: 'Europe/Madrid', label: 'Espanha (Madrid) - UTC+1/+2', region: 'Espanha' },
  
  // Itália
  { value: 'Europe/Rome', label: 'Itália (Roma) - UTC+1/+2', region: 'Itália' },
  
  // Holanda
  { value: 'Europe/Amsterdam', label: 'Holanda (Amsterdam) - UTC+1/+2', region: 'Holanda' },
  
  // Argentina
  { value: 'America/Argentina/Buenos_Aires', label: 'Argentina (Buenos Aires) - UTC-3', region: 'Argentina' },
  
  // México
  { value: 'America/Mexico_City', label: 'México (Cidade do México) - UTC-6/-5', region: 'México' },
  
  // Japão
  { value: 'Asia/Tokyo', label: 'Japão (Tóquio) - UTC+9', region: 'Japão' },
  
  // Austrália
  { value: 'Australia/Sydney', label: 'Austrália (Sydney) - UTC+10/+11', region: 'Austrália' },
  { value: 'Australia/Melbourne', label: 'Austrália (Melbourne) - UTC+10/+11', region: 'Austrália' },
  
  // Outros importantes
  { value: 'UTC', label: 'UTC (Tempo Universal Coordenado)', region: 'Universal' },
];

/**
 * Detecta o fuso horário local do usuário
 */
export const detectUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Não foi possível detectar o fuso horário automaticamente:', error);
    return 'America/Sao_Paulo'; // Fallback para Brasil
  }
};

/**
 * Encontra o fuso horário na lista baseado no valor detectado
 */
export const findTimezoneByValue = (timezoneValue: string) => {
  return timezones.find(tz => tz.value === timezoneValue) || timezones[0];
};

/**
 * Formata uma data considerando o fuso horário
 */
export const formatDateInTimezone = (date: Date, timezone: string): string => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch (error) {
    console.warn('Erro ao formatar data no fuso horário:', error);
    return date.toLocaleString('pt-BR');
  }
};

/**
 * Obter offset do fuso horário em relação ao UTC
 */
export const getTimezoneOffset = (timezone: string): string => {
  try {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    const diff = targetTime.getTime() - utc.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const sign = hours >= 0 ? '+' : '-';
    const hoursStr = Math.abs(hours).toString().padStart(2, '0');
    const minutesStr = Math.abs(minutes).toString().padStart(2, '0');
    
    return `UTC${sign}${hoursStr}:${minutesStr}`;
  } catch (error) {
    console.warn('Erro ao calcular offset do fuso horário:', error);
    return 'UTC+00:00';
  }
}; 