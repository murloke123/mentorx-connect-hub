// Função para detectar o país do usuário automaticamente
export const detectUserCountry = async (): Promise<string> => {
  try {
    // Primeiro, tenta usar a API de geolocalização do navegador
    if ('geolocation' in navigator) {
      // Tenta detectar pelo timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryFromTimezone = getCountryFromTimezone(timezone);
      if (countryFromTimezone) {
        return countryFromTimezone;
      }
    }

    // Fallback: tenta detectar pelo locale do navegador
    const locale = navigator.language || navigator.languages?.[0];
    if (locale) {
      const countryFromLocale = getCountryFromLocale(locale);
      if (countryFromLocale) {
        return countryFromLocale;
      }
    }

    // Se nada funcionar, usa uma API externa gratuita
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data.country_code) {
        return getCountryCodeFromISO(data.country_code);
      }
    } catch (error) {
      console.warn('Erro ao detectar país via API externa:', error);
    }

    // Último fallback: Brasil
    return '+55';
  } catch (error) {
    console.warn('Erro na detecção automática de país:', error);
    return '+55';
  }
};

// Mapeia timezone para código de país
const getCountryFromTimezone = (timezone: string): string | null => {
  const timezoneToCountry: Record<string, string> = {
    'America/Sao_Paulo': '+55',
    'America/Fortaleza': '+55',
    'America/Recife': '+55',
    'America/Bahia': '+55',
    'America/Manaus': '+55',
    'America/Campo_Grande': '+55',
    'America/Cuiaba': '+55',
    'America/Porto_Velho': '+55',
    'America/Boa_Vista': '+55',
    'America/Rio_Branco': '+55',
    'America/Araguaina': '+55',
    'America/Belem': '+55',
    'America/Maceio': '+55',
    'America/Noronha': '+55',
    'America/Santarem': '+55',
    'America/New_York': '+1',
    'America/Los_Angeles': '+1',
    'America/Chicago': '+1',
    'America/Denver': '+1',
    'Europe/London': '+44',
    'Europe/Paris': '+33',
    'Europe/Berlin': '+49',
    'Europe/Madrid': '+34',
    'Europe/Rome': '+39',
    'Europe/Amsterdam': '+31',
    'Europe/Brussels': '+32',
    'Europe/Vienna': '+43',
    'Europe/Zurich': '+41',
    'Europe/Stockholm': '+46',
    'Europe/Oslo': '+47',
    'Europe/Copenhagen': '+45',
    'Europe/Helsinki': '+358',
    'Europe/Warsaw': '+48',
    'Europe/Prague': '+420',
    'Europe/Budapest': '+36',
    'Europe/Bucharest': '+40',
    'Europe/Sofia': '+359',
    'Europe/Athens': '+30',
    'Europe/Istanbul': '+90',
    'Europe/Moscow': '+7',
    'Asia/Tokyo': '+81',
    'Asia/Shanghai': '+86',
    'Asia/Seoul': '+82',
    'Asia/Kolkata': '+91',
    'Asia/Dubai': '+971',
    'Asia/Singapore': '+65',
    'Asia/Bangkok': '+66',
    'Asia/Jakarta': '+62',
    'Asia/Manila': '+63',
    'Australia/Sydney': '+61',
    'Australia/Melbourne': '+61',
    'America/Mexico_City': '+52',
    'America/Buenos_Aires': '+54',
    'America/Lima': '+51',
    'America/Bogota': '+57',
    'America/Santiago': '+56',
    'America/Caracas': '+58',
    'Africa/Cairo': '+20',
    'Africa/Lagos': '+234',
    'Africa/Johannesburg': '+27',
  };

  return timezoneToCountry[timezone] || null;
};

// Mapeia locale para código de país
const getCountryFromLocale = (locale: string): string | null => {
  const localeToCountry: Record<string, string> = {
    'pt-BR': '+55',
    'pt': '+55',
    'en-US': '+1',
    'en-GB': '+44',
    'en-CA': '+1',
    'en-AU': '+61',
    'es-ES': '+34',
    'es-MX': '+52',
    'es-AR': '+54',
    'es-CL': '+56',
    'es-CO': '+57',
    'es-PE': '+51',
    'es-VE': '+58',
    'fr-FR': '+33',
    'fr-CA': '+1',
    'de-DE': '+49',
    'it-IT': '+39',
    'nl-NL': '+31',
    'ru-RU': '+7',
    'ja-JP': '+81',
    'ko-KR': '+82',
    'zh-CN': '+86',
    'zh-TW': '+886',
    'hi-IN': '+91',
    'ar-SA': '+966',
    'tr-TR': '+90',
  };

  // Tenta primeiro com o locale completo
  if (localeToCountry[locale]) {
    return localeToCountry[locale];
  }

  // Tenta com apenas o código do idioma
  const languageCode = locale.split('-')[0];
  const languageToCountry: Record<string, string> = {
    'pt': '+55',
    'en': '+1',
    'es': '+34',
    'fr': '+33',
    'de': '+49',
    'it': '+39',
    'ru': '+7',
    'ja': '+81',
    'ko': '+82',
    'zh': '+86',
    'hi': '+91',
    'ar': '+966',
    'tr': '+90',
  };

  return languageToCountry[languageCode] || null;
};

// Converte código ISO do país para código de telefone
const getCountryCodeFromISO = (isoCode: string): string => {
  const isoToPhone: Record<string, string> = {
    'BR': '+55',
    'US': '+1',
    'CA': '+1',
    'GB': '+44',
    'AU': '+61',
    'ES': '+34',
    'MX': '+52',
    'AR': '+54',
    'CL': '+56',
    'CO': '+57',
    'PE': '+51',
    'VE': '+58',
    'FR': '+33',
    'DE': '+49',
    'IT': '+39',
    'NL': '+31',
    'RU': '+7',
    'JP': '+81',
    'KR': '+82',
    'CN': '+86',
    'TW': '+886',
    'IN': '+91',
    'SA': '+966',
    'TR': '+90',
    'EG': '+20',
    'NG': '+234',
    'ZA': '+27',
    'AE': '+971',
    'SG': '+65',
    'TH': '+66',
    'ID': '+62',
    'PH': '+63',
    'MY': '+60',
    'VN': '+84',
    'BD': '+880',
    'PK': '+92',
    'IR': '+98',
    'IQ': '+964',
    'IL': '+972',
    'JO': '+962',
    'LB': '+961',
    'SY': '+963',
    'KW': '+965',
    'QA': '+974',
    'BH': '+973',
    'OM': '+968',
    'YE': '+967',
  };

  return isoToPhone[isoCode.toUpperCase()] || '+55';
};