import React from 'react';
import * as Icons from 'lucide-react';

interface DividerBlockProps {
  settings?: {
    style?: string;
    color?: string;
    width?: string;
    height?: string;
    margin?: string;
    showIcon?: boolean;
    icon?: string;
  };
}

export function DividerBlock({ settings = {} }: DividerBlockProps) {
  const {
    style = 'solid',
    color = 'gray-200',
    width = '100%',
    height = '1px',
    margin = '2rem',
    showIcon = false,
    icon = 'Star'
  } = settings;

  const Icon = showIcon ? (Icons as any)[icon] : null;

  return (
    <div
      className="flex items-center justify-center"
      style={{ margin }}
    >
      <div
        className={`bg-${color}`}
        style={{
          width,
          height,
          borderStyle: style
        }}
      />
      {showIcon && Icon && (
        <div className={`mx-4 text-${color}`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}