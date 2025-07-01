import React from "react";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MentorCalendarioPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Calendário</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Mentorias</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Funcionalidade de calendário em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorCalendarioPage; 