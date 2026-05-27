import { useState, useEffect } from 'react';
import Map from './components/Map';
import LocationTracker from './components/LocationTracker';
import ConnectionStatus from './components/ConnectionStatus';
import UserList from './components/UserList';
import Login from './components/Login';
import socket from './SocketConnect/socket';
import { connectAuthenticatedSocket, disconnectAuthenticatedSocket, updateSocketToken } from './SocketConnect/authenticatedSocket';
import { isAuthenticated, logout, getUser, setUser, isAuthenticated as checkAuth } from './SocketConnect/auth';
import { getUserData, getLocationHistory } from './SocketConnect/api';

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useState for state management
  const [markers, setMarkers] = useState({});
  const [users, setUsers] = useState([]);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userData, setUserData] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);

  // Check authentication on load
  useEffect(() => {
    if (checkAuth()) {
      const user = getUser();
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setUser(user);
    updateSocketToken(getUser().token);
    connectAuthenticatedSocket();
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    disconnectAuthenticatedSocket();
  };

  // useEffect for Socket.IO connection and location updates
  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect authenticated socket
    connectAuthenticatedSocket();

    // Socket.IO event listeners
    socket.on('locationUpdate', (data) => {
      const { id, latitude, longitude } = data;
      setMarkers(prevMarkers => ({
        ...prevMarkers,
        [id]: { latitude, longitude }
      }));

      // Update users list
      setUsers(prevUsers => {
        const userExists = prevUsers.some(user => user.id === id);
        if (!userExists) {
          return [...prevUsers, { id, latitude, longitude }];
        }
        return prevUsers.map(user => 
          user.id === id ? { ...user, latitude, longitude } : user
        );
      });
    });

    socket.on('userDisconnected', (data) => {
      const { id } = data;
      setMarkers(prevMarkers => {
        const newMarkers = { ...prevMarkers };
        delete newMarkers[id];
        return newMarkers;
      });

      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
    });

    // API Fetching demonstration
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Simulate API calls
        const userData = await getUserData('user123');
        setUserData(userData);

        const history = await getLocationHistory('user123');
        setLocationHistory(history);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      socket.off('locationUpdate');
      socket.off('userDisconnected');
      disconnectAuthenticatedSocket();
    };
  }, [isAuthenticated]);

  // Event handling function
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
    // Could add functionality to set marker at clicked location
  };

  // Conditional Rendering
  if (loading && !isAuthenticated) {
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

  // Show Login if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div>
      {/* Props passed to components */}
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

      {/* Basic Event Handling and Conditional Rendering */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        marginTop: '200px',
        zIndex: 1000,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <h3>Controls</h3>
        <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          User: {currentUser?.username || 'Anonymous'}
        </p>
        <button 
          onClick={handleToggleTracking}
          style={{
            padding: '8px 16px',
            backgroundColor: trackingEnabled ? '#ff4444' : '#44ff44',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '10px',
            width: '100%'
          }}
        >
          {trackingEnabled ? 'Stop Tracking' : 'Start Tracking'}
        </button>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            width: '100%'
          }}
        >
          Logout
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            Error: {error}
          </div>
        )}

        {currentLocation && (
          <div style={{ marginTop: '10px' }}>
            <p>Current Location:</p>
            <p>Lat: {currentLocation.latitude.toFixed(6)}</p>
            <p>Lng: {currentLocation.longitude.toFixed(6)}</p>
          </div>
        )}

        {userData && (
          <div style={{ marginTop: '10px' }}>
            <p>User: {userData.name || 'Anonymous'}</p>
          </div>
        )}

        {locationHistory.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <p>History Entries: {locationHistory.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
