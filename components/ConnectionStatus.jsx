import { useState, useEffect } from 'react';
import socket from '../SocketConnect/socket';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Socket.IO event listeners
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Connect to socket
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    }}>
      <h3>Connection Status</h3>
      <p>
        Status: {' '}
        <span style={{ 
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </p>
      {connectionError && <p style={{ color: 'red' }}>Error: {connectionError}</p>}
    </div>
  );
};

export default ConnectionStatus;
