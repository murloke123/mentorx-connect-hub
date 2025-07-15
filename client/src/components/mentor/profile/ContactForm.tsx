
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface ContactFormProps {
  mentorName?: string;
  mentorEmail?: string;
  onSubmitSuccess?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  mentorName = '', 
  mentorEmail = '',
  onSubmitSuccess 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mentorEmail) {
      toast.error('Email do mentor não encontrado');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 [ContactForm] Enviando dados:', {
        mentorName,
        mentorEmail,
        senderName: formData.name,
        senderEmail: formData.email,
        messageContent: formData.message,
      });

      const response = await fetch('/api/email/contact-mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mentorName,
          mentorEmail,
          senderName: formData.name,
          senderEmail: formData.email,
          messageContent: formData.message,
        }),
      });

      console.log('📥 [ContactForm] Response status:', response.status);
      console.log('📥 [ContactForm] Response headers:', response.headers);
      console.log('📥 [ContactForm] Response ok:', response.ok);

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      console.log('📥 [ContactForm] Content-Type:', contentType);

      if (!response.ok) {
        console.error('❌ [ContactForm] Response não ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('❌ [ContactForm] Error response body:', errorText);
        toast.error(`Erro ${response.status}: ${response.statusText}`);
        return;
      }

      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ [ContactForm] Resposta não é JSON:', contentType);
        const responseText = await response.text();
        console.error('❌ [ContactForm] Response body:', responseText);
        toast.error('Erro: Resposta inválida do servidor');
        return;
      }

      const result = await response.json();
      console.log('✅ [ContactForm] Resultado:', result);

      if (result.success) {
        toast.success('Mensagem enviada com sucesso!');
        setFormData({ name: '', email: '', message: '' });
        onSubmitSuccess?.();
      } else {
        console.error('❌ [ContactForm] Erro no resultado:', result.error);
        toast.error(result.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('❌ [ContactForm] Erro ao enviar mensagem:', error);
      console.error('❌ [ContactForm] Error stack:', error instanceof Error ? error.stack : 'No stack');
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Seu nome"
        value={formData.name}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />
      <Input
        name="email"
        type="email"
        placeholder="Seu email"
        value={formData.email}
        onChange={handleChange}
        required
        disabled={isSubmitting}
      />
      <Textarea
        name="message"
        placeholder="Sua mensagem"
        value={formData.message}
        onChange={handleChange}
        rows={4}
        required
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Enviar Mensagem
          </>
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
