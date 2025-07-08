import React from "react";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import AppointmentsList from "@/components/AppointmentsList";

const MentoradoMeusAgendamentosPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentoradoSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Agendamentos</h1>
          
          <AppointmentsList showAcquiredOnly={true} />
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusAgendamentosPage; 