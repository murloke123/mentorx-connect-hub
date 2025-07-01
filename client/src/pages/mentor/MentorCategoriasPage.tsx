import React from "react";
import MentorSidebar from "@/components/mentor/MentorSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MentorCategoriasPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <MentorSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Minhas Categorias</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Categorias dos Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Gerencie as categorias dos seus cursos...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorCategoriasPage; 