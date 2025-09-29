'use client';

import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Button from '@/components/common/button/Button';

interface UserLocatorProps {
  map: mapboxgl.Map | null;
  showButton?: boolean;
  trackUser?: boolean;
  onLocationFound?: (coords: [number, number]) => void;
  onLocationError?: (error: GeolocationPositionError) => void;
}

export default function UserLocator({
  map,
  showButton = true,
  trackUser = false,
  onLocationFound,
  onLocationError,
}: UserLocatorProps) {
  const [locating, setLocating] = useState(false);
  const [marker, setMarker] = useState<mapboxgl.Marker | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const locateUser = () => {
    if (!map || !navigator.geolocation) return;

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const coords: [number, number] = [longitude, latitude];

        // Fly to user location
        map.flyTo({
          center: coords,
          zoom: 14,
          essential: true,
        });

        // Add or update marker
        if (marker) {
          marker.setLngLat(coords);
        } else {
          const newMarker = new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat(coords)
            .addTo(map);
          setMarker(newMarker);
        }

        setLocating(false);
        onLocationFound?.(coords);
      },
      (error) => {
        setLocating(false);
        onLocationError?.(error);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Track user location continuously
  useEffect(() => {
    if (!trackUser || !map || !navigator.geolocation) return;

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const coords: [number, number] = [longitude, latitude];

        if (marker) {
          marker.setLngLat(coords);
        } else {
          const newMarker = new mapboxgl.Marker({ color: '#3b82f6' })
            .setLngLat(coords)
            .addTo(map);
          setMarker(newMarker);
        }

        onLocationFound?.(coords);
      },
      (error) => {
        onLocationError?.(error);
        console.error('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    setWatchId(id);

    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [trackUser, map]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (marker) {
        marker.remove();
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (!showButton) return null;

    return (
        <Button
        variant="primary"
        size="medium"
        label={locating ? 'Locating...' : 'Find My Location'}
        showIcon={true}
        icon="MapPinned"
        loading={locating}
        disabled={!map}
        onClick={locateUser}
        aria-label="Locate my position on map"
        />
    );
}