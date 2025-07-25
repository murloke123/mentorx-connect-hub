import AppointmentsList from "@/components/AppointmentsList";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";

const MentoradoMeusAgendamentosPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentoradoSidebar />
      <div className="flex-1 transition-all duration-300 p-6 overflow-auto">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Agendamentos</h1>
          
          <AppointmentsList showAcquiredOnly={true} />
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusAgendamentosPage;