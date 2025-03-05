import React from 'react';

interface YouTubeBlockProps {
  settings?: {
    aspectRatio?: string;
    maxWidth?: string;
    showControls?: boolean;
    autoplay?: boolean;
  };
  content?: {
    videoId?: string;
    title?: string;
    description?: string;
  };
}

export function YouTubeBlock({ settings = {}, content = {} }: YouTubeBlockProps) {
  const {
    aspectRatio = '16:9',
    maxWidth = '800px',
    showControls = true,
    autoplay = false
  } = settings;

  const {
    videoId = '',
    title = '',
    description = ''
  } = content;

  const [width, height] = aspectRatio.split(':').map(Number);
  const paddingTop = `${(height / width) * 100}%`;

  if (!videoId) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        ID do vídeo não especificado
      </div>
    );
  }

  return (
    <div className="w-full" style={{ maxWidth, margin: '0 auto' }}>
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="relative" style={{ paddingTop }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?controls=${
            showControls ? 1 : 0
          }&autoplay=${autoplay ? 1 : 0}`}
          title={title || 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {description && (
        <p className="mt-4 text-gray-600">{description}</p>
      )}
    </div>
  );
}