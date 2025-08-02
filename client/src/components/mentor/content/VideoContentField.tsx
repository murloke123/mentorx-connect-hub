
import { Card, CardContent } from '@/components/ui/card';
import { FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface VideoContentFieldProps {
  initialUrl?: string;
  initialProvider?: 'youtube' | 'vimeo';
  onChange: (url: string, provider: 'youtube' | 'vimeo') => void;
  isSubmitting?: boolean;
}

const VideoContentField = ({ 
  initialUrl = '', 
  initialProvider = 'youtube', 
  onChange,
  isSubmitting
}: VideoContentFieldProps) => {
  const [videoUrl, setVideoUrl] = useState(initialUrl);
  const [provider, setProvider] = useState<'youtube' | 'vimeo'>(initialProvider);

  useEffect(() => {
    onChange(videoUrl, provider);
  }, [videoUrl, provider, onChange]);

  const detectVideoProvider = (url: string): 'youtube' | 'vimeo' => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'youtube'; // Default if can't detect
  };

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setVideoUrl(url);
    if (url) {
      const detectedProvider = detectVideoProvider(url);
      setProvider(detectedProvider);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <FormLabel className="text-white font-medium">URL do Vídeo</FormLabel>
        <Input 
          placeholder="Ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
          value={videoUrl}
          onChange={handleVideoUrlChange}
          disabled={isSubmitting}
          className="w-full bg-slate-800/50 border-slate-600 text-white placeholder:text-gray-400 focus:border-gold/50 focus:ring-gold/20 transition-all duration-300"
        />
        <p className="text-sm text-gray-400">
          Cole o link completo do seu vídeo do YouTube ou Vimeo.
        </p>
      </div>

      {videoUrl && (
        <Card className="w-full bg-slate-800/50 border-slate-600">
          <CardContent className="pt-6">
            <VideoPlayer provider={provider} url={videoUrl} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={provider} value={provider} onValueChange={(value) => setProvider(value as 'youtube' | 'vimeo')}>
        <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-600">
          <TabsTrigger value="youtube" className="text-white data-[state=active]:bg-gold/20 data-[state=active]:text-gold">YouTube</TabsTrigger>
          <TabsTrigger value="vimeo" className="text-white data-[state=active]:bg-gold/20 data-[state=active]:text-gold">Vimeo</TabsTrigger>
        </TabsList>
        <TabsContent value="youtube" className="p-4 border border-slate-600 rounded-md mt-2 bg-slate-800/30">
          <h4 className="text-sm font-medium mb-2 text-white">Como obter o link do YouTube:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-gray-300">
            <li>Vá até o vídeo no YouTube</li>
            <li>Clique em 'Compartilhar' abaixo do vídeo</li>
            <li>Copie o link fornecido</li>
          </ol>
        </TabsContent>
        <TabsContent value="vimeo" className="p-4 border border-slate-600 rounded-md mt-2 bg-slate-800/30">
          <h4 className="text-sm font-medium mb-2 text-white">Como obter o link do Vimeo:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-gray-300">
            <li>Abra o vídeo no Vimeo</li>
            <li>Clique no ícone de 'Compartilhar' (geralmente um avião de papel)</li>
            <li>Copie o link da seção 'Link'</li>
          </ol>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoContentField;
