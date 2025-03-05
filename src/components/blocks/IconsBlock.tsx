import React from 'react';
import * as Icons from 'lucide-react';

interface IconItem {
  icon: string;
  label: string;
}

interface IconsBlockProps {
  settings?: {
    size?: number;
    color?: string;
    layout?: 'horizontal' | 'vertical';
    spacing?: string;
    alignment?: string;
  };
  items?: IconItem[];
}

export function IconsBlock({ settings = {}, items = [] }: IconsBlockProps) {
  const {
    size = 48,
    color = 'blue-600',
    layout = 'horizontal',
    spacing = '2rem',
    alignment = 'center'
  } = settings;

  return (
    <div
      className={`flex ${
        layout === 'horizontal' ? 'flex-row' : 'flex-col'
      } items-${alignment} justify-center`}
      style={{ gap: spacing }}
    >
      {items.map((item, index) => {
        const Icon = (Icons as any)[item.icon] || Icons.HelpCircle;
        return (
          <div
            key={index}
            className={`flex ${
              layout === 'horizontal' ? 'flex-col' : 'flex-row'
            } items-center space-${layout === 'horizontal' ? 'y' : 'x'}-2`}
          >
            <Icon
              size={size}
              className={`text-${color}`}
            />
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
