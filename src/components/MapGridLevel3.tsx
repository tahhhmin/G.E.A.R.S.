'use client';

import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Button from '@/components/common/button/Button';

interface MapGridLevel3Props {
  map: mapboxgl.Map | null;
  gridColor?: string;
  gridOpacity?: number;
  onGridClick?: (data: GridCellData) => void;
}

interface GridCellData {
  longitude: number;
  latitude: number;
  cellBounds: [[number, number], [number, number]];
}

export default function MapGridLevel3({
  map,
  gridColor = '#00ff00',
  gridOpacity = 0.3,
  onGridClick,
}: MapGridLevel3Props) {
  const [showGrid, setShowGrid] = useState(false);
  const [selectedCell, setSelectedCell] = useState<GridCellData | null>(null);
  const [no2Data, setNo2Data] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [gridSource] = useState<string>('tempo-grid-source');
  const [gridLayer] = useState<string>('tempo-grid-layer');
  const [cellsSource] = useState<string>('tempo-cells-source');
  const [cellsLayer] = useState<string>('tempo-cells-layer');

  // TEMPO Level 3 grid specifications
  const minLon = -155;
  const maxLon = -24.5;
  const minLat = 17.2;
  const maxLat = 63.55;
  const gridResolution = 0.02;

  // Fetch NO2 data for a grid cell
  const fetchNO2Data = async (lon: number, lat: number) => {
    setLoading(true);
    try {
      // Note: This is a placeholder. In production, you would:
      // 1. Use NASA Earthdata API with authentication
      // 2. Or use Google Earth Engine API
      // 3. Or pre-download and host the data
      
      // Simulated API call
      const response = await fetch('/api/tempo-no2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ longitude: lon, latitude: lat }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setNo2Data(data.no2_troposphere);
      } else {
        // Fallback: Generate mock data for demonstration
        const mockNO2 = Math.random() * 5e15 + 5e14;
        setNo2Data(mockNO2);
      }
    } catch (error) {
      console.error('Error fetching NO2 data:', error);
      // Mock data for demo
      const mockNO2 = Math.random() * 5e15 + 5e14;
      setNo2Data(mockNO2);
    } finally {
      setLoading(false);
    }
  };

  // Handle map click
  useEffect(() => {
    if (!map || !showGrid) return;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      
      // Check if click is within TEMPO coverage
      if (lng < minLon || lng > maxLon || lat < minLat || lat > maxLat) {
        return;
      }

      // Snap to grid
      const cellLon = Math.floor(lng / gridResolution) * gridResolution;
      const cellLat = Math.floor(lat / gridResolution) * gridResolution;

      const cellData: GridCellData = {
        longitude: cellLon + gridResolution / 2,
        latitude: cellLat + gridResolution / 2,
        cellBounds: [
          [cellLon, cellLat],
          [cellLon + gridResolution, cellLat + gridResolution],
        ],
      };

      setSelectedCell(cellData);
      onGridClick?.(cellData);
      fetchNO2Data(cellData.longitude, cellData.latitude);

      // Highlight selected cell
      if (map.getSource(cellsSource)) {
        (map.getSource(cellsSource) as mapboxgl.GeoJSONSource).setData({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [cellData.cellBounds[0][0], cellData.cellBounds[0][1]],
                [cellData.cellBounds[1][0], cellData.cellBounds[0][1]],
                [cellData.cellBounds[1][0], cellData.cellBounds[1][1]],
                [cellData.cellBounds[0][0], cellData.cellBounds[1][1]],
                [cellData.cellBounds[0][0], cellData.cellBounds[0][1]],
              ],
            ],
          },
          properties: {},
        } as any);
      }
    };

    map.on('click', handleClick);
    map.getCanvas().style.cursor = 'crosshair';

    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, showGrid]);

  // Add grid to map
  useEffect(() => {
    if (!map || !showGrid) return;

    const addGridToMap = () => {
      // Remove existing layers
      if (map.getLayer(gridLayer)) map.removeLayer(gridLayer);
      if (map.getLayer(cellsLayer)) map.removeLayer(cellsLayer);
      if (map.getSource(gridSource)) map.removeSource(gridSource);
      if (map.getSource(cellsSource)) map.removeSource(cellsSource);

      // Add grid lines (simplified - only show every 10th line for performance)
      const features: any[] = [];
      const step = gridResolution * 10;

      for (let lon = minLon; lon <= maxLon; lon += step) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[lon, minLat], [lon, maxLat]],
          },
        });
      }

      for (let lat = minLat; lat <= maxLat; lat += step) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[minLon, lat], [maxLon, lat]],
          },
        });
      }

      map.addSource(gridSource, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features } as any,
      });

      map.addLayer({
        id: gridLayer,
        type: 'line',
        source: gridSource,
        paint: {
          'line-color': gridColor,
          'line-width': 0.5,
          'line-opacity': gridOpacity,
        },
      });

      // Add selected cell layer
      map.addSource(cellsSource, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as any,
      });

      map.addLayer({
        id: cellsLayer,
        type: 'fill',
        source: cellsSource,
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.3,
        },
      });
    };

    if (map.isStyleLoaded()) {
      addGridToMap();
    } else {
      map.on('load', addGridToMap);
    }

    return () => {
      if (map.getLayer(gridLayer)) map.removeLayer(gridLayer);
      if (map.getLayer(cellsLayer)) map.removeLayer(cellsLayer);
      if (map.getSource(gridSource)) map.removeSource(gridSource);
      if (map.getSource(cellsSource)) map.removeSource(cellsSource);
    };
  }, [map, showGrid, gridColor, gridOpacity]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Button
        variant="secondary"
        size="medium"
        label={showGrid ? 'Hide TEMPO Grid' : 'Show TEMPO Grid'}
        showIcon={true}
        icon="Grid3x3"
        onClick={() => {
          setShowGrid(!showGrid);
          setSelectedCell(null);
          setNo2Data(null);
        }}
        disabled={!map}
        aria-label="Toggle TEMPO Level 3 grid"
      />

      {showGrid && selectedCell && (
        <div
          style={{
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
            Selected Grid Cell
          </div>
          <div style={{ fontSize: '13px', color: 'white', marginBottom: '4px' }}>
            <strong>Lat:</strong> {selectedCell.latitude.toFixed(4)}°
          </div>
          <div style={{ fontSize: '13px', color: 'white', marginBottom: '8px' }}>
            <strong>Lon:</strong> {selectedCell.longitude.toFixed(4)}°
          </div>
          
          {loading ? (
            <div style={{ fontSize: '13px', color: '#3b82f6' }}>Loading NO₂ data...</div>
          ) : no2Data !== null ? (
            <>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                Tropospheric NO₂
              </div>
              <div style={{ fontSize: '18px', color: '#3b82f6', fontWeight: 'bold' }}>
                {no2Data.toExponential(2)}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>
                molecules/cm²
              </div>
            </>
          ) : null}
        </div>
      )}

      {showGrid && !selectedCell && (
        <div
          style={{
            padding: '10px',
            fontSize: '12px',
            color: '#888',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          Click any grid cell to view NO₂ data
        </div>
      )}
    </div>
  );
}