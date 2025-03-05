import React from 'react';

interface RichTextBlockProps {
  settings: {
    maxWidth: string;
    alignment: string;
    padding: string;
  };
  content: {
    title: string;
    subtitle?: string;
    text: string;
  };
}

export function RichTextBlock({ settings, content }: RichTextBlockProps) {
  const containerStyle = {
    maxWidth: settings.maxWidth,
    padding: settings.padding,
    textAlign: settings.alignment as any
  };

  return (
    <div className="w-full" style={containerStyle}>
      {content.title && (
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h2>
      )}
      {content.subtitle && (
        <h3 className="text-xl text-gray-600 mb-6">{content.subtitle}</h3>
      )}
      <div className="prose prose-lg max-w-none">
        {content.text}
      </div>
    </div>
  );
}