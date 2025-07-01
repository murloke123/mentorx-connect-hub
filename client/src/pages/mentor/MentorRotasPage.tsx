import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface RouteInfo {
  path: string;
  component: string;
  section: string;
  hasParams: boolean;
  referencedBy?: string[];
}

const RoutesVisualizationPage = () => {
  // Parse routes from App.tsx into a structured format
  const routes: RouteInfo[] = [
    // Rotas Públicas
    { path: "/", component: "HomePage", section: "Público", hasParams: false, referencedBy: ["Navigation"] },
    { path: "/about", component: "AboutPage", section: "Público", hasParams: false, referencedBy: ["Navigation"] },
    { path: "/courses", component: "CoursesPage", section: "Público", hasParams: false, referencedBy: ["Navigation", "HomePage"] },
    { path: "/login", component: "LoginPage", section: "Público", hasParams: false, referencedBy: ["Navigation"] },
    
    // Rotas Públicas de Perfil
    { path: "/mentors/:mentorId", component: "MentorPublicProfilePage", section: "Público", hasParams: true, referencedBy: ["MentorCard", "HomePage"] },
    
    // Rotas de Mentor
    { path: "/mentor/dashboard", component: "MentorDashboardPage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar", "Navigation"] },
    { path: "/mentor/perfil", component: "MentorProfilePage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar"] },
    { path: "/mentor/cursos", component: "MeusCursosPage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar"] },
    { path: "/mentor/cursos/novo", component: "CreateCoursePage", section: "Mentor", hasParams: false, referencedBy: ["MeusCursosPage"] },
    { path: "/mentor/cursos/:id/editar", component: "EditCoursePage", section: "Mentor", hasParams: true, referencedBy: ["MeusCursosPage"] },
    { path: "/mentor/cursos/view/:id", component: "CoursePlayerPage", section: "Mentor", hasParams: true, referencedBy: ["MeusCursosPage"] },
    { path: "/mentor/cursos/:cursoId/modulos", component: "ModulosPage", section: "Mentor", hasParams: true, referencedBy: ["MeusCursosPage"] },
    { path: "/mentor/cursos/:cursoId/modulos/:moduloId", component: "ConteudosPage", section: "Mentor", hasParams: true, referencedBy: ["ModulosPage"] },
    { path: "/mentor/followers", component: "MentorFollowersPage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar"] },
    { path: "/mentor/mentorados", component: "MentorFollowersPage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar"] },
    { path: "/mentor/configuracoes/rotas", component: "RoutesVisualizationPage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar"] },
    { path: "/mentor/configuracoes/database-mapping", component: "DatabaseMappingPage", section: "Mentor", hasParams: false, referencedBy: ["MentorSidebar"] },
    
    // Rotas de Mentorado
    { path: "/mentorado/dashboard", component: "MentoradoDashboardPage", section: "Mentorado", hasParams: false, referencedBy: ["MentoradoSidebar", "Navigation"] },
    { path: "/mentorado/perfil", component: "MentoradoProfilePage", section: "Mentorado", hasParams: false, referencedBy: ["MentoradoSidebar"] },
    { path: "/mentorado/cursos", component: "NotFound", section: "Mentorado", hasParams: false, referencedBy: ["MentoradoSidebar"] },
    { path: "/mentorado/cursos/:id", component: "NotFound", section: "Mentorado", hasParams: true, referencedBy: ["EnrolledCoursesList"] },
    { path: "/mentorado/calendario", component: "NotFound", section: "Mentorado", hasParams: false, referencedBy: ["MentoradoSidebar"] },
    { path: "/mentorado/configuracoes", component: "NotFound", section: "Mentorado", hasParams: false, referencedBy: ["MentoradoSidebar"] },
    
    // Rotas de Administrador
    { path: "/admin/dashboard", component: "AdminDashboardPage", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar", "Navigation"] },
    { path: "/admin/perfil", component: "AdminProfilePage", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
    { path: "/admin/mentores", component: "AdminMentorsPage", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
    { path: "/admin/mentors", component: "AdminMentorsPage", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
    { path: "/admin/mentorados", component: "AdminMentoradosPage", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
    { path: "/admin/cursos", component: "AdminCoursesPage", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
    { path: "/admin/relatorios", component: "NotFound", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
    { path: "/admin/configuracoes", component: "NotFound", section: "Admin", hasParams: false, referencedBy: ["AdminSidebar"] },
  ];

  // Group routes by section
  const sections = ["Público", "Mentor", "Mentorado", "Admin"];

  // Calculate statistics
  const totalRoutes = routes.length;
  const implementedRoutes = routes.filter(route => route.component !== "NotFound").length;
  const notImplementedRoutes = routes.filter(route => route.component === "NotFound").length;
  const dynamicRoutes = routes.filter(route => route.hasParams).length;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">Visualização de Rotas</h1>
      <p className="text-gray-600 mb-6">Todas as rotas disponíveis na aplicação, organizadas por seção.</p>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-blue-600">{totalRoutes}</h3>
          <p className="text-sm text-gray-600">Total de Rotas</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-green-600">{implementedRoutes}</h3>
          <p className="text-sm text-gray-600">Rotas Implementadas</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-red-600">{notImplementedRoutes}</h3>
          <p className="text-sm text-gray-600">Rotas Pendentes</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-purple-600">{dynamicRoutes}</h3>
          <p className="text-sm text-gray-600">Rotas Dinâmicas</p>
        </Card>
      </div>

      {sections.map((section) => (
        <Card key={section} className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-4">Rotas {section}</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Caminho</TableHead>
                <TableHead className="w-[200px]">Componente</TableHead>
                <TableHead className="w-[150px]">Status</TableHead>
                <TableHead>Referenciado por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes
                .filter((route) => route.section === section)
                .map((route, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{route.path}</TableCell>
                    <TableCell className="text-sm">{route.component}</TableCell>
                    <TableCell>
                      {route.component === "NotFound" ? (
                        <Badge variant="destructive">Não Implementado</Badge>
                      ) : route.hasParams ? (
                        <Badge variant="secondary">Dinâmica</Badge>
                      ) : (
                        <Badge variant="default">Ativa</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {route.referencedBy ? (
                        <div className="flex flex-wrap gap-1">
                          {route.referencedBy.map((component, i) => (
                            <Badge key={i} variant="outline" className="bg-gray-50 text-xs">
                              {component}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Nenhuma referência direta</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      ))}

      {/* Implementation Notes */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Notas de Implementação</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Rotas Públicas:</strong> Acessíveis sem autenticação</li>
          <li>• <strong>Rotas Dinâmicas:</strong> Contêm parâmetros como :id, :mentorId, etc.</li>
          <li>• <strong>Rotas Pendentes:</strong> Redirecionam para NotFound e precisam ser implementadas</li>
          <li>• <strong>MentorPublicProfilePage:</strong> Nova rota adicionada para visualização pública do perfil</li>
        </ul>
      </Card>
    </div>
  );
};

export default RoutesVisualizationPage; 