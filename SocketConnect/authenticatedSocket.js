import socket from './socket';
import { getToken } from './auth';

class AuthenticatedSocketManager {
  constructor() {
    this.isAuthenticated = false;
    this.currentToken = null;
  }

  // Initialize socket with authentication
  connect() {
    const token = getToken();
    if (!token) {
      console.error('No authentication token available');
      return false;
    }

    this.currentToken = token;
    this.isAuthenticated = true;

    // Configure socket with authentication
    socket.auth = { token };
    socket.connect();

    return true;
  }

  // Disconnect socket
  disconnect() {
    socket.disconnect();
    this.isAuthenticated = false;
    this.currentToken = null;
  }

  // Reconnect with new token
  reconnectWithToken(newToken) {
    this.disconnect();
    this.currentToken = newToken;
    this.isAuthenticated = true;
    socket.auth = { token: newToken };
    socket.connect();
  }

  // Check if socket is authenticated
  isSocketAuthenticated() {
    return this.isAuthenticated && socket.connected;
  }

  // Get the underlying socket instance
  getSocket() {
    return socket;
  }
}

// Export singleton instance
export const authSocketManager = new AuthenticatedSocketManager();

// Export convenience functions
export const connectAuthenticatedSocket = () => authSocketManager.connect();
export const disconnectAuthenticatedSocket = () => authSocketManager.disconnect();
export const updateSocketToken = (token) => authSocketManager.reconnectWithToken(token);

export default authSocketManager;
