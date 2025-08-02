import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentData: any;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contentData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [mentorId, setMentorId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Obter e-mail e ID do usuário logado quando o modal abrir
  useEffect(() => {
    if (isOpen && (!userEmail || !mentorId)) {
      const getUserData = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            setUserEmail(user.email);
            console.log('👤 ChatModal: E-mail do usuário obtido:', user.email);
            
            // Buscar o ID do usuário na tabela profile
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', user.email)
              .single();
            
            if (error) {
              console.error('❌ ChatModal: Erro ao buscar profile do usuário:', error);
            } else if (profile?.id) {
              setMentorId(profile.id);
              console.log('🆔 ChatModal: ID do usuário obtido:', profile.id);
            }
          }
        } catch (error) {
          console.error('❌ ChatModal: Erro ao obter dados do usuário:', error);
        }
      };
      getUserData();
    }
  }, [isOpen, userEmail, mentorId]);

  // Função para processar e limpar a resposta do webhook
  const processWebhookResponse = (rawResponse: string): string => {
    console.log('🔄 ChatModal: Processando resposta do webhook:', {
      rawResponse: rawResponse,
      rawLength: rawResponse.length
    });

    try {
      // Tentar fazer parse como JSON
      const jsonResponse = JSON.parse(rawResponse);
      
      console.log('📋 ChatModal: Resposta é um JSON válido:', {
        parsedJson: jsonResponse,
        jsonType: typeof jsonResponse
      });

      // Se for um objeto, extrair o texto relevante
      if (typeof jsonResponse === 'object' && jsonResponse !== null) {
        // Procurar por campos comuns que podem conter a resposta
        const possibleFields = ['message', 'text', 'content', 'response', 'answer', 'result', 'data'];
        
        for (const field of possibleFields) {
          if (jsonResponse[field] && typeof jsonResponse[field] === 'string') {
            console.log(`✅ ChatModal: Texto extraído do campo '${field}':`, jsonResponse[field]);
            return formatTextWithParagraphs(jsonResponse[field]);
          }
        }

        // Se não encontrar campos específicos, converter o objeto para string legível
        const cleanText = JSON.stringify(jsonResponse, null, 2)
          .replace(/[{}"\[\]]/g, '')
          .replace(/,\s*\n/g, '\n')
          .replace(/:\s*/g, ': ')
          .trim();
        
        console.log('🔧 ChatModal: Objeto convertido para texto limpo:', cleanText);
        return formatTextWithParagraphs(cleanText);
      }

      // Se for uma string dentro do JSON
      if (typeof jsonResponse === 'string') {
        console.log('📝 ChatModal: String extraída do JSON:', jsonResponse);
        return formatTextWithParagraphs(jsonResponse);
      }

    } catch (error) {
      console.log('📄 ChatModal: Resposta não é JSON, usando como texto puro');
    }

    // Se não for JSON ou não conseguir processar, retornar como texto puro
    const cleanText = rawResponse
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      .trim();

    console.log('🧹 ChatModal: Texto limpo final:', {
      cleanText: cleanText,
      cleanLength: cleanText.length
    });

    return formatTextWithParagraphs(cleanText);
  };

  // Função para formatar texto com quebras de linha entre parágrafos
  const formatTextWithParagraphs = (text: string): string => {
    console.log('📝 ChatModal: Formatando texto com parágrafos:', {
      originalText: text,
      originalLength: text.length
    });

    let formattedText = text
      // Normalizar quebras de linha
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remover espaços extras no início e fim de cada linha
      .split('\n')
      .map(line => line.trim())
      .join('\n')
      // Remover múltiplas quebras de linha consecutivas
      .replace(/\n{3,}/g, '\n\n')
      // Adicionar quebras de linha após pontos finais seguidos de letra maiúscula
      .replace(/\. ([A-Z])/g, '.\n\n$1')
      // Adicionar quebras de linha após dois pontos seguidos de letra maiúscula
      .replace(/: ([A-Z][^:])/g, ':\n\n$1')
      // Adicionar quebras de linha antes de números seguidos de ponto (listas)
      .replace(/(\n|^)(\d+\. )/g, '\n\n$2')
      // Adicionar quebras de linha antes de marcadores de lista
      .replace(/(\n|^)([-•*] )/g, '\n\n$2')
      // Limpar espaços extras
      .trim();

    // Garantir que não comece com quebra de linha
    formattedText = formattedText.replace(/^\n+/, '');

    console.log('✨ ChatModal: Texto formatado:', {
      formattedText: formattedText,
      formattedLength: formattedText.length,
      paragraphCount: formattedText.split('\n\n').length
    });

    return formattedText;
  };

  // Função para renderizar texto com formatação (quebras de linha e negrito)
  const renderFormattedText = (text: string) => {
    // Primeiro, processar quebras de linha explícitas (\n, \n1, \n2, etc.)
    let processedText = text
      .replace(/\\n\d*/g, '\n') // Substitui \n, \n1, \n2, etc. por quebras de linha
      .replace(/\n/g, '|||LINEBREAK|||'); // Marca temporária para quebras de linha

    // Dividir o texto em partes, separando por quebras de linha
    const parts = processedText.split('|||LINEBREAK|||');
    
    return parts.map((part, partIndex) => {
      if (!part.trim()) return <br key={partIndex} />;
      
      // Processar negrito (**texto**)
      const boldRegex = /\*\*(.*?)\*\*/g;
      const segments = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(part)) !== null) {
        // Adicionar texto antes do negrito
        if (match.index > lastIndex) {
          segments.push(part.slice(lastIndex, match.index));
        }
        
        // Adicionar texto em negrito
        segments.push(<strong key={`bold-${partIndex}-${match.index}`}>{match[1]}</strong>);
        
        lastIndex = match.index + match[0].length;
      }
      
      // Adicionar texto restante
      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }

      return (
        <div key={partIndex}>
          {segments.length > 0 ? segments : part}
          {partIndex < parts.length - 1 && <br />}
        </div>
      );
    });
  };

  // Função para extrair texto puro do content_data
  const extractTextFromContentData = (data: any): string => {
    console.log('🔍 ChatModal: Extraindo texto do content_data:', {
      originalData: data,
      dataType: typeof data,
      hasTexto: data?.texto ? 'sim' : 'não',
      hasVideoUrl: data?.video_url ? 'sim' : 'não',
      hasPdfUrl: data?.pdf_url ? 'sim' : 'não'
    });

    if (!data) {
      console.log('⚠️ ChatModal: content_data está vazio ou undefined');
      return '';
    }
    
    let text = '';
    
    if (data.texto) {
      // Remove HTML tags e formata o texto
      const originalText = data.texto;
      text = data.texto.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      
      console.log('📝 ChatModal: Texto extraído de data.texto:', {
        originalLength: originalText.length,
        processedLength: text.length,
        originalText: originalText.substring(0, 200) + '...',
        processedText: text.substring(0, 200) + '...'
      });
    } else if (data.video_url) {
      text = `Conteúdo de vídeo: ${data.video_url}`;
      console.log('🎥 ChatModal: Texto extraído de vídeo:', text);
    } else if (data.pdf_url) {
      text = `Conteúdo PDF: ${data.pdf_url}`;
      console.log('📄 ChatModal: Texto extraído de PDF:', text);
    } else {
      console.log('❓ ChatModal: Nenhum conteúdo reconhecido encontrado');
    }
    
    console.log('✅ ChatModal: Texto final extraído:', {
      finalText: text,
      finalLength: text.length
    });
    
    return text;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Preparar dados para envio
      const contentText = extractTextFromContentData(contentData);
      
      // Concatenar message + content separado por dois pontos
      const bodyText = contentText 
        ? `${inputMessage}: ${contentText}` 
        : inputMessage;

      const payload = {
        message: bodyText,
        sessionId: userEmail || 'anonymous',
        mentor_id: mentorId || 'anonymous'
      };

      const webhookUrl = 'https://remotely-welcome-stallion.ngrok-free.app/webhook/5120bb5f-b740-4681-983f-48a3693f89d9';
      
      console.log('🚀 ChatModal: Preparando requisição direta para webhook:', {
        url: webhookUrl,
        method: 'POST',
        payload: payload,
        sessionId: userEmail || 'anonymous',
        mentorId: mentorId || 'anonymous',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      console.log('📤 ChatModal: JSON sendo enviado:', JSON.stringify(payload, null, 2));

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 ChatModal: Resposta do webhook recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });

      const botResponse = await response.text();

      console.log('📥 ChatModal: Conteúdo da resposta bruto:', {
        responseText: botResponse,
        responseLength: botResponse.length
      });

      // Processar resposta direta do webhook
      const cleanResponse = processWebhookResponse(botResponse);

      console.log('🧹 ChatModal: Resposta processada e limpa:', {
        cleanResponse: cleanResponse,
        cleanLength: cleanResponse.length
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanResponse || 'Desculpe, não consegui processar sua mensagem.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      console.log('✅ ChatModal: Mensagem do bot adicionada com sucesso:', {
        botMessageId: botMessage.id,
        botMessageText: botMessage.text,
        totalMessages: messages.length + 2 // +1 user message, +1 bot message
      });

    } catch (error) {
      console.error('❌ ChatModal: Erro ao enviar mensagem para webhook:', {
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
        errorStack: error instanceof Error ? error.stack : undefined,
        inputMessage: inputMessage,
        contentData: contentData
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Erro ao conectar com o bot. Tente novamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('🏁 ChatModal: Processo de envio de mensagem finalizado');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col border border-gold/30 shadow-gold/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gold/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-gold via-gold-light to-gold rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">AI Assistant</h3>
              <p className="text-sm text-gold">Assistente de Conteúdo</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gold" />
              <p className="text-lg">Olá! Sou seu assistente de IA.</p>
              <p className="text-sm">Faça perguntas sobre o conteúdo que você está estudando.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-700 text-gray-100 border border-slate-600'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.sender === 'bot' && (
                    <Bot className="w-4 h-4 mt-1 text-gold flex-shrink-0" />
                  )}
                  {message.sender === 'user' && (
                    <User className="w-4 h-4 mt-1 text-white flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm leading-relaxed">
                      {renderFormattedText(message.text)}
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 rounded-2xl px-4 py-3 border border-slate-600">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-gold" />
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span className="text-sm text-gray-300">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gold/20">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center justify-center">
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-gold via-gold-light to-gold hover:from-gold-light hover:to-gold text-slate-900 px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;