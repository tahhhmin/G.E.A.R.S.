'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

interface MapboxMapProps {
    initialCenter?: [number, number];
    initialZoom?: number;
    mapStyle?: string;
    className?: string;
    onMapLoad?: (map: mapboxgl.Map) => void;  // Add this line
}

export default function MapboxMap({
    initialCenter = [-74.5, 40],
    initialZoom = 9,
    mapStyle = 'mapbox://styles/mapbox/dark-v11',
    className = '',
    onMapLoad,  // Add this parameter
}: MapboxMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (map.current) return;
        if (!mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapStyle,
            center: initialCenter,
            zoom: initialZoom,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add these lines
        if (onMapLoad) {
            onMapLoad(map.current);
        }

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    return <div ref={mapContainer} className={className} />;
}