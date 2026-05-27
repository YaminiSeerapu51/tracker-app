import { useState, useEffect } from 'react';
import socket from '../SocketConnect/socket';
import { saveLocationHistory } from '../SocketConnect/api';

const LocationTracker = ({ onLocationUpdate, onError, trackingEnabled }) => {
  const [locationStatus, setLocationStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => {
    let watchId = null;

    const startTracking = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        setLocationStatus('error');
        onError && onError('Geolocation is not supported by your browser');
        return;
      }

      setLocationStatus('tracking');

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationStatus('success');
          setError(null);

          // Emit location via Socket.IO
          socket.emit('sendLocation', { latitude, longitude });

          // Call the callback with location update
          onLocationUpdate && onLocationUpdate({ latitude, longitude });

          // Save to API (demonstrating API fetching)
          try {
            await saveLocationHistory({ latitude, longitude, timestamp: new Date().toISOString() });
          } catch (apiError) {
            console.error('Failed to save location history:', apiError);
          }
        },
        (err) => {
          console.error('Error getting location:', err);
          setError(err.message);
          setLocationStatus('error');
          onError && onError(err.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    };

    const stopTracking = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      setLocationStatus('idle');
    };

    if (trackingEnabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [trackingEnabled, onLocationUpdate, onError]);

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <h3>Location Status</h3>
      <p>Status: {locationStatus}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <p>Tracking: {trackingEnabled ? 'Enabled' : 'Disabled'}</p>
    </div>
  );
};

export default LocationTracker;
