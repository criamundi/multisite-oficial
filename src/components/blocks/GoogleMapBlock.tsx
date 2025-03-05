import React from 'react';

interface GoogleMapBlockProps {
  settings: {
    height: string;
    zoom: number;
    showControls: boolean;
    allowFullscreen: boolean;
  };
  content: {
    address: string;
    lat: number;
    lng: number;
  };
}

export function GoogleMapBlock({ settings, content }: GoogleMapBlockProps) {
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
    content.address
  )}&zoom=${settings.zoom}`;

  return (
    <div className="w-full">
      <iframe
        width="100%"
        height={settings.height}
        style={{ border: 0 }}
        loading="lazy"
        src={mapUrl}
        allowFullScreen={settings.allowFullscreen}
      />
    </div>
  );
}