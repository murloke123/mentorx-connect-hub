import React from "react";
import MentoradoSidebar from "@/components/mentorado/MentoradoSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MentoradoMeusMentoresPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentoradoSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Mentores</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Mentores que Sigo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Os mentores que você segue aparecerão aqui...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentoradoMeusMentoresPage; 