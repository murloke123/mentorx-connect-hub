import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    Filter,
    MessageSquare,
    Search,
    Trash2,
    X,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../utils/supabase';
import CancelAppointmentModal from './CancelAppointmentModal';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Appointment {
  id: string;
  mentee_id: string;
  mentee_name: string;
  mentor_id: string;
  mentor_name: string;
  mentee_role: 'admin' | 'mentor' | 'mentorado';
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface AppointmentsListProps {
  mentorId?: string;
  refreshTrigger?: number;
  showAcquiredOnly?: boolean;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ mentorId, refreshTrigger, showAcquiredOnly = false }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [activeCardFilter, setActiveCardFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Formatar horário
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Verificar se é hoje (usando data local)
  const isToday = (dateString: string) => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return dateString === todayFormatted;
  };

  // Verificar se é futuro (usando data local)
  const isFuture = (dateString: string) => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return dateString > todayFormatted;
  };

  // Verificar se é passado (usando data local)
  const isPast = (dateString: string) => {
    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return dateString < todayFormatted;
  };

  // Carregar agendamentos
  const loadAppointments = async () => {
    const userId = mentorId || user?.id;
    if (!userId) return;

    console.log('🔄 [loadAppointments] Carregando agendamentos do usuário:', {
      userId,
      mentorId,
      userFromAuth: user?.id,
      showAcquiredOnly
    });
    setLoading(true);
    
    try {
      // Se showAcquiredOnly for true, busca agendamentos onde o userId é o mentee_id
      // Caso contrário, busca agendamentos onde o userId é o mentor_id (comportamento padrão)
      const { data, error } = await supabase
        .from('calendar')
        .select('*')
        .eq(showAcquiredOnly ? 'mentee_id' : 'mentor_id', userId)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ [loadAppointments] Erro:', error);
        toast({
          title: "Erro ao carregar agendamentos",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ [loadAppointments] Agendamentos carregados:', data);
        setAppointments(data || []);
      }
    } catch (err) {
      console.error('💥 [loadAppointments] Erro inesperado:', err);
      toast({
        title: "Erro inesperado",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...appointments];

    // Filtro por texto (dinâmico baseado no showAcquiredOnly)
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const nameToSearch = showAcquiredOnly ? apt.mentor_name : apt.mentee_name;
        return nameToSearch.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Filtro por data
    if (dateFilter === 'today') {
      filtered = filtered.filter(apt => isToday(apt.scheduled_date));
    } else if (dateFilter === 'future') {
      filtered = filtered.filter(apt => isFuture(apt.scheduled_date));
    } else if (dateFilter === 'past') {
      filtered = filtered.filter(apt => isPast(apt.scheduled_date));
    } else if (dateFilter === 'cancelled') {
      filtered = filtered.filter(apt => apt.status === 'cancelled');
    } else if (dateFilter === 'completed') {
      filtered = filtered.filter(apt => apt.status === 'completed');
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter, dateFilter]);

  // Carregar agendamentos quando o componente montar ou quando refreshTrigger mudar
  useEffect(() => {
    const userId = mentorId || user?.id;
    if (userId) {
      loadAppointments();
    }
  }, [mentorId, user?.id, refreshTrigger, showAcquiredOnly]);

  // Obter estatísticas
  const getStats = () => {
    // Debug: verificar data atual
    const currentDate = new Date();
    const todayFormatted = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
    
    console.log('📊 [getStats] Debug:', {
      todayFormatted,
      appointments: appointments.map(apt => ({
        name: apt.mentee_name,
        date: apt.scheduled_date,
        status: apt.status,
        isPast: isPast(apt.scheduled_date),
        isToday: isToday(apt.scheduled_date),
        isFuture: isFuture(apt.scheduled_date)
      }))
    });

    // Contar baseado apenas na data (independente do status)
    const past = appointments.filter(apt => isPast(apt.scheduled_date)).length;
    const todayCount = appointments.filter(apt => isToday(apt.scheduled_date)).length;
    const future = appointments.filter(apt => isFuture(apt.scheduled_date)).length;
    
    // Contar baseado apenas no status
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;

    console.log('📊 [getStats] Contagens:', { past, today: todayCount, future, cancelled, completed });

    return { past, today: todayCount, future, cancelled, completed };
  };

  const stats = getStats();

  // ============= TAGS TEMPORAIS (baseadas na data) =============
  const getTemporalCategory = (appointment: Appointment) => {
    if (isToday(appointment.scheduled_date)) {
      return 'today';
    } else if (isPast(appointment.scheduled_date)) {
      return 'past';
    } else if (isFuture(appointment.scheduled_date)) {
      return 'future';
    }
    return 'today'; // fallback
  };

  const getTemporalColor = (category: string) => {
    switch (category) {
      case 'past':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'today':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'future':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTemporalIcon = (category: string) => {
    switch (category) {
      case 'past':
        return <Clock className="h-4 w-4" />;
      case 'today':
        return <Calendar className="h-4 w-4" />;
      case 'future':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTemporalText = (category: string) => {
    switch (category) {
      case 'past':
        return 'Passado';
      case 'today':
        return 'Hoje';
      case 'future':
        return 'Futuro';
      default:
        return 'Hoje';
    }
  };

  // ============= TAGS DE STATUS (baseadas no campo status) =============
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Agendado';
    }
  };

  // Função para lidar com clique nos cards de filtro
  const handleCardClick = (filterType: string) => {
    if (filterType === 'all') {
      // Sempre ativa o filtro "all" quando clicado
      setActiveCardFilter('all');
      setDateFilter('all');
    } else if (activeCardFilter === filterType) {
      // Se já está ativo, desativa o filtro (volta para "all")
      setActiveCardFilter('all');
      setDateFilter('all');
    } else {
      // Ativa o novo filtro
      setActiveCardFilter(filterType);
      setDateFilter(filterType);
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
    loadAppointments(); // Recarregar agendamentos
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
{showAcquiredOnly ? 'Meus Agendamentos' : 'Minhas Mentorias Agendadas'}
          </CardTitle>
          <Button
            variant={activeCardFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCardClick('all')}
            className={`transition-all font-semibold ${
              activeCardFilter === 'all' 
                ? 'bg-white hover:bg-gray-50 text-gray-700 shadow-md border-gray-300' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            Todos Agendamentos ({appointments.length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-5 gap-4">
          {/* Card Passados */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              activeCardFilter === 'past' 
                ? 'bg-white border-orange-400 shadow-md' 
                : 'bg-white border-gray-200 hover:border-orange-300'
            }`}
            onClick={() => handleCardClick('past')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Passados</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{stats.past}</p>
            </div>
          </div>
          
          {/* Card Hoje */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              activeCardFilter === 'today' 
                ? 'bg-white border-blue-400 shadow-md' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleCardClick('today')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Hoje</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{stats.today}</p>
            </div>
          </div>
          
          {/* Card Futuros */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              activeCardFilter === 'future' 
                ? 'bg-white border-purple-400 shadow-md' 
                : 'bg-white border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => handleCardClick('future')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Futuros</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">{stats.future}</p>
            </div>
          </div>
          
          {/* Card Concluídos */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              activeCardFilter === 'completed' 
                ? 'bg-white border-green-400 shadow-md' 
                : 'bg-white border-gray-200 hover:border-green-300'
            }`}
            onClick={() => handleCardClick('completed')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Concluídos</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            </div>
          </div>
          
          {/* Card Cancelados */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              activeCardFilter === 'cancelled' 
                ? 'bg-white border-red-400 shadow-md' 
                : 'bg-white border-gray-200 hover:border-red-300'
            }`}
            onClick={() => handleCardClick('cancelled')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full mb-2">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Cancelados</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder={showAcquiredOnly ? "Buscar por nome do mentor..." : "Buscar por nome do mentorado..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os agendamentos</SelectItem>
                <SelectItem value="past">Agendamentos Passados</SelectItem>
                <SelectItem value="today">Agendamentos para Hoje</SelectItem>
                <SelectItem value="future">Agendamentos Futuros</SelectItem>
                <SelectItem value="completed">Agendamentos Concluídos</SelectItem>
                <SelectItem value="cancelled">Agendamentos Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de agendamentos */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando agendamentos...</span>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Nenhum agendamento encontrado' 
                  : 'Nenhum agendamento ainda'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Tente ajustar os filtros para encontrar os agendamentos desejados.'
                  : 'Quando você tiver mentorias agendadas, elas aparecerão aqui.'}
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                    {/* Avatar e informações - dinâmico baseado no showAcquiredOnly */}
                    <Avatar 
                      className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                      onClick={() => {
                        if (showAcquiredOnly) {
                          // Na página do mentorado, clica no mentor -> vai para mentor/publicview
                          window.location.href = `/mentor/publicview/${appointment.mentor_id}`;
                        } else {
                          // Na página do mentor, usa mentee_role para navegação inteligente
                          if (appointment.mentee_role === 'mentor') {
                            window.location.href = `/mentor/publicview/${appointment.mentee_id}`;
                          } else {
                            window.location.href = `/mentorado/publicview/${appointment.mentee_id}`;
                          }
                        }
                      }}
                    >
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {showAcquiredOnly 
                          ? appointment.mentor_name.charAt(0).toUpperCase()
                          : appointment.mentee_name.charAt(0).toUpperCase()
                        }
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {showAcquiredOnly 
                            ? appointment.mentor_name 
                            : `${appointment.mentee_name} - ${appointment.mentee_role === 'mentor' ? 'Mentor' : 'Mentorado'}`
                          }
                        </h4>
                          {/* Tag Temporal */}
                          <Badge className={`${getTemporalColor(getTemporalCategory(appointment))} border`}>
                            <div className="flex items-center gap-1">
                              {getTemporalIcon(getTemporalCategory(appointment))}
                              {getTemporalText(getTemporalCategory(appointment))}
                            </div>
                          </Badge>
                          
                          {/* Tag de Status */}
                          <Badge className={`${getStatusColor(appointment.status)} border`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(appointment.status)}
                              {getStatusText(appointment.status)}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.scheduled_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="flex items-start gap-1 mt-2 text-sm text-gray-600">
                            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p className="line-clamp-2">{appointment.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex items-center gap-2">
                      {appointment.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleCancelClick(appointment)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de cancelamento de agendamento */}
        {showCancelModal && (
          <CancelAppointmentModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onSuccess={handleCancelSuccess}
            appointment={appointmentToCancel}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentsList; 