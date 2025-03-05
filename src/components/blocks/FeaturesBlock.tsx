import React from 'react';
import * as Icons from 'lucide-react';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesBlockProps {
  settings: {
    columns: number;
    gap: string;
  };
  items: Feature[];
}

export function FeaturesBlock({ settings, items }: FeaturesBlockProps) {
  return (
    <div className="py-16 px-4">
      <div
        className="grid max-w-6xl mx-auto"
        style={{
          gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))`,
          gap: settings.gap
        }}
      >
        {items.map((item, index) => {
          const Icon = (Icons as any)[item.icon] || Icons.Star;
          return (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-100">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}