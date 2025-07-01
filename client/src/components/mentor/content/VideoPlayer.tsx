
import { useEffect, useState } from 'react';

interface VideoPlayerProps {
  provider: 'youtube' | 'vimeo';
  url: string;
  height?: string;
}

const VideoPlayer = ({ provider, url, height = '400px' }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState<string>('');

  useEffect(() => {
    if (provider === 'youtube') {
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const match = url.match(youtubeRegex);
      if (match && match[1]) {
        setEmbedUrl(`https://www.youtube.com/embed/${match[1]}`);
      } else {
        console.error('URL do YouTube inválida:', url);
      }
    } else if (provider === 'vimeo') {
      const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)([0-9]+)/;
      const match = url.match(vimeoRegex);
      if (match && match[1]) {
        setEmbedUrl(`https://player.vimeo.com/video/${match[1]}`);
      } else {
        console.error('URL do Vimeo inválida:', url);
      }
    }
  }, [provider, url]);

  if (!embedUrl) {
    return (
      <div className="border rounded-md p-4 text-center">
        <p className="text-muted-foreground">URL de vídeo inválida ou não suportada.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full rounded-md"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Vídeo"
      />
    </div>
  );
};

export default VideoPlayer;
