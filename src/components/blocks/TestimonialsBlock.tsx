import React, { useState, useEffect } from 'react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  image: string;
  text: string;
}

interface TestimonialsBlockProps {
  settings: {
    autoplay: boolean;
    interval: number;
  };
  items: Testimonial[];
}

export function TestimonialsBlock({ settings, items }: TestimonialsBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (settings.autoplay && items.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((current) => (current + 1) % items.length);
      }, settings.interval);

      return () => clearInterval(interval);
    }
  }, [settings.autoplay, settings.interval, items.length]);

  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {items.map((item, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <div className="text-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <blockquote className="text-xl italic text-gray-900 mb-4">
                  "{item.text}"
                </blockquote>
                <div className="font-medium">
                  <cite className="text-gray-900 not-italic">{item.name}</cite>
                  <p className="text-gray-600">
                    {item.role} at {item.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
