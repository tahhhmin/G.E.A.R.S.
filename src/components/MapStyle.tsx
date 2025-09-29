'use client';

import { useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Button from '@/components/common/button/Button';

interface MapStyleProps {
  map: mapboxgl.Map | null;
}

type MapStyleOption = {
  name: string;
  url: string;
  icon: string;
};

const mapStyles: MapStyleOption[] = [
  {
    name: 'Dark',
    url: 'mapbox://styles/mapbox/dark-v11',
    icon: 'Moon',
  },
  {
    name: 'Light',
    url: 'mapbox://styles/mapbox/light-v11',
    icon: 'Sun',
  },
  {
    name: 'Streets',
    url: 'mapbox://styles/mapbox/streets-v12',
    icon: 'Map',
  },
  {
    name: 'Satellite',
    url: 'mapbox://styles/mapbox/satellite-v9',
    icon: 'Satellite',
  },
  {
    name: 'Satellite Streets',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: 'Globe',
  },
  {
    name: 'Outdoors',
    url: 'mapbox://styles/mapbox/outdoors-v12',
    icon: 'Trees',
  },
];

export default function MapStyle({ map }: MapStyleProps) {
  const [currentStyle, setCurrentStyle] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const changeStyle = (index: number) => {
    if (!map) return;
    
    map.setStyle(mapStyles[index].url);
    setCurrentStyle(index);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Button
        variant="secondary"
        size="medium"
        label={`Style: ${mapStyles[currentStyle].name}`}
        showIcon={true}
        icon={mapStyles[currentStyle].icon}
        onClick={() => setIsOpen(!isOpen)}
        disabled={!map}
        aria-label="Change map style"
      />
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {mapStyles.map((style, index) => (
            <button
              key={style.name}
              onClick={() => changeStyle(index)}
              style={{
                padding: '8px 12px',
                background: currentStyle === index ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: 'white',
                border: '1px solid',
                borderColor: currentStyle === index ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                if (currentStyle !== index) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (currentStyle !== index) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {style.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}