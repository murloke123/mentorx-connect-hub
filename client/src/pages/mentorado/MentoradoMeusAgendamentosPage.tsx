import AppointmentsList from "@/components/AppointmentsList";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";

const MentoradoMeusAgendamentosPage = () => {
  return (
    <div className="flex-col md:flex-row flex min-h-screen bg-black">
      <MentoradoSidebar />
      <div className="flex-1 transition-all duration-300 p-4 md:p-6 overflow-auto">
        <div className="space-y-8">
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gold mb-2">Meus Agendamentos</h1>
              <p className="text-muted-foreground">Acompanhe suas sessões de mentoria agendadas</p>
            </div>
          </div>
          
          <AppointmentsList showAcquiredOnly={true} />
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusAgendamentosPage;