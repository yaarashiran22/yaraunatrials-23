import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const TelAvivMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoidGVsYXZpdm1hcCIsImEiOiJjbTNqOXIxZWIwMWNhMmtyMnB5c3M4bnZ6In0.VQH7zJmSrQZNb5_rSqZ8qA';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [34.7818, 32.0853], // Tel Aviv coordinates
      zoom: 12,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add markers for popular locations in Tel Aviv
    const locations = [
      {
        name: 'דיזינגוף סנטר',
        coordinates: [34.7740, 32.0740],
        color: '#BB31E9'
      },
      {
        name: 'שוק הכרמל',
        coordinates: [34.7692, 32.0663],
        color: '#FF6B6B'
      },
      {
        name: 'נמל תל אביב',
        coordinates: [34.7517, 32.1066],
        color: '#4ECDC4'
      },
      {
        name: 'יפו העתיקה',
        coordinates: [34.7520, 32.0545],
        color: '#45B7D1'
      },
      {
        name: 'רוטשילד',
        coordinates: [34.7692, 32.0663],
        color: '#96CEB4'
      }
    ];

    // Add markers
    locations.forEach(location => {
      // Create a custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${location.color};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<div style="text-align: center; font-family: 'Inter', sans-serif; padding: 8px;">
          <strong style="color: #333; font-size: 14px;">${location.name}</strong>
        </div>`);

      // Add marker to map
      new mapboxgl.Marker(markerEl)
        .setLngLat(location.coordinates as [number, number])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm border bg-card">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};

export default TelAvivMap;