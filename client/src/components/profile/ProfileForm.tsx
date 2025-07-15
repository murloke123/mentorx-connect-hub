import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../../hooks/use-toast";
import { useCategories } from "../../hooks/useCategories";
import { Profile, supabase } from "../../utils/supabase";
import RichTextEditor from "../mentor/content/RichTextEditor";
import { Button } from "../ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";

interface ProfileData {
  id: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  role?: string;
  highlight_message?: string | null;
  category?: string | null;
  category_id?: string | null;
}

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bio: z.string().optional().nullable(),
  highlight_message: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: Profile | null;
  profileData: ProfileData | null;
  onProfileUpdate?: () => void;
}

const ProfileForm = ({ user, profileData, onProfileUpdate }: ProfileFormProps) => {
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  
  // Texto padrão para mentores
  const defaultBioText = `<p class="p1"><span class="s1"></span></p><h2>




<p class="p1"><span class="s1"></span></p></h2><h2><b>👋 </b><span style="color: rgb(2, 8, 23); font-size: inherit; font-weight: inherit;">Olá! Sou um(a) profissional com mais de [X] anos de experiência nas áreas de [coloque aqui suas áreas de atuação, como vendas, marketing, finanças, tecnologia, recursos humanos, entre outras]. Ao longo da minha carreira, atuei em empresas de diferentes tamanhos e segmentos, participando de projetos que contribuíram para o crescimento e a organização dos times e dos negócios.</span></h2><h2><p class="p3"><br></p>
<p class="p1"><span class="s1"></span></p><hr><p></p>
<p class="p1"><span class="s1"></span></p></h2><h2><b><br></b></h2><h2><b>🚀 Minha Trajetória</b></h2><h2><p></p>
<p class="p2"><br></p>
<p class="p3">Comecei minha carreira como [coloque sua primeira função ou área de atuação], e ao longo do tempo fui me desenvolvendo em diferentes áreas, sempre buscando novos aprendizados e desafios. Essa jornada me trouxe uma visão prática e estratégica sobre o mercado de trabalho e as diversas formas de atuação profissional.</p><p class="p3"><br></p>
<p class="p1"><span class="s1"></span></p><hr><p></p>
<p class="p1"><span class="s1"></span></p></h2><h2><b><br></b></h2><h2><b>🧠 Minha Abordagem</b></h2><h2><p></p>
<p class="p2"><br></p>
<p class="p3">Gosto de ensinar de forma clara, objetiva e personalizada. Acredito que cada pessoa tem um ritmo e uma história, por isso adapto minhas mentorias de acordo com os objetivos e desafios de quem me procura. Compartilho experiências reais, dicas úteis e ferramentas que podem ser aplicadas no dia a dia.</p><p class="p3"><br></p>
<p class="p1"><span class="s1"></span></p><hr><p></p>
<p class="p1"><span class="s1"></span></p></h2><h2><b><br></b></h2><h2><b>💡 Por Que Me Seguir?</b></h2><h2><p></p>
<p class="p2"><br></p>
<p class="p3">Se você está buscando crescer na carreira, se desenvolver em uma nova área ou entender melhor os caminhos possíveis no mercado, aqui é o seu espaço. Compartilho conteúdos voltados para o desenvolvimento profissional, planejamento de carreira, estratégias de mercado e dicas práticas para quem quer sair do lugar.</p><p class="p3"><br></p>
<p class="p1"><span class="s1"></span></p><hr><p></p>
<p class="p1"><span class="s1"></span></p></h2><h2><b><br></b></h2><h2><b>🎁 O Que Você Encontra Comigo</b></h2><h2><p></p>
<p class="p2"><br></p>
<p class="p3">Mentorias acessíveis, com uma linguagem simples, foco em resultados e atenção às suas necessidades. Além disso, ofereço conteúdos exclusivos sobre o mercado de trabalho, como se destacar em processos seletivos, como planejar mudanças de carreira e como se posicionar de forma mais confiante.</p></h2>`;

  // Usar texto padrão se for mentor e não tiver bio
  const initialBioContent = profileData?.role === 'mentor' && (!profileData?.bio || profileData?.bio.trim() === '') 
    ? defaultBioText 
    : (profileData?.bio || "");
    
  const [bioContent, setBioContent] = useState(initialBioContent);

  // Atualizar bioContent quando profileData mudar
  useEffect(() => {
    const newBioContent = profileData?.role === 'mentor' && (!profileData?.bio || profileData?.bio.trim() === '') 
      ? defaultBioText 
      : (profileData?.bio || "");
    setBioContent(newBioContent);
  }, [profileData, defaultBioText]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profileData?.full_name || "",
      bio: initialBioContent,
      highlight_message: profileData?.highlight_message || "",
      category_id: profileData?.category_id || "",
    },
  });

  const highlightMessage = form.watch("highlight_message");
  const highlightMessageLength = highlightMessage?.length || 0;

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      // Buscar o nome da categoria selecionada
      let categoryName = null;
      if (data.category_id) {
        const selectedCategory = categories.find(cat => cat.id === data.category_id);
        categoryName = selectedCategory?.name || null;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          bio: bioContent,
          highlight_message: data.highlight_message,
          category: categoryName,
          category_id: data.category_id,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Seu nome completo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Categoria - visível apenas para mentores */}
          {profileData?.role === 'mentor' && (
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria do Mentor</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                    disabled={isLoading || categoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={categoriesLoading ? "Carregando categorias..." : "Selecione uma categoria"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="highlight_message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  Mensagem de Destaque
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsHighlightModalOpen(true)}
                        className="flex items-center"
                      >
                        <Info className="h-4 w-4 text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clique no ícone para saber mais!</p>
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Mentor especializado em transformar vidas através de finanças e tecnologia"
                    value={field.value || ""}
                    maxLength={120}
                  />
                </FormControl>
                <div className="text-sm text-gray-500 text-right">
                  {highlightMessageLength}/120 caracteres
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel className="flex items-center gap-2">
              Sobre mim
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIsBioModalOpen(true)}
                    className="flex items-center"
                  >
                    <Info className="h-4 w-4 text-blue-500 hover:text-blue-700 cursor-pointer" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clique no ícone para saber mais!</p>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            <RichTextEditor
              initialValue={bioContent}
              onChange={setBioContent}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
              {isLoading ? (
                "Salvando..."
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save h-4 w-4">
                    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"></path>
                    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"></path>
                    <path d="M7 3v4a1 1 0 0 0 1 1h7"></path>
                  </svg>
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal para Mensagem de Destaque */}
      <Dialog open={isHighlightModalOpen} onOpenChange={setIsHighlightModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Dicas para Criar uma Excelente Mensagem de Destaque
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6 border rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              A <strong>Mensagem de Destaque</strong> é uma frase curta (até 120 caracteres) que aparece no seu perfil para chamar a atenção do público logo de cara. Use-a para comunicar seu diferencial de forma clara, direta e impactante.
            </p>
            
            <p className="text-gray-700 font-semibold">
              Veja alguns exemplos organizados por área de atuação:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-green-700 mb-2">Finanças & Investimentos</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• 💰 Transformo pessoas comuns em investidores de sucesso | +500 alunos aprovados</li>
                  <li>• 📈 Especialista em renda passiva | Ensino do zero ao primeiro milhão</li>
                  <li>• 💎 Mentor financeiro | Método exclusivo para multiplicar seu dinheiro</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-blue-700 mb-2">Tecnologia & Programação</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• 👨‍💻 Dev Full Stack | Ensino programação do básico ao avançado de forma prática</li>
                  <li>• 🚀 CTO experiente | Transformo iniciantes em desenvolvedores profissionais</li>
                  <li>• ⚡ Especialista em IA | Automatizo processos e ensino tecnologias do futuro</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-purple-700 mb-2">Marketing & Vendas</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• 📱 Expert em Marketing Digital | +1.000 negócios impactados positivamente</li>
                  <li>• 🎯 Especialista em vendas | Método comprovado para triplicar faturamento</li>
                  <li>• 💡 Growth Hacker | Estratégias exclusivas para escalar seu negócio</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-orange-700 mb-2">Desenvolvimento Pessoal</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• 🌟 Coach de alta performance | Ajudo pessoas a desbloquearem seu potencial</li>
                  <li>• 🧠 Especialista em produtividade | Métodos científicos para máximos resultados</li>
                  <li>• 💪 Mentor de liderança | Formo líderes que transformam equipes e empresas</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-pink-700 mb-2">Saúde & Bem-estar</h3>
                <ul className="space-y-1 text-sm text-gray-600 ml-4">
                  <li>• 🏃‍♂️ Personal trainer | Especialista em transformação corporal sustentável</li>
                  <li>• 🥗 Nutricionista funcional | Reeducação alimentar sem sofrimento</li>
                  <li>• 🧘‍♀️ Terapeuta holística | Equilíbrio mental, físico e emocional</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 mb-2">✅ Dica Final</h3>
              <p className="text-green-700 text-sm leading-relaxed">
                Use um emoji no início da frase para atrair o olhar e definir seu nicho — mas mantenha o equilíbrio e evite exageros. A mensagem deve ser concisa, objetiva e impactante. Pense: se alguém tivesse apenas 5 segundos para ler algo sobre você, o que faria essa pessoa querer te seguir?
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-bold text-yellow-800 mb-2">Como inserir emojis no teclado:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• <strong>Windows:</strong> pressione Win + . (tecla Windows + ponto)</li>
                <li>• <strong>Mac:</strong> pressione Ctrl + Cmd + Barra de Espaço</li>
              </ul>
              <p className="text-yellow-700 text-sm mt-2">
                A janela de emojis será aberta e você pode procurar pelo símbolo desejado.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Sobre Mim */}
      <Dialog open={isBioModalOpen} onOpenChange={setIsBioModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Dicas para criar um excelente "Sobre Mim"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 p-6 border rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              A seção <strong>"Sobre Mim"</strong> é sua chance de mostrar quem você é de verdade, o que te move e o valor que você pode gerar como mentor(a). Esse espaço é importante para criar conexão com quem visita seu perfil.
            </p>
            
            <p className="text-gray-700 font-semibold">
              Aqui vão algumas recomendações:
            </p>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 mb-3">✅ O que incluir</h3>
              <ul className="text-green-700 text-sm space-y-2">
                <li>• Um pouco da sua história e trajetória</li>
                <li>• Suas conquistas, experiências de vida e carreira</li>
                <li>• Sua forma de trabalhar e ensinar</li>
                <li>• Motivos para alguém te seguir ou agendar uma mentoria</li>
                <li>• Benefícios ou conteúdos exclusivos que você oferece para seguidores</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 mb-3">💡 Dica de Estilo</h3>
              <p className="text-blue-700 text-sm leading-relaxed mb-3">
                Use ícones/emojis para destacar seções e tornar o texto mais visual e atrativo. Eles ajudam a criar uma identidade única para o seu perfil.
              </p>
              <p className="text-blue-700 text-sm leading-relaxed mb-3">
                <strong>Mas atenção:</strong> evite excessos! O ideal é usar um emoji por título ou, no máximo, um por parágrafo. O excesso pode poluir e dificultar a leitura.
              </p>
              <p className="text-blue-700 text-sm leading-relaxed">
                Também é importante que o texto esteja bem estruturado, com frases curtas e parágrafos separados por tema. Isso facilita a leitura e torna sua apresentação mais profissional.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
              <h3 className="font-bold text-yellow-800 mb-2">Como inserir emojis no teclado:</h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• <strong>Windows:</strong> pressione Win + . (tecla Windows + ponto)</li>
                <li>• <strong>Mac:</strong> pressione Ctrl + Cmd + Barra de Espaço</li>
              </ul>
              <p className="text-yellow-700 text-sm mt-2">
                A janela de emojis será aberta e você pode procurar pelo símbolo desejado.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ProfileForm;
