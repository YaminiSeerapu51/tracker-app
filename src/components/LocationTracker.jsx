import { useState, useEffect } from 'react';
import socket from '../SocketConnect/socket';
import { saveLocationHistory } from '../SocketConnect/api';
import { auth } from '../SocketConnect/auth';
import { getGeolocationErrorMessage } from '../utils/geolocationErrors';

const LocationTracker = ({ onLocationUpdate, onError, trackingEnabled }) => {
  const [locationStatus, setLocationStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [rateLimitWarning, setRateLimitWarning] = useState(null);

  useEffect(() => {
    let watchId = null;

    const handleRateLimit = (data) => {
      setRateLimitWarning(data.message);
      setTimeout(() => setRateLimitWarning(null), data.retryAfter * 1000);
    };

    socket.on('rateLimitExceeded', handleRateLimit);

    const startTracking = () => {
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        const msg = 'Location requires HTTPS. Open the app via your Vercel https:// URL.';
        setError(msg);
        setLocationStatus('error');
        onError?.(msg);
        return;
      }

      if (!navigator.geolocation) {
        const msg = 'Geolocation is not supported by your browser.';
        setError(msg);
        setLocationStatus('error');
        onError?.(msg);
        return;
      }

      if (!socket.connected) {
        const msg = 'Waiting for server connection. Connect first, then start tracking.';
        setError(msg);
        setLocationStatus('error');
        onError?.(msg);
        return;
      }

      setLocationStatus('tracking');
      setError(null);

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationStatus('success');
          setError(null);

          if (socket.connected) {
            socket.emit('sendLocation', {
              latitude,
              longitude,
              userId: auth.getUser()?.id
            });
          }

          onLocationUpdate?.({ latitude, longitude });

          try {
            await saveLocationHistory({
              latitude,
              longitude,
              timestamp: new Date().toISOString()
            });
          } catch (apiError) {
            console.error('Failed to save location history:', apiError);
          }
        },
        (err) => {
          const msg = getGeolocationErrorMessage(err);
          console.error('Error getting location:', err);
          setError(msg);
          setLocationStatus('error');
          onError?.(msg);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 15000
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
      socket.off('rateLimitExceeded', handleRateLimit);
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
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      maxWidth: '280px'
    }}>
      <h3 style={{ margin: '0 0 8px' }}>Location Status</h3>
      <p style={{ margin: '0 0 4px' }}>Status: {locationStatus}</p>
      <p style={{ margin: '0 0 4px' }}>Tracking: {trackingEnabled ? 'Enabled' : 'Disabled'}</p>
      {error && (
        <p style={{ color: '#c33', fontSize: '13px', margin: '8px 0 0' }}>{error}</p>
      )}
      {rateLimitWarning && (
        <p style={{ color: 'orange', fontSize: '13px', margin: '8px 0 0' }}>
          {rateLimitWarning}
        </p>
      )}
    </div>
  );
};

export default LocationTracker;
