import socket from './socket';
import { auth } from './auth';

// Connect socket with token from single source of truth
export const connectAuthenticatedSocket = () => {
  const token = auth.getToken();
  if (!token) {
    console.error('No authentication token available');
    return false;
  }

  socket.auth = { token };
  socket.connect();
  return true;
};

// Disconnect socket
export const disconnectAuthenticatedSocket = () => {
  socket.disconnect();
};

// Check if socket is authenticated
export const isSocketAuthenticated = () => {
  return socket.connected && auth.isAuthenticated();
};

export default socket;

