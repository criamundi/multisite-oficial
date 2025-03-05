import React from 'react';

interface HeroBlockProps {
  settings?: {
    height: string;
    alignment: string;
    overlay: boolean;
    overlayColor: string;
  };
  background?: {
    type: string;
    url?: string;
    position: string;
    size: string;
  };
  content?: {
    title: string;
    subtitle: string;
    button: {
      text: string;
      url: string;
      style: string;
    };
  };
}

export function HeroBlock({ settings = {}, background = {}, content = {} }: HeroBlockProps) {
  const {
    height = '600px',
    alignment = 'center',
    overlay = false,
    overlayColor = 'rgba(0,0,0,0.5)'
  } = settings;

  const {
    type = 'color',
    url = '',
    position = 'center',
    size = 'cover'
  } = background;

  const {
    title = '',
    subtitle = '',
    button = { text: '', url: '#', style: 'primary' }
  } = content;

  const style = {
    height,
    backgroundImage: type === 'image' ? `url(${url})` : undefined,
    backgroundPosition: position,
    backgroundSize: size,
    position: 'relative' as const
  };

  return (
    <div style={style} className="relative flex items-center justify-center">
      {overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />
      )}
      <div className={`relative z-10 text-center text-white max-w-4xl mx-auto px-4`}>
        <h1 className="text-5xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8">{subtitle}</p>
        {button.text && (
          <a
            href={button.url}
            className={`inline-block px-8 py-3 rounded-lg font-medium transition-colors ${
              button.style === 'primary'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-white text-gray-900 hover:bg-gray-100'
            }`}
          >
            {button.text}
          </a>
        )}
      </div>
    </div>
  );
}