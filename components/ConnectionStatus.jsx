import { useState, useEffect } from 'react';
import socket from '../SocketConnect/socket';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      setIsConnected(false);
      if (error.message === 'Authentication error') {
        setConnectionError('Authentication failed - please login again');
      } else {
        setConnectionError(error.message);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
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
        Status:{' '}
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
