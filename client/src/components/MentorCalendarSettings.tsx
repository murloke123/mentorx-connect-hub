import { Calendar, Clock, DollarSign, Globe, Loader2, Settings } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';
import { detectUserTimezone, findTimezoneByValue, timezones } from '../utils/timezones';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CalendarSettings {
  workingDays: string[];
  startTime: string;
  endTime: string;
  sessionDuration: number;
  timezone: string;
  price?: number;
}

interface MentorCalendarSettingsProps {
  onSettingsChange: (settings: CalendarSettings) => void;
}

const MentorCalendarSettings: React.FC<MentorCalendarSettingsProps> = ({ onSettingsChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<CalendarSettings>({
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    startTime: '09:00',
    endTime: '18:00',
    sessionDuration: 60,
    timezone: detectUserTimezone(), // Detecta automaticamente o fuso horário local
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const weekDays = [
    { key: 'monday', label: 'Segunda' },
    { key: 'tuesday', label: 'Terça' },
    { key: 'wednesday', label: 'Quarta' },
    { key: 'thursday', label: 'Quinta' },
    { key: 'friday', label: 'Sexta' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  // Gerar opções de horário (6h às 22h, de 30 em 30 minutos)
  const timeOptions = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  const loadSettings = useCallback(async () => {
    if (!user || initialized) {
      console.log('❌ [loadSettings] Usuário não encontrado ou já inicializado');
      return;
    }

    console.log('🔄 [loadSettings] Iniciando carregamento das configurações...');
    console.log('👤 [loadSettings] User ID:', user.id);
    console.log('🌍 [loadSettings] Fuso horário detectado:', detectUserTimezone());

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calendarsettings')
        .select('*')
        .eq('mentor_id', user.id)
        .single();

      console.log('📊 [loadSettings] Resposta do Supabase:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ [loadSettings] Nenhuma configuração encontrada, usando padrões');
          // Nenhuma configuração encontrada, usar padrões
          const defaultSettings = {
            ...settings,
            timezone: detectUserTimezone() // Usar fuso horário detectado como padrão
          };
          setSettings(defaultSettings);
          onSettingsChange(defaultSettings);
        } else {
          console.error('❌ [loadSettings] Erro ao carregar configurações:', error);
          toast({
            title: "Erro ao carregar configurações",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        console.log('✅ [loadSettings] Configurações carregadas com sucesso:', data);
        
        // Converter horários do formato time (HH:MM:SS) para string (HH:MM)
        const formatTime = (timeString: string) => {
          if (!timeString) return null;
          // Se já está no formato HH:MM, retorna como está
          if (timeString.length === 5) return timeString;
          // Se está no formato HH:MM:SS, remove os segundos
          return timeString.substring(0, 5);
        };

        const loadedSettings = {
          workingDays: data.working_days || settings.workingDays,
          startTime: formatTime(data.start_time) || settings.startTime,
          endTime: formatTime(data.end_time) || settings.endTime,
          sessionDuration: data.session_duration || settings.sessionDuration,
          timezone: data.timezone || detectUserTimezone(),
          price: data.price || settings.price
        };
        
        console.log('🔄 [loadSettings] Configurações processadas:', loadedSettings);
        console.log('🕐 [loadSettings] Horários convertidos:', {
          start_time_raw: data.start_time,
          end_time_raw: data.end_time,
          start_time_formatted: loadedSettings.startTime,
          end_time_formatted: loadedSettings.endTime,
          timezone: loadedSettings.timezone
        });
        
        setSettings(loadedSettings);
        onSettingsChange(loadedSettings);
      }
    } catch (err) {
      console.error('💥 [loadSettings] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado ao carregar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('🏁 [loadSettings] Carregamento finalizado');
    }
  }, [user, initialized, settings, onSettingsChange, toast]);

  // Carregar configurações apenas uma vez quando o usuário estiver disponível
  useEffect(() => {
    if (user && !initialized) {
      loadSettings();
    }
  }, [user, initialized, loadSettings]);

  const saveSettings = async () => {
    if (!user) {
      console.log('❌ [saveSettings] Usuário não encontrado');
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 [saveSettings] Iniciando salvamento das configurações...');
    console.log('👤 [saveSettings] User ID:', user.id);
    console.log('⚙️ [saveSettings] Configurações a serem salvas:', settings);

    setSaving(true);
    try {
      // Buscar o full_name do mentor
      const { data: mentorData, error: mentorError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (mentorError) {
        console.error('❌ [saveSettings] Erro ao buscar dados do mentor:', mentorError);
        toast({
          title: "Erro ao salvar",
          description: "Erro ao buscar dados do mentor",
          variant: "destructive"
        });
        return;
      }

      // Preparar dados para o banco
      const dataToSave = {
        mentor_id: user.id,
        mentor_name: mentorData?.full_name || 'Nome não informado',
        working_days: settings.workingDays,
        start_time: settings.startTime,
        end_time: settings.endTime,
        session_duration: settings.sessionDuration,
        timezone: settings.timezone,
        price: settings.price,
        is_active: true
      };

      console.log('📝 [saveSettings] Dados preparados para o banco:', dataToSave);

      // Tentar upsert (insert ou update)
      const { data, error } = await supabase
        .from('calendarsettings')
        .upsert(dataToSave, {
          onConflict: 'mentor_id'
        })
        .select();

      console.log('📊 [saveSettings] Resposta do upsert:', { data, error });

      if (error) {
        console.error('❌ [saveSettings] Erro no upsert:', error);
        console.error('❌ [saveSettings] Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        toast({
          title: "Erro ao salvar",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ [saveSettings] Configurações salvas com sucesso:', data);
        toast({
          title: "Configurações salvas!",
          description: "Suas configurações foram atualizadas com sucesso."
        });
        // Não chamar onSettingsChange aqui para evitar re-render desnecessário
      }
    } catch (err) {
      console.error('💥 [saveSettings] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Erro inesperado ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      console.log('🏁 [saveSettings] Salvamento finalizado');
    }
  };

  const handleDayToggle = (dayKey: string, checked: boolean) => {
    console.log(`🔄 [handleDayToggle] Alternando dia: ${dayKey} = ${checked}`);
    const newWorkingDays = checked
      ? [...settings.workingDays, dayKey]
      : settings.workingDays.filter(day => day !== dayKey);
    
    console.log(`📅 [handleDayToggle] Novos dias de trabalho:`, newWorkingDays);
    const newSettings = { ...settings, workingDays: newWorkingDays };
    setSettings(newSettings);
    // Chamar onSettingsChange apenas se não estiver salvando
    if (!saving) {
      onSettingsChange(newSettings);
    }
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    console.log(`🕐 [handle${field}] Novo horário: ${value}`);
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    // Chamar onSettingsChange apenas se não estiver salvando
    if (!saving) {
      onSettingsChange(newSettings);
    }
  };

  const handleSessionDurationChange = (value: string) => {
    console.log(`⏱️ [handleSessionDuration] Nova duração: ${value} minutos`);
    const newSettings = { ...settings, sessionDuration: parseInt(value) };
    setSettings(newSettings);
    // Chamar onSettingsChange apenas se não estiver salvando
    if (!saving) {
      onSettingsChange(newSettings);
    }
  };

  const handleTimezoneChange = (value: string) => {
    console.log(`🌍 [handleTimezone] Novo fuso horário: ${value}`);
    const newSettings = { ...settings, timezone: value };
    setSettings(newSettings);
    // Chamar onSettingsChange apenas se não estiver salvando
    if (!saving) {
      onSettingsChange(newSettings);
    }
  };

  const handlePriceChange = (value: string) => {
    console.log(`💰 [handlePrice] Novo preço: ${value}`);
    const priceValue = value === '' ? 0 : parseFloat(value);
    const newSettings = { ...settings, price: priceValue };
    setSettings(newSettings);
    // Chamar onSettingsChange apenas se não estiver salvando
    if (!saving) {
      onSettingsChange(newSettings);
    }
  };

  const getSelectedDaysText = () => {
    const selectedDays = weekDays.filter(day => settings.workingDays.includes(day.key));
    if (selectedDays.length === 0) return 'Nenhum dia selecionado';
    if (selectedDays.length === 7) return 'Todos os dias';
    if (selectedDays.length <= 3) {
      return selectedDays.map(day => day.label).join(', ');
    }
    return `${selectedDays.slice(0, 2).map(day => day.label).join(', ')} e mais ${selectedDays.length - 2}`;
  };

  const getSelectedTimezoneLabel = () => {
    const selectedTimezone = findTimezoneByValue(settings.timezone);
    return selectedTimezone ? selectedTimezone.label : settings.timezone;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações de Disponibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dias da Semana */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Dias Disponíveis
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getSelectedDaysText()} />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                {weekDays.map((day) => (
                  <div key={day.key} className="flex items-center justify-between py-2">
                    <span className="text-sm">{day.label}</span>
                    <Checkbox
                      checked={settings.workingDays.includes(day.key)}
                      onCheckedChange={(checked) => handleDayToggle(day.key, checked as boolean)}
                    />
                  </div>
                ))}
              </div>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {getSelectedDaysText()}
          </p>
        </div>

        {/* Horários */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Início
            </label>
            <Select value={settings.startTime} onValueChange={(value) => handleTimeChange('startTime', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Fim
            </label>
            <Select value={settings.endTime} onValueChange={(value) => handleTimeChange('endTime', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Duração da Sessão */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Duração da Sessão (minutos)</label>
          <Select value={settings.sessionDuration.toString()} onValueChange={handleSessionDurationChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutos</SelectItem>
              <SelectItem value="60">60 minutos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fuso Horário */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Fuso Horário
          </label>
          <Select value={settings.timezone} onValueChange={handleTimezoneChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione seu fuso horário" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Detectado automaticamente: {getSelectedTimezoneLabel()}
          </p>
        </div>

        {/* Valor do Agendamento */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Valor do Agendamento (R$)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={settings.price || ''}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Defina o valor que será cobrado por cada agendamento (opcional)
          </p>
        </div>

        {/* Botão Salvar */}
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white border-none"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MentorCalendarSettings; 