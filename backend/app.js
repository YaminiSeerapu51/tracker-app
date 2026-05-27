const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
 
const app = express();
const server = http.createServer(app);
 
// Socket.IO with CORS for cross-origin requests
const io = socketio(server, {
  cors: {
    origin: ["http://localhost:3001", "https://realtime-tracker.vercel.app", "*"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
 
// Middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3001", "https://realtime-tracker.vercel.app", "*"],
  credentials: true
}));
 
// In-memory storage for demo
const users = new Map();
 
// Socket.IO Connection Handler
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
 
    // Create user entry on connection
    users.set(socket.id, {
        id: socket.id,
        name: `User ${socket.id}`,
        connectedAt: new Date().toISOString()
    });
 
    // Handle location updates from clients
    socket.on('sendLocation', (data) => {
        const { latitude, longitude, userId } = data;
 
        console.log(`Location update from ${socket.id}:`, { latitude, longitude });
 
        // Update user data
        if (users.has(socket.id)) {
            const userData = users.get(socket.id);
            userData.latitude = latitude;
            userData.longitude = longitude;
            userData.lastSeen = new Date().toISOString();
            users.set(socket.id, userData);
        }
 
        // Broadcast location update to ALL connected clients
        io.emit('locationUpdate', { 
            id: socket.id, 
            userId: userId || socket.id,
            latitude, 
            longitude,
            timestamp: new Date().toISOString()
        });
    });
 
    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
 
        // Notify all clients about disconnection
        io.emit('userDisconnected', { 
            id: socket.id,
            timestamp: new Date().toISOString()
        });
 
        // Remove user from storage
        users.delete(socket.id);
    });
 
    // Handle errors
    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});
 
// Basic health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        connectedUsers: users.size,
        timestamp: new Date().toISOString()
    });
});
 
// Get all connected users
app.get('/api/users', (req, res) => {
    const usersArray = Array.from(users.values());
    res.json({ 
        count: usersArray.length,
        users: usersArray
    });
});
 
// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Real-Time Tracker Socket.IO Server',
        status: 'running',
        connectedUsers: users.size
    });
});
 
// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO Server running on port ${PORT}`);
    console.log(`Server ready for WebSocket connections`);
});
 
// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
 