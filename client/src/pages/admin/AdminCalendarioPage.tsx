import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminCalendarioPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Calendário Admin</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Eventos</CardTitle>
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

export default AdminCalendarioPage; 