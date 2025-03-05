import React from 'react';

interface ColumnItem {
  title: string;
  content: string;
}

interface ColumnsBlockProps {
  settings?: {
    columns?: number;
    gap?: string;
    padding?: string;
    alignment?: string;
  };
  items?: ColumnItem[];
}

export function ColumnsBlock({ settings = {}, items = [] }: ColumnsBlockProps) {
  const {
    columns = 2,
    gap = '2rem',
    padding = '2rem',
    alignment = 'stretch'
  } = settings;

  const containerStyle = {
    padding,
    gap,
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    alignItems: alignment
  };

  return (
    <div className="w-full">
      <div
        className="grid"
        style={containerStyle}
      >
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
            <div className="prose">{item.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
