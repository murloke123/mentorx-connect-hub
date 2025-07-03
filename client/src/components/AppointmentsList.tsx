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
import { supabase } from '../utils/supabase';
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
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface AppointmentsListProps {
  mentorId: string;
  refreshTrigger?: number;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ mentorId, refreshTrigger }) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [activeCardFilter, setActiveCardFilter] = useState<string>('all');

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

  // Verificar se é hoje
  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  // Verificar se é futuro
  const isFuture = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString > today;
  };

  // Verificar se é passado
  const isPast = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  // Carregar agendamentos
  const loadAppointments = async () => {
    if (!mentorId) return;

    console.log('🔄 [loadAppointments] Carregando agendamentos do mentor:', mentorId);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('calendar')
        .select('*')
        .eq('mentor_id', mentorId)
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

    // Filtro por texto (nome do mentorado)
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.mentee_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
    if (mentorId) {
      loadAppointments();
    }
  }, [mentorId, refreshTrigger]);

  // Obter estatísticas
  const getStats = () => {
    const past = appointments.filter(apt => isPast(apt.scheduled_date)).length;
    const today = appointments.filter(apt => isToday(apt.scheduled_date) && apt.status === 'scheduled').length;
    const future = appointments.filter(apt => isFuture(apt.scheduled_date) && apt.status === 'scheduled').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;

    return { past, today, future, cancelled, completed };
  };

  const stats = getStats();

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obter ícone do status
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

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Minhas Mentorias Agendadas
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
              placeholder="Buscar por nome do mentorado..."
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
                      {/* Avatar e informações do mentorado */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {appointment.mentee_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{appointment.mentee_name}</h4>
                          <Badge className={`${getStatusColor(appointment.status)} border`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(appointment.status)}
                              {getStatusText(appointment.status)}
                            </div>
                          </Badge>
                          {isToday(appointment.scheduled_date) && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                              Hoje
                            </Badge>
                          )}
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
                          onClick={() => {
                            // TODO: Implementar cancelamento
                            toast({
                              title: "Funcionalidade em desenvolvimento",
                              description: "O cancelamento de agendamentos será implementado em breve."
                            });
                          }}
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
      </CardContent>
    </Card>
  );
};

export default AppointmentsList; 