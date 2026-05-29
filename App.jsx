import { useState, useEffect } from 'react';
import Map from './components/Map';
import LocationTracker from './components/LocationTracker';
import ConnectionStatus from './components/ConnectionStatus';
import UserList from './components/UserList';
import Login from './components/Login';
import socket from './SocketConnect/socket';
import { connectAuthenticatedSocket, disconnectAuthenticatedSocket } from './SocketConnect/authenticatedSocket';
import { auth } from './SocketConnect/auth';

function App() {
  // Application state
  const [markers, setMarkers] = useState({});
  const [users, setUsers] = useState([]);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication on load
  useEffect(() => {
    setCurrentUser(auth.getUser());
    setLoading(false);
  }, []);

  // Handle successful login
  const handleLoginSuccess = async (username, password) => {
    try {
      setError(null);
      await auth.login(username, password);
      setCurrentUser(auth.getUser());
    } catch (err) {
      setError(err.error || 'Login failed');
    }
  };

  // Handle logout
  const handleLogout = () => {
    auth.logout();
    setCurrentUser(null);
    setMarkers({});
    setUsers([]);
    setTrackingEnabled(false);
    setCurrentLocation(null);
    setError(null);
  };

  // Socket connection (only when authenticated)
  useEffect(() => {
    if (!auth.isAuthenticated()) return;

    connectAuthenticatedSocket();

    const handleLocationUpdate = (data) => {
      const { id, latitude, longitude, username } = data;
      setMarkers(prev => ({
        ...prev,
        [id]: { latitude, longitude, username }
      }));

      setUsers(prev => {
        const exists = prev.some(u => u.id === id);
        if (!exists) {
          return [...prev, { id, latitude, longitude, username }];
        }
        return prev.map(u => 
          u.id === id ? { ...u, latitude, longitude } : u
        );
      });
    };

    const handleUserDisconnected = (data) => {
      const { id } = data;
      setMarkers(prev => {
        const newMarkers = { ...prev };
        delete newMarkers[id];
        return newMarkers;
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    };

    socket.on('locationUpdate', handleLocationUpdate);
    socket.on('userDisconnected', handleUserDisconnected);

    return () => {
      socket.off('locationUpdate', handleLocationUpdate);
      socket.off('userDisconnected', handleUserDisconnected);
      disconnectAuthenticatedSocket();
    };
  }, []);

  const handleToggleTracking = () => {
    setTrackingEnabled(prev => !prev);
  };

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    console.log('Map clicked at:', lat, lng);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      <Map 
        markers={markers} 
        onMapClick={handleMapClick}
        center={currentLocation ? [currentLocation.latitude, currentLocation.longitude] : [0, 0]}
      />
      
      <ConnectionStatus />
      
      <LocationTracker 
        onLocationUpdate={handleLocationUpdate}
        onError={handleError}
        trackingEnabled={trackingEnabled}
      />
      
      <UserList users={users} />

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        marginTop: '200px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        minWidth: '200px'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>Controls</h3>
        
        <div style={{ marginBottom: '15px', fontSize: '14px', color: '#666' }}>
          User: {currentUser?.username || 'Anonymous'}
        </div>

        <button 
          onClick={handleToggleTracking}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: trackingEnabled ? '#ff4444' : '#44ff44',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}
        >
          {trackingEnabled ? 'Stop Tracking' : 'Start Tracking'}
        </button>

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>

        {error && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: '#fee',
            color: '#c33',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {currentLocation && (
          <div style={{ marginTop: '15px', fontSize: '13px' }}>
            <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Current Location:</p>
            <p style={{ margin: '0' }}>Lat: {currentLocation.latitude.toFixed(6)}</p>
            <p style={{ margin: '0' }}>Lng: {currentLocation.longitude.toFixed(6)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
