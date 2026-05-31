import { io } from 'socket.io-client';
import { config } from './config';

const socket = io(config.socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

export default socket;
