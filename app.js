const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// View engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO logic
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('sendLocation', (data) => {
        io.emit('locationUpdate', { id: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        io.emit('userDisconnected', { id: socket.id });
        console.log(`Client disconnected: ${socket.id}`);
    });
});

// Route
app.get('/', (req, res) => {
    res.render('index');
});

// Start server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
