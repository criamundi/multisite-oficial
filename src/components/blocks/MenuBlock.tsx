import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  isAnchor?: boolean;
}

interface MenuBlockProps {
  settings: {
    position: 'top' | 'left' | 'right';
    style: 'fixed' | 'absolute';
    backgroundColor: string;
    textColor: string;
    hoverColor: string;
    alignment: 'left' | 'center' | 'right';
    logo?: {
      url: string;
      height: string;
    };
  };
  items: MenuItem[];
  siteId?: string;
}

interface SitePage {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
}

export function MenuBlock({ settings, items: defaultItems, siteId }: MenuBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [items, setItems] = useState(defaultItems);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (siteId) {
      loadPages();
    }
  }, [siteId]);

  useEffect(() => {
    // Combinar itens padrão com páginas do site
    const pageItems = pages
      .filter(page => page.is_published)
      .map(page => ({
        id: page.id,
        label: page.title,
        url: `/sites/${siteId}/p/${page.slug}`,
        isAnchor: false
      }));

    setItems([...defaultItems, ...pageItems]);
  }, [defaultItems, pages]);

  const loadPages = async () => {
    try {
      const { data: sitePages, error } = await supabase
        .from('site_pages')
        .select('id, title, slug, is_published')
        .eq('site_id', siteId)
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPages(sitePages || []);
    } catch (err) {
      console.error('Erro ao carregar páginas:', err);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: MenuItem) => {
    if (item.isAnchor) {
      e.preventDefault();
      const element = document.querySelector(item.url);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      setIsOpen(false);
    }
  };

  const menuStyle = {
    backgroundColor: settings.backgroundColor || 'white',
    color: settings.textColor || 'black',
    position: settings.style as 'fixed' | 'absolute',
    top: 0,
    [settings.position === 'left' ? 'left' : settings.position === 'right' ? 'right' : 'left']: 0,
    width: settings.position === 'top' ? '100%' : '300px',
    height: settings.position === 'top' ? 'auto' : '100vh',
    zIndex: 50,
    transition: 'all 0.3s ease',
    boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
  };

  const mobileMenuStyle = {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: settings.backgroundColor || 'white',
    zIndex: 50,
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease',
  };

  const linkContainerStyle = {
    textAlign: settings.alignment || 'left',
  } as React.CSSProperties;

  const linkStyle = {
    color: settings.textColor,
    transition: 'color 0.3s ease',
    ':hover': {
      color: settings.hoverColor,
    },
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav
        className="hidden lg:block"
        style={menuStyle}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {settings.logo?.url && (
              <a href="/">
                <img
                  src={settings.logo.url}
                  alt="Logo"
                  style={{ height: settings.logo.height || '32px' }}
                  className="object-contain"
                />
              </a>
            )}
            <div className="flex-1" style={linkContainerStyle}>
              <div className={`flex items-center space-x-8 ${
                settings.alignment === 'center' ? 'justify-center' :
                settings.alignment === 'right' ? 'justify-end' :
                'justify-start'
              }`}>
                {items.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    onClick={(e) => handleClick(e, item)}
                    style={linkStyle}
                    className="hover:text-[var(--hover-color)] transition-colors"
                    style={{ '--hover-color': settings.hoverColor } as any}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      <div
        className="lg:hidden"
        style={mobileMenuStyle}
      >
        <div className="p-4">
          {settings.logo?.url && (
            <a href="/">
              <img
                src={settings.logo.url}
                alt="Logo"
                style={{ height: settings.logo.height || '32px' }}
                className="object-contain mb-8"
              />
            </a>
          )}
          <div className="flex flex-col space-y-4">
            {items.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={(e) => handleClick(e, item)}
                style={linkStyle}
                className="hover:text-[var(--hover-color)] transition-colors py-2"
                style={{ '--hover-color': settings.hoverColor } as any}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
