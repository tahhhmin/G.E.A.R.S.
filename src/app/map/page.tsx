'use client';

import React, { useState } from 'react'
import styles from './page.module.css'
import MapboxMap from '@/components/Map';
import UserLocator from '@/components/UserLocator';
import MapGridLevel3 from '@/components/MapGridLevel3';
import MapStyle from '@/components/MapStyle';

export default function Page() {
    const [map, setMap] = useState<mapboxgl.Map | null>(null);

    return (
        <main className={styles.main}>
            <div className={styles.controlPanel}>
                <UserLocator 
                    map={map}
                    showButton={true}
                    onLocationFound={(coords) => {
                        console.log('User location:', coords);
                    }}
                    onLocationError={(error) => {
                        console.error('Location error:', error.message);
                    }}
                />
                <MapGridLevel3 
                    map={map}
                    gridColor="#FAFAFA"
                    gridOpacity={0.3}
                />
                <MapStyle map={map} />
            </div>
            <MapboxMap 
                initialCenter={[-74.5, 40]} 
                initialZoom={9}
                className={styles.mapContainer}
                onMapLoad={setMap}
            />
        </main>
    )
}