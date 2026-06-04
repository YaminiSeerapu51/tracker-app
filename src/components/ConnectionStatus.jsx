import { useState, useEffect } from 'react';
import socket from '../SocketConnect/socket';
import { auth } from '../SocketConnect/auth';
import { emitSessionExpired } from '../SocketConnect/sessionEvents';

const getConnectErrorMessage = (error) => {
  const msg = error?.message || 'Connection failed';

  if (msg === 'Authentication error') {
    return 'Session invalid (backend may have restarted). Log in again.';
  }
  if (msg.includes('xhr poll error') || msg.includes('websocket error')) {
    return 'Cannot reach realtime server. Check VITE_SOCKET_URL and that Railway backend is running.';
  }
  return msg;
};

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        setConnectionError('Disconnected by server. Try logging in again.');
      }
    };

    const handleConnectError = (error) => {
      setIsConnected(false);
      const message = getConnectErrorMessage(error);
      setConnectionError(message);

      if (error.message === 'Authentication error') {
        auth.logout();
        emitSessionExpired(message);
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

  const handleRetry = () => {
    setConnectionError(null);
    if (auth.isAuthenticated()) {
      socket.connect();
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      maxWidth: '280px'
    }}>
      <h3 style={{ margin: '0 0 8px' }}>Connection Status</h3>
      <p style={{ margin: '0 0 8px' }}>
        Status:{' '}
        <span style={{
          color: isConnected ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </p>
      {connectionError && (
        <p style={{ color: '#c33', fontSize: '13px', margin: '0 0 8px' }}>
          {connectionError}
        </p>
      )}
      {!isConnected && auth.isAuthenticated() && (
        <button
          type="button"
          onClick={handleRetry}
          style={{
            padding: '6px 10px',
            fontSize: '13px',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#007bff',
            color: '#fff'
          }}
        >
          Retry connection
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;
