import React from 'react';
import * as Icons from 'lucide-react';

interface FooterBlockProps {
  settings: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    columns: number;
  };
  content: {
    logo: {
      icon: string;
      text: string;
    };
    description: string;
    copyright: string;
    columns: Array<{
      title: string;
      items: Array<{
        label?: string;
        url?: string;
        icon?: string;
        text?: string;
      }>;
    }>;
  };
}

export function FooterBlock({ settings, content }: FooterBlockProps) {
  const LogoIcon = (Icons as any)[content.logo.icon] || Icons.Activity;

  return (
    <footer className={`bg-${settings.backgroundColor} text-${settings.textColor}`} style={{ padding: settings.padding }}>
      <div className="container mx-auto">
        <div className={`grid grid-cols-1 md:grid-cols-${settings.columns} gap-8`}>
          {/* Logo e Descrição */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <LogoIcon className="w-8 h-8" />
              <span className="text-xl font-bold">{content.logo.text}</span>
            </div>
            <p className="text-sm opacity-80 mb-4">{content.description}</p>
          </div>

          {/* Colunas de Links */}
          {content.columns.map((column, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.items.map((item, itemIndex) => {
                  const ItemIcon = item.icon ? (Icons as any)[item.icon] : null;
                  return (
                    <li key={itemIndex}>
                      {item.url ? (
                        <a
                          href={item.url}
                          className="hover:opacity-80 transition-opacity inline-flex items-center space-x-2"
                        >
                          {ItemIcon && <ItemIcon className="w-4 h-4" />}
                          <span>{item.label}</span>
                        </a>
                      ) : (
                        <div className="inline-flex items-center space-x-2">
                          {ItemIcon && <ItemIcon className="w-4 h-4" />}
                          <span>{item.text}</span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-opacity-10 mt-8 pt-8 text-sm text-center">
          {content.copyright}
        </div>
      </div>
    </footer>
  );
}