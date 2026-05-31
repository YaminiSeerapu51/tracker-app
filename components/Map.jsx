import { useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = ({ markers, onMapClick, center }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const onMapClickRef = useRef(onMapClick);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center || [0, 0], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Real-Time Tracker'
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on('click', (event) => {
        onMapClickRef.current?.(event);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      Object.values(markersRef.current).forEach((marker) => {
        mapInstanceRef.current.removeLayer(marker);
      });
      markersRef.current = {};

      Object.entries(markers).forEach(([id, { latitude, longitude }]) => {
        if (latitude == null || longitude == null) return;
        const marker = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
        markersRef.current[id] = marker;
      });

      const markerIds = Object.keys(markers);
      if (markerIds.length > 0) {
        const latestMarker = markers[markerIds[markerIds.length - 1]];
        if (latestMarker.latitude != null && latestMarker.longitude != null) {
          mapInstanceRef.current.setView([latestMarker.latitude, latestMarker.longitude]);
        }
      }
    }
  }, [markers]);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Map;
