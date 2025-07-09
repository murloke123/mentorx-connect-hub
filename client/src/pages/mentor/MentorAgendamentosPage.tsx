import AppointmentsList from "@/components/AppointmentsList";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MentorAgendamentosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentorName, setMentorName] = useState<string>('');
  const [refreshAppointments, setRefreshAppointments] = useState<number>(0);

  useEffect(() => {
    const loadMentorInfo = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao carregar informações do mentor:', error);
        } else if (data) {
          setMentorName(data.full_name || 'Mentor');
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar mentor:', err);
      }
    };

    loadMentorInfo();
  }, [user]);

  // Função para forçar atualização da lista de agendamentos
  const handleAppointmentChange = () => {
    console.log('🔄 [MentorAgendamentosPage] Forçando atualização da lista de agendamentos');
    setRefreshAppointments(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 transition-all duration-300 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header com título e botão */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Solicitações de Mentoria para Você</h1>
            <Button 
              onClick={() => navigate('/mentor/agendamentos-adquiridos')}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Agendamentos Adquiridos
            </Button>
          </div>
          
          {/* Lista de agendamentos */}
          {user?.id && (
            <AppointmentsList 
              mentorId={user.id} 
              refreshTrigger={refreshAppointments}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorAgendamentosPage; 