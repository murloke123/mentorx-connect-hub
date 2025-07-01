import React from "react";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MentoradoCalendarioPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentoradoSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Calendário</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Mentorias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Suas sessões de mentoria agendadas aparecerão aqui...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentoradoCalendarioPage; 