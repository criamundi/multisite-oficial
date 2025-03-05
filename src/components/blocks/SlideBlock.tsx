import React, { useState, useRef } from 'react';
import { Trash2, GripVertical } from 'lucide-react';

interface Slide {
  id: string;
  image_url: string;
  title: string;
  subtitle?: string;
  button_text?: string;
  button_url?: string;
}

interface SlideBlockProps {
  settings: {
    height: string;
    autoplay: boolean;
    interval: number;
    overlay: boolean;
    overlayColor: string;
  };
  slides: Slide[];
  onUpdate?: (slides: Slide[]) => void;
  isEditing?: boolean;
}

export function SlideBlock({ settings, slides, onUpdate, isEditing = false }: SlideBlockProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [draggedSlide, setDraggedSlide] = useState<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  React.useEffect(() => {
    if (settings.autoplay && slides.length > 1 && !isEditing) {
      const interval = setInterval(() => {
        setCurrentSlide((current) => (current + 1) % slides.length);
      }, settings.interval);

      return () => clearInterval(interval);
    }
  }, [settings.autoplay, settings.interval, slides.length, isEditing]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const handleDeleteSlide = (index: number) => {
    if (!onUpdate) return;
    
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    onUpdate(newSlides);

    if (currentSlide >= newSlides.length) {
      setCurrentSlide(Math.max(0, newSlides.length - 1));
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedSlide(index);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedSlide(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedSlide === null || draggedSlide === index) return;

    const draggedRect = slideRefs.current[draggedSlide]?.getBoundingClientRect();
    const targetRect = slideRefs.current[index]?.getBoundingClientRect();
    
    if (!draggedRect || !targetRect) return;

    const draggedCenterY = draggedRect.top + draggedRect.height / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    if (draggedCenterY < targetCenterY && draggedSlide < index) return;
    if (draggedCenterY > targetCenterY && draggedSlide > index) return;

    // Reordenar slides
    const newSlides = [...slides];
    const [removed] = newSlides.splice(draggedSlide, 1);
    newSlides.splice(index, 0, removed);
    
    setDraggedSlide(index);
    if (onUpdate) {
      onUpdate(newSlides);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className="relative overflow-hidden"
        style={{ height: settings.height || '500px' }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            style={{
              backgroundImage: `url(${slide.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {settings.overlay && (
              <div 
                className="absolute inset-0"
                style={{ backgroundColor: settings.overlayColor }}
              />
            )}
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white z-20 px-4">
                <h2 className="text-4xl font-bold mb-4">{slide.title}</h2>
                {slide.subtitle && (
                  <p className="text-xl mb-8">{slide.subtitle}</p>
                )}
                {slide.button_text && slide.button_url && (
                  <a
                    href={slide.button_url}
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {slide.button_text}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <button
              onClick={previousSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              ‹
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition-colors"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lista de slides para edição */}
      {isEditing && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Gerenciar Slides</h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  ref={el => slideRefs.current[index] = el}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={e => handleDragOver(e, index)}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg cursor-move"
                >
                  <div className="text-gray-400 cursor-grab">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{slide.title}</p>
                        {slide.subtitle && (
                          <p className="text-sm text-gray-600">{slide.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSlide(index)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Excluir slide"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}