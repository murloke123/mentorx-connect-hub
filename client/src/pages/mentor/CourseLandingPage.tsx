import {
    ArrowLeft,
    Award,
    BookOpen,
    CheckCircle,
    Clock,
    Download,
    Edit3,
    Eye,
    Play,
    Save,
    Shield,
    Star,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MentorSidebar from '../../components/mentor/MentorSidebar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../hooks/use-toast';
import { supabase } from '../../utils/supabase';

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number;
  is_paid: boolean;
  image_url: string;
  mentor_id: string;
  created_at: string;
}

interface LandingPageData {
  headline: string;
  subheadline: string;
  key_benefits: string[];
  social_proof: string;
  guarantee: string;
  bonus_offer: string;
  urgency_message: string;
}

const CourseLandingPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [landingData, setLandingData] = useState<LandingPageData>({
    headline: "Domine as Habilidades que Vão Transformar Sua Carreira",
    subheadline: "Um curso prático e direto ao ponto para você alcançar resultados reais em tempo recorde",
    key_benefits: [
      "Metodologia testada e aprovada",
      "Suporte direto com o mentor",
      "Acesso vitalício ao conteúdo",
      "Certificado de conclusão"
    ],
    social_proof: "Mais de 1.000 alunos já transformaram suas carreiras",
    guarantee: "Garantia incondicional de 30 dias",
    bonus_offer: "Bônus exclusivo: Kit de ferramentas profissionais",
    urgency_message: "Últimas vagas disponíveis"
  });

  useEffect(() => {
    const loadData = async () => {
      if (!courseId) return;
      
      try {
        const { data: course, error: courseError } = await supabase
          .from('cursos')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourseData(course);

        const { data: landingPage } = await supabase
          .from('course_landing_pages')
          .select('layout_body')
          .eq('course_id', courseId)
          .single();

        if (landingPage?.layout_body) {
          setLandingData(prevData => ({ ...prevData, ...landingPage.layout_body }));
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do curso",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  const handleSave = async () => {
    if (!courseId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('course_landing_pages')
        .upsert({
          course_id: courseId,
          layout_body: landingData,
          layout_name: 'simple_checkout',
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Página de vendas salva com sucesso!",
        variant: "default"
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateLandingData = (field: keyof LandingPageData, value: string | string[]) => {
    setLandingData(prev => ({ ...prev, [field]: value }));
  };

  const exportToHTML = async () => {
    if (!courseData) return;

    try {
      // Capturar todos os estilos CSS da página
      const allStyles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // CSS customizado adicional para garantir que tudo funcione standalone
      const customCSS = `
        /* Reset e base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #f9fafb;
          background: linear-gradient(135deg, #0f172a, #1e293b, #334155);
          min-height: 100vh;
        }

        /* Variáveis CSS customizadas */
        :root {
          --gold: 45 95% 68%;
          --gold-light: 48 100% 78%;
          --gold-dark: 42 85% 58%;
          --background: 220 15% 4%;
          --foreground: 210 40% 98%;
          --border: 220 15% 20%;
          --card: 220 15% 8%;
          --muted-foreground: 215 20.2% 65.1%;
        }

        /* Classes utilitárias essenciais */
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .text-xl { font-size: 1.25rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-4xl { font-size: 2.25rem; }
        .text-sm { font-size: 0.875rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .p-8 { padding: 2rem; }
        .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
        .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
        .space-y-4 > * + * { margin-top: 1rem; }
        .space-y-6 > * + * { margin-top: 1.5rem; }
        .space-y-8 > * + * { margin-top: 2rem; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .grid { display: grid; }
        .gap-12 { gap: 3rem; }
        .max-w-6xl { max-width: 72rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .w-full { width: 100%; }
        .h-64 { height: 16rem; }
        .rounded-2xl { border-radius: 1rem; }
        .rounded-lg { border-radius: 0.5rem; }
        .rounded-full { border-radius: 9999px; }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .border { border-width: 1px; }
        .border-2 { border-width: 2px; }
        .overflow-hidden { overflow: hidden; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .z-10 { z-index: 10; }
        .object-cover { object-fit: cover; }
        .leading-tight { line-height: 1.25; }
        .opacity-90 { opacity: 0.9; }
        .transform { transform: translateZ(0); }
        .transition-all { transition: all 0.3s ease; }
        .hover\\:scale-105:hover { transform: scale(1.05); }

        /* Grid responsivo */
        @media (min-width: 1024px) {
          .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .lg\\:sticky { position: sticky; }
          .lg\\:top-8 { top: 2rem; }
        }

        /* Cores e gradientes */
        .text-gold { color: hsl(45 95% 68%); }
        .text-white { color: #ffffff; }
        .text-gray-700 { color: #374151; }
        .text-emerald-500 { color: #10b981; }
        .text-red-500 { color: #ef4444; }
        .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
        .from-gold-dark { --tw-gradient-from: hsl(42 85% 58%); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, transparent); }
        .via-gold { --tw-gradient-via: hsl(45 95% 68%); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to, transparent); }
        .to-gold-light { --tw-gradient-to: hsl(48 100% 78%); }
        .bg-black\\/20 { background-color: rgba(0, 0, 0, 0.2); }
        .bg-white\\/10 { background-color: rgba(255, 255, 255, 0.1); }

        /* Botão premium */
        .btn-gold {
          background: linear-gradient(to right, hsl(42 85% 58%), hsl(45 95% 68%), hsl(48 100% 78%));
          color: hsl(220 15% 4%);
          font-weight: 700;
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
        }
        .btn-gold:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px hsl(45 95% 68% / 0.3);
        }

        /* Cards premium */
        .premium-card {
          background: hsl(220 15% 12%);
          border: 1px solid hsl(220 15% 20%);
          border-radius: 1rem;
          padding: 2rem;
          transition: all 0.3s ease;
        }
        .premium-card:hover {
          border-color: hsl(45 95% 68% / 0.5);
          box-shadow: 0 10px 40px -10px hsl(45 95% 68% / 0.4);
        }

        /* Animações */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .float {
          animation: float 6s ease-in-out infinite;
        }

        /* Ícones SVG */
        .icon {
          width: 1.25rem;
          height: 1.25rem;
          display: inline-block;
          vertical-align: middle;
        }
      `;

      // Gerar o HTML da landing page sem a sidebar
      const landingPageHTML = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${courseData.title} - Página de Vendas</title>
          <style>
            ${customCSS}
            ${allStyles}
          </style>
        </head>
        <body>
          <div class="min-h-screen bg-gradient-to-br" style="background: linear-gradient(135deg, #0f172a, #1e293b, #334155);">
            <!-- Background Premium -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;">
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #0f172a, #1e293b, #334155);"></div>
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent, rgba(15, 23, 42, 0.4));"></div>
            </div>

            <!-- Floating Particles -->
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 10;">
              ${[...Array(15)].map((_, i) => `
                <div style="
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  background: hsl(45 95% 68% / 0.2);
                  border-radius: 50%;
                  left: ${Math.random() * 100}%;
                  top: ${Math.random() * 100}%;
                  animation: float ${4 + Math.random() * 4}s ease-in-out infinite;
                  animation-delay: ${Math.random() * 6}s;
                "></div>
              `).join('')}
            </div>

            <!-- Checkout Page Content -->
            <div style="position: relative; z-index: 20; min-height: 100vh;">
              <div class="max-w-6xl mx-auto px-6 py-12">
                <div class="grid lg:grid-cols-2 gap-12" style="align-items: start;">
                  
                  <!-- Left Column - Course Info -->
                  <div class="space-y-8">
                    <!-- Hero Section Premium -->
                    <div class="premium-card overflow-hidden">
                      <div style="position: relative; height: 16rem; background: linear-gradient(to right, hsl(42 85% 58%), hsl(45 95% 68%), hsl(48 100% 78%));">
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.2);"></div>
                        <div style="position: relative; z-index: 10; padding: 2rem; height: 100%; display: flex; flex-direction: column; justify-content: center; color: #0f172a;">
                          <h1 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; line-height: 1.25; text-shadow: 0 0 20px hsl(45 95% 68% / 0.5);">
                            ${landingData.headline}
                          </h1>
                          <p style="font-size: 1.25rem; opacity: 0.9; max-width: 42rem;">
                            ${landingData.subheadline}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- Course Image -->
                    ${courseData.image_url ? `
                      <div style="position: relative; overflow: hidden; border-radius: 1rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);">
                        <img
                          src="${courseData.image_url}"
                          alt="${courseData.title}"
                          style="width: 100%; height: 16rem; object-fit: cover;"
                        />
                        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);"></div>
                        <div style="position: absolute; bottom: 1rem; left: 1rem; color: white;">
                          <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <svg class="icon" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span style="font-weight: 500;">Preview do Curso</span>
                          </div>
                        </div>
                      </div>
                    ` : ''}

                    <!-- Key Benefits Premium -->
                    <div class="premium-card">
                      <div class="mb-6">
                        <h3 style="display: flex; align-items: center; font-size: 1.25rem; font-weight: 700; color: #f9fafb;">
                          <svg class="icon" style="margin-right: 0.75rem; color: hsl(45 95% 68%);" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          O que você vai aprender
                        </h3>
                      </div>
                      <ul class="space-y-4">
                        ${landingData.key_benefits.map(benefit => `
                          <li style="display: flex; align-items: center; gap: 0.75rem;">
                            <svg class="icon" style="color: #10b981; flex-shrink: 0;" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span style="color: #d1d5db;">${benefit}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>

                    <!-- Social Proof Premium -->
                    <div class="premium-card" style="background: linear-gradient(to right, hsl(45 95% 68% / 0.1), hsl(48 100% 78% / 0.1), hsl(45 95% 68% / 0.1)); border-color: hsl(45 95% 68% / 0.2);">
                      <div style="padding: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                          <div style="display: flex; margin-left: -0.5rem;">
                            ${[...Array(3)].map((_, i) => `
                              <div style="
                                width: 2.5rem;
                                height: 2.5rem;
                                border-radius: 50%;
                                background: linear-gradient(to right, hsl(42 85% 58%), hsl(45 95% 68%), hsl(48 100% 78%));
                                border: 2px solid #0f172a;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                margin-left: -0.5rem;
                              ">
                                <svg class="icon" style="color: #0f172a;" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                                </svg>
                              </div>
                            `).join('')}
                          </div>
                          <div>
                            <p style="font-weight: 600; color: #f9fafb;">
                              ${landingData.social_proof}
                            </p>
                            <div style="display: flex; align-items: center;">
                              ${[...Array(5)].map(() => `
                                <svg class="icon" style="color: hsl(45 95% 68%); margin-right: 0.125rem;" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                                </svg>
                              `).join('')}
                              <span style="margin-left: 0.5rem; font-size: 0.875rem; color: #9ca3af;">4.9/5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Right Column - Checkout Card Premium -->
                  <div class="lg:sticky lg:top-8">
                    <div class="premium-card overflow-hidden" style="box-shadow: 0 0 30px hsl(45 95% 68% / 0.3);">
                      <div style="background: linear-gradient(to right, hsl(42 85% 58%), hsl(45 95% 68%), hsl(48 100% 78%)); padding: 1.5rem; color: #0f172a;">
                        <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; text-shadow: 0 0 20px hsl(45 95% 68% / 0.5);">${courseData.title}</h3>
                        <div style="display: flex; align-items: center; justify-content: space-between;">
                          <div>
                            <div style="font-size: 1.875rem; font-weight: 700;">
                              ${courseData.is_paid ? `R$ ${courseData.price}` : 'GRATUITO'}
                            </div>
                            ${courseData.is_paid ? `
                              <div style="font-size: 0.875rem; opacity: 0.9;">
                                ou 12x de R$ ${(courseData.price / 12).toFixed(2)}
                              </div>
                            ` : ''}
                          </div>
                          <div style="text-align: right;">
                            <div style="font-size: 0.875rem; opacity: 0.9;">Acesso</div>
                            <div style="font-weight: 600;">Vitalício</div>
                          </div>
                        </div>
                      </div>

                      <div style="padding: 1.5rem;" class="space-y-6">
                        <!-- Course Features Premium -->
                        <div class="space-y-4">
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="
                              width: 2.5rem;
                              height: 2.5rem;
                              background: linear-gradient(to right, hsl(45 95% 68% / 0.2), hsl(48 100% 78% / 0.2));
                              border-radius: 50%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border: 1px solid hsl(45 95% 68% / 0.3);
                            ">
                              <svg class="icon" style="color: hsl(45 95% 68%);" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                              </svg>
                            </div>
                            <div>
                              <div style="font-weight: 600; color: #f9fafb;">Conteúdo Completo</div>
                              <div style="font-size: 0.875rem; color: #9ca3af;">Módulos práticos e teóricos</div>
                            </div>
                          </div>
                          
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="
                              width: 2.5rem;
                              height: 2.5rem;
                              background: linear-gradient(to right, hsl(45 95% 68% / 0.2), hsl(48 100% 78% / 0.2));
                              border-radius: 50%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border: 1px solid hsl(45 95% 68% / 0.3);
                            ">
                              <svg class="icon" style="color: hsl(45 95% 68%);" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                            <div>
                              <div style="font-weight: 600; color: #f9fafb;">Acesso Vitalício</div>
                              <div style="font-size: 0.875rem; color: #9ca3af;">Estude no seu ritmo</div>
                            </div>
                          </div>
                          
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="
                              width: 2.5rem;
                              height: 2.5rem;
                              background: linear-gradient(to right, hsl(45 95% 68% / 0.2), hsl(48 100% 78% / 0.2));
                              border-radius: 50%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              border: 1px solid hsl(45 95% 68% / 0.3);
                            ">
                              <svg class="icon" style="color: hsl(45 95% 68%);" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              </svg>
                            </div>
                            <div>
                              <div style="font-weight: 600; color: #f9fafb;">Certificado</div>
                              <div style="font-size: 0.875rem; color: #9ca3af;">Comprove suas habilidades</div>
                            </div>
                          </div>
                        </div>

                        <div style="border-top: 1px solid hsl(220 15% 20% / 0.5);"></div>

                        <!-- Bonus Offer Premium -->
                        <div style="
                          background: linear-gradient(to right, hsl(45 95% 68% / 0.1), hsl(48 100% 78% / 0.1));
                          border: 1px solid hsl(45 95% 68% / 0.3);
                          border-radius: 0.5rem;
                          padding: 1rem;
                          backdrop-filter: blur(4px);
                        ">
                          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <svg class="icon" style="color: hsl(45 95% 68%);" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span style="font-weight: 600; color: hsl(45 95% 68%);">Bônus Incluído</span>
                          </div>
                          <p style="font-size: 0.875rem; color: #f9fafb;">
                            ${landingData.bonus_offer}
                          </p>
                        </div>

                        <!-- Urgency Message Premium -->
                        <div style="
                          background: linear-gradient(to right, hsl(0 85% 60% / 0.1), hsl(0 85% 60% / 0.2));
                          border: 1px solid hsl(0 85% 60% / 0.3);
                          border-radius: 0.5rem;
                          padding: 1rem;
                          text-align: center;
                          backdrop-filter: blur(4px);
                        ">
                          <p style="color: hsl(0 85% 60%); font-weight: 500;">
                            ⏰ ${landingData.urgency_message}
                          </p>
                        </div>

                        <!-- CTA Button Premium -->
                        <button class="btn-gold w-full" style="font-size: 1.125rem; padding: 1rem;">
                          <svg class="icon" style="margin-right: 0.5rem;" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          ${courseData.is_paid ? 'COMPRAR AGORA' : 'COMEÇAR GRATUITAMENTE'}
                        </button>

                        <!-- Guarantee Premium -->
                        <div style="text-align: center;">
                          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.875rem; color: #9ca3af;">
                            <svg class="icon" style="color: #10b981;" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                            </svg>
                            <span>${landingData.guarantee}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Criar e baixar o arquivo
      const blob = new Blob([landingPageHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_landing_page.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Página HTML exportada com sucesso!",
        variant: "default"
      });

    } catch (error) {
      console.error('Erro ao exportar HTML:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar a página HTML",
        variant: "destructive"
      });
    }
  };

  const EditableText = ({ 
    value, 
    field, 
    multiline = false, 
    className = "",
    placeholder = ""
  }: { 
    value: string;
    field: keyof LandingPageData;
    multiline?: boolean;
    className?: string;
    placeholder?: string;
  }) => {
    if (!isEditing) {
      return <span className={className}>{value}</span>;
    }

    if (multiline) {
      return (
        <Textarea
          value={value}
          onChange={(e) => updateLandingData(field, e.target.value)}
          className={className}
          placeholder={placeholder}
        />
      );
    }

    return (
      <Input
        value={value}
        onChange={(e) => updateLandingData(field, e.target.value)}
        className={className}
        placeholder={placeholder}
      />
    );
  };

  const EditableBenefits = () => {
    if (!isEditing) {
      return (
        <ul className="space-y-3">
          {landingData.key_benefits.map((benefit, index) => (
            <li key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span className="text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-2">
        {landingData.key_benefits.map((benefit, index) => (
          <div key={index} className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <Input
              value={benefit}
              onChange={(e) => {
                const newBenefits = [...landingData.key_benefits];
                newBenefits[index] = e.target.value;
                updateLandingData('key_benefits', newBenefits);
              }}
              className="flex-1"
            />
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => updateLandingData('key_benefits', [...landingData.key_benefits, 'Novo benefício'])}
        >
          + Adicionar Benefício
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="flex">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300 p-6">
          <div className="text-center py-10">
            <p className="text-lg text-red-500">Curso não encontrado</p>
            <Button onClick={() => navigate('/mentor/meus-cursos')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Premium */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/40"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/20 rounded-full float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="flex relative z-20">
        <MentorSidebar />
        <div className="flex-1 transition-all duration-300">
          {/* Toolbar Premium */}
          <div className="bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/mentor/meus-cursos')}
                className="flex items-center group border-border/50 hover:border-gold/50 hover:text-gold transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Página de Checkout</h1>
                <p className="text-sm text-muted-foreground">{courseData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => window.open(`/course-landing/${courseId}`, '_blank')}
                className="border-border/50 hover:border-gold/50 hover:text-gold transition-all group"
              >
                <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Visualizar
              </Button>
              
              <Button
                variant="outline"
                onClick={exportToHTML}
                className="border-border/50 hover:border-gold/50 hover:text-gold transition-all group"
              >
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Exportar HTML
              </Button>
              
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-border/50 hover:border-destructive/50 hover:text-destructive transition-all"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-gold text-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="btn-gold text-sm"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* Checkout Page Content */}
          <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                
                {/* Left Column - Course Info */}
                <div className="space-y-8">
                  {/* Hero Section Premium */}
                  <div className="premium-card overflow-hidden">
                    <div className="relative h-64 bg-gradient-to-r from-gold-dark via-gold to-gold-light">
                      <div className="absolute inset-0 bg-background/20"></div>
                      <div className="relative z-10 p-8 h-full flex flex-col justify-center text-background">
                        {isEditing && (
                          <div className="badge-premium mb-4 w-fit">
                            Editando: Título Principal
                          </div>
                        )}
                        <h1 className="text-4xl font-bold mb-4 leading-tight text-shadow-gold">
                          <EditableText
                            value={landingData.headline}
                            field="headline"
                            className="text-4xl font-bold text-background leading-tight"
                            placeholder="Título principal do curso"
                          />
                        </h1>
                        <p className="text-xl opacity-90 max-w-2xl">
                          <EditableText
                            value={landingData.subheadline}
                            field="subheadline"
                            className="text-xl text-background/90"
                            placeholder="Subtítulo explicativo"
                          />
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Course Image */}
                  {courseData.image_url && (
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src={courseData.image_url}
                        alt={courseData.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center space-x-2">
                          <Play className="w-5 h-5" />
                          <span className="font-medium">Preview do Curso</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Benefits Premium */}
                  <div className="premium-card">
                    <div className="mb-6">
                      <h3 className="flex items-center text-xl font-bold text-foreground">
                        <Zap className="w-6 h-6 mr-3 text-gold" />
                        O que você vai aprender
                      </h3>
                    </div>
                    <div>
                      {isEditing && (
                        <div className="badge-premium mb-4">
                          Editando: Benefícios
                        </div>
                      )}
                      <EditableBenefits />
                    </div>
                  </div>

                  {/* Social Proof Premium */}
                  <div className="premium-card bg-gradient-to-r from-gold/10 via-gold-light/10 to-gold/10 border-gold/20">
                    <div className="p-6">
                      {isEditing && (
                        <div className="badge-premium mb-4">
                          Editando: Prova Social
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <div className="flex -space-x-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light border-2 border-background flex items-center justify-center">
                              <Users className="w-5 h-5 text-background" />
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            <EditableText
                              value={landingData.social_proof}
                              field="social_proof"
                              className="font-semibold text-foreground"
                              placeholder="Prova social (ex: +1000 alunos)"
                            />
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-gold fill-current" />
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">4.9/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Checkout Card Premium */}
                <div className="lg:sticky lg:top-8">
                  <div className="premium-card overflow-hidden shadow-glow">
                    <div className="bg-gradient-to-r from-gold-dark via-gold to-gold-light p-6 text-background">
                      <h3 className="text-2xl font-bold mb-2 text-shadow-gold">{courseData.title}</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold">
                            {courseData.is_paid ? `R$ ${courseData.price}` : 'GRATUITO'}
                          </div>
                          {courseData.is_paid && (
                            <div className="text-sm opacity-90">
                              ou 12x de R$ {(courseData.price / 12).toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm opacity-90">Acesso</div>
                          <div className="font-semibold">Vitalício</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Course Features Premium */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                            <BookOpen className="w-5 h-5 text-gold" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Conteúdo Completo</div>
                            <div className="text-sm text-muted-foreground">Módulos práticos e teóricos</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                            <Clock className="w-5 h-5 text-gold" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Acesso Vitalício</div>
                            <div className="text-sm text-muted-foreground">Estude no seu ritmo</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gold/20 to-gold-light/20 rounded-full flex items-center justify-center border border-gold/30">
                            <Award className="w-5 h-5 text-gold" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">Certificado</div>
                            <div className="text-sm text-muted-foreground">Comprove suas habilidades</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-border/50"></div>

                      {/* Bonus Offer Premium */}
                      <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold/30 rounded-lg p-4 backdrop-blur-sm">
                        {isEditing && (
                          <div className="badge-premium mb-2">
                            Editando: Bônus
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="w-5 h-5 text-gold" />
                          <span className="font-semibold text-gold">Bônus Incluído</span>
                        </div>
                        <p className="text-sm text-foreground">
                          <EditableText
                            value={landingData.bonus_offer}
                            field="bonus_offer"
                            className="text-sm text-foreground"
                            placeholder="Descrição do bônus oferecido"
                          />
                        </p>
                      </div>

                      {/* Urgency Message Premium */}
                      <div className="bg-gradient-to-r from-destructive/10 to-destructive/20 border border-destructive/30 rounded-lg p-4 text-center backdrop-blur-sm">
                        {isEditing && (
                          <div className="badge-premium mb-2">
                            Editando: Urgência
                          </div>
                        )}
                        <p className="text-destructive font-medium">
                          ⏰ <EditableText
                            value={landingData.urgency_message}
                            field="urgency_message"
                            className="text-destructive font-medium"
                            placeholder="Mensagem de urgência"
                          />
                        </p>
                      </div>

                      {/* CTA Button Premium */}
                      <button className="btn-gold w-full text-lg py-4">
                        <Zap className="w-5 h-5 mr-2" />
                        {courseData.is_paid ? 'COMPRAR AGORA' : 'COMEÇAR GRATUITAMENTE'}
                      </button>

                      {/* Guarantee Premium */}
                      <div className="text-center">
                        {isEditing && (
                          <div className="badge-premium mb-2">
                            Editando: Garantia
                          </div>
                        )}
                        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                          <Shield className="w-4 h-4 text-success" />
                          <span>
                            <EditableText
                              value={landingData.guarantee}
                              field="guarantee"
                              className="text-sm text-muted-foreground"
                              placeholder="Texto da garantia"
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLandingPage;