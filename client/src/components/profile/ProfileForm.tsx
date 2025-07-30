import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from '@supabase/supabase-js';
import { Calendar, Info, MessageSquare, Phone, Star, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "../../hooks/use-toast";
import { useCategories } from "../../hooks/useCategories";
import { supabase } from "../../utils/supabase";
import { uploadImage } from "../../utils/uploadImage";
import RichTextEditor from "../mentor/content/RichTextEditor";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ProfileData {
  id: string;
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  email?: string | null;
  role?: string | null;
  highlight_message?: string | null;
  category?: string | null;
  category_id?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
}

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bio: z.string().optional().nullable(),
  category_id: z.string().optional().nullable(),
  highlight_message: z.string().max(100, "Mensagem de destaque deve ter no máximo 100 caracteres").optional().nullable(),
  phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: User | null;
  profileData: ProfileData | null;
  onProfileUpdate?: () => void;
}

const ProfileForm = ({ user, profileData, onProfileUpdate }: ProfileFormProps) => {
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const [isLoading, setIsLoading] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || null);

  // Função para lidar com upload de avatar
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    console.log('🔍 Debug - Iniciando upload de avatar:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId: user.id,
      currentAvatarUrl: avatarUrl
    });

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
      });
      return;
    }

    // Validar tamanho do arquivo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      console.log('🔍 Debug - Chamando uploadImage...');
      
      // Upload da nova imagem
      const uploadResult = await uploadImage(file, 'avatars', avatarUrl || undefined);
      
      console.log('🔍 Debug - Upload resultado:', uploadResult);

      // Atualizar no banco de dados
      console.log('🔍 Debug - Atualizando banco de dados...');
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: uploadResult.url })
        .eq('id', user.id);

      if (error) {
        console.error('🔍 Debug - Erro no banco de dados:', error);
        throw error;
      }

      console.log('🔍 Debug - Upload concluído com sucesso!');
      setAvatarUrl(uploadResult.url);
      
      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error) {
      console.error('🔍 Debug - Erro completo:', error);
      console.error('🔍 Debug - Erro detalhado:', JSON.stringify(error, null, 2));
      
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };
  
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

  // Atualizar bioContent e avatarUrl quando profileData mudar
  useEffect(() => {
    const newBioContent = profileData?.role === 'mentor' && (!profileData?.bio || profileData?.bio.trim() === '') 
      ? defaultBioText 
      : (profileData?.bio || "");
    setBioContent(newBioContent);
    setAvatarUrl(profileData?.avatar_url || null);
  }, [profileData, defaultBioText]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profileData?.full_name || "",
      bio: initialBioContent,
      category_id: profileData?.category_id || null, // Usar null em vez de string vazia
      highlight_message: profileData?.highlight_message || null,
      phone: profileData?.phone || null, // Usar null em vez de string vazia
      date_of_birth: profileData?.date_of_birth || null, // Usar null em vez de string vazia
    },
  });

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
          category: categoryName,
          category_id: data.category_id || null, // Garantir que seja null se vazio
          highlight_message: data.highlight_message || null,
          phone: data.phone || null, // Garantir que seja null se vazio
          date_of_birth: data.date_of_birth || null, // Garantir que seja null se vazio
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
      <div className="space-y-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Informações Pessoais */}
            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gold">
                  <UserIcon className="h-5 w-5 text-gold" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-300">Nome Completo</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Seu nome completo" 
                            className="h-11 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                     <label className="text-sm font-medium text-gray-300 block mb-2">E-mail</label>
                     <Input 
                       value={profileData?.email || ""} 
                       placeholder="Seu e-mail" 
                       className="h-11 bg-slate-700/50 border-slate-600 text-gray-400 cursor-not-allowed"
                       disabled
                       readOnly
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Phone className="h-4 w-4 text-gold" />
                          Telefone
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="(11) 99999-9999" 
                            value={field.value || ""}
                            className="h-11 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-300">
                          <Calendar className="h-4 w-4 text-gold" />
                          Data de Nascimento
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="date" 
                            value={field.value || ""}
                            className="h-11 bg-slate-800/50 border-slate-600 text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Mensagem Informativa */}
                <div className="bg-slate-800/50 border border-gold/30 rounded-lg p-4 backdrop-blur-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gold">Por que essas informações são importantes?</h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                        <span><strong className="text-gold">Telefone:</strong> Permite que mentores entrem em contato quando necessário para agendamentos ou esclarecimentos importantes.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                        <span><strong className="text-gold">Data de Nascimento:</strong> Você pode receber promoções especiais de aniversário e ter acesso antecipado a novas funcionalidades da plataforma.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Importantes - oculto para mentorados */}
            {profileData?.role !== 'mentorado' && (
              <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-gold">
                    <Info className="h-5 w-5 text-gold" />
                    Informações Importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Campo de Categoria - visível apenas para mentores */}
                  {profileData?.role === 'mentor' && (
                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">Categoria do Mentor</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ""}
                            disabled={isLoading || categoriesLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-slate-800/50 border-slate-600 text-white">
                                <SelectValue placeholder={categoriesLoading ? "Carregando categorias..." : "Selecione uma categoria"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
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

                  {/* Campo de Mensagem de Destaque - visível apenas para mentores */}
                  {profileData?.role === 'mentor' && (
                    <FormField
                      control={form.control}
                      name="highlight_message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <Star className="h-4 w-4 text-gold" />
                            Mensagem de Destaque
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                {...field} 
                                value={field.value || ""}
                                placeholder="Digite uma mensagem que destaque seu diferencial como mentor" 
                                className="h-11 pr-16 bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400"
                                maxLength={100}
                              />
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                {(field.value || "").length}/100
                              </div>
                            </div>
                          </FormControl>
                          <div className="text-xs text-gray-400">
                            Máximo de 100 caracteres para destacar seu diferencial como mentor
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sobre Mim */}
            <Card className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-gold">
                  <MessageSquare className="h-5 w-5 text-gold" />
                  Sobre Mim
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setIsBioModalOpen(true)}
                        className="flex items-center"
                      >
                        <Info className="h-4 w-4 text-gold hover:text-gold-light cursor-pointer" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clique no ícone para saber mais!</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  initialValue={bioContent}
                  onChange={setBioContent}
                  disabled={isLoading}
                />
              </CardContent>
            </Card>

            {/* Botão de Salvar */}
            <div className="flex justify-end pt-6">
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="h-11 px-8 bg-gold hover:bg-gold-light text-slate-900 font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  "Salvando..."
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save h-4 w-4 mr-2">
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
      </div>

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
              A seção <strong>"Sobre Mim"</strong> é sua oportunidade de se apresentar aos mentores e mostrar quem você é, seus interesses e objetivos. Um perfil bem preenchido ajuda os mentores a entenderem como podem te ajudar da melhor forma possível.
            </p>
            
            <p className="text-gray-700 font-semibold">
              Aqui vão algumas recomendações para mentorados:
            </p>

            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-green-800 mb-3">✅ O que incluir no seu perfil</h3>
              <ul className="text-green-700 text-sm space-y-2">
                <li>• <strong>Seus interesses principais:</strong> tecnologia, marketing, vendas, design, empreendedorismo, etc.</li>
                <li>• <strong>Experiência profissional:</strong> onde trabalha ou já trabalhou, área de atuação atual</li>
                <li>• <strong>Objetivos e metas:</strong> o que você quer alcançar profissionalmente</li>
                <li>• <strong>Tipo de mentoria que busca:</strong> carreira, habilidades técnicas, liderança, empreendedorismo</li>
                <li>• <strong>Hobbies e paixões:</strong> o que você gosta de fazer no tempo livre</li>
                <li>• <strong>Motivações:</strong> o que te inspira e move no dia a dia</li>
                <li>• <strong>Desafios atuais:</strong> dificuldades que está enfrentando e gostaria de superar</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800 mb-3">💡 Dicas de organização</h3>
              <p className="text-blue-700 text-sm leading-relaxed mb-3">
                <strong>Organize seu texto em parágrafos:</strong> separe cada tema em um parágrafo diferente. Por exemplo: um parágrafo sobre sua experiência, outro sobre seus objetivos, outro sobre hobbies, etc.
              </p>
              <p className="text-blue-700 text-sm leading-relaxed mb-3">
                <strong>Use emojis com moderação:</strong> eles ajudam a destacar seções e tornar o texto mais visual, mas evite excessos. Um emoji por parágrafo ou seção é suficiente.
              </p>
              <p className="text-blue-700 text-sm leading-relaxed">
                <strong>Seja autêntico:</strong> mentores valorizam honestidade e transparência. Conte sua história real, seus desafios e aspirações genuínas.
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-800 mb-3">🎯 Exemplo de estrutura</h3>
              <div className="text-purple-700 text-sm space-y-2">
                <p><strong>Parágrafo 1:</strong> Apresentação pessoal e área de interesse</p>
                <p><strong>Parágrafo 2:</strong> Experiência profissional atual</p>
                <p><strong>Parágrafo 3:</strong> Objetivos e tipo de mentoria que busca</p>
                <p><strong>Parágrafo 4:</strong> Hobbies e motivações pessoais</p>
              </div>
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
