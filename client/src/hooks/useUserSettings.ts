import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { Tables, TablesInsert } from '../utils/supabase';
import { useToast } from './use-toast';

type ConfiguracaoUsuario = Tables<'configuracoes_usuario'>;
type ConfiguracaoUsuarioInsert = TablesInsert<'configuracoes_usuario'>;

export const useUserSettings = (userId?: string) => {
  const [settings, setSettings] = useState<ConfiguracaoUsuario[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar configurações do usuário
  const fetchSettings = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes_usuario')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      setSettings(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  // Criar ou atualizar configuração
  const updateSetting = async (logType: string, isActive: boolean, username: string, userProfile: string) => {
    if (!userId) return;

    try {
      // Verificar se já existe uma configuração para este tipo de log
      const { data: existingSetting } = await supabase
        .from('configuracoes_usuario')
        .select('*')
        .eq('user_id', userId)
        .eq('log_type', logType)
        .single();

      if (existingSetting) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracoes_usuario')
          .update({ 
            is_active: isActive,
            username: username,
            user_profile: userProfile,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSetting.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const newSetting: ConfiguracaoUsuarioInsert = {
          user_id: userId,
          username: username,
          user_profile: userProfile,
          log_type: logType,
          is_active: isActive
        };

        const { error } = await supabase
          .from('configuracoes_usuario')
          .insert([newSetting]);

        if (error) throw error;
      }

      // Atualizar lista local
      await fetchSettings();

      toast({
        title: "Sucesso",
        description: `Configuração ${isActive ? 'ativada' : 'desativada'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração",
        variant: "destructive",
      });
    }
  };

  // Verificar se uma configuração específica está ativa
  const isSettingActive = (logType: string): boolean => {
    const setting = settings.find(s => s.log_type === logType);
    return setting?.is_active || false;
  };

  // Buscar configurações quando o userId mudar
  useEffect(() => {
    if (userId) {
      fetchSettings();
    }
  }, [userId, fetchSettings]);

  return {
    settings,
    loading,
    fetchSettings,
    updateSetting,
    isSettingActive,
  };
}; 