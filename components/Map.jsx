import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ markers, onMapClick, center }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center || [0, 0], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Real-Time Tracker'
      }).addTo(mapInstanceRef.current);

      // Add click handler if provided
      if (onMapClick) {
        mapInstanceRef.current.on('click', onMapClick);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, onMapClick]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Remove old markers
      Object.values(markersRef.current).forEach(marker => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = {};

      // Add new markers
      Object.entries(markers).forEach(([id, { latitude, longitude }]) => {
        const marker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
        markersRef.current[id] = marker;
      });

      // Center map on latest marker if available
      const markerIds = Object.keys(markers);
      if (markerIds.length > 0) {
        const latestMarker = markers[markerIds[markerIds.length - 1]];
        mapInstanceRef.current.setView([latestMarker.latitude, latestMarker.longitude]);
      }
    }
  }, [markers]);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;
