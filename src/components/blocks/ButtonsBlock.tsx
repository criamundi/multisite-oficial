import React from 'react';
import * as Icons from 'lucide-react';

interface ButtonItem {
  text: string;
  url: string;
  style: 'primary' | 'secondary';
  icon?: string;
  iconPosition?: 'left' | 'right';
}

interface ButtonsBlockProps {
  settings?: {
    layout?: 'horizontal' | 'vertical';
    spacing?: string;
    alignment?: string;
  };
  items?: ButtonItem[];
}

export function ButtonsBlock({ settings = {}, items = [] }: ButtonsBlockProps) {
  const {
    layout = 'horizontal',
    spacing = '1rem',
    alignment = 'center'
  } = settings;

  return (
    <div
      className={`flex ${
        layout === 'horizontal' ? 'flex-row' : 'flex-col'
      } items-${alignment} justify-center flex-wrap`}
      style={{ gap: spacing }}
    >
      {items.map((item, index) => {
        const Icon = item.icon ? (Icons as any)[item.icon] : null;
        const buttonClass = `
          inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors
          ${
            item.style === 'primary'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }
        `;

        return (
          <a
            key={index}
            href={item.url}
            className={buttonClass}
          >
            {item.icon && item.iconPosition === 'left' && Icon && (
              <Icon className="w-5 h-5 mr-2" />
            )}
            {item.text}
            {item.icon && item.iconPosition === 'right' && Icon && (
              <Icon className="w-5 h-5 ml-2" />
            )}
          </a>
        );
      })}
    </div>
  );
}
