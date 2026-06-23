require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const socketio = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'https://tracker-app-six-lyart.vercel.app',
  'https://tracker-app-git-main-yaminiseerapu51s-projects.vercel.app',
  'https://tracker-cnm4omk56-yaminiseerapu51s-projects.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true
}));
app.use(express.json());

// In-memory stores (replace with a database for production)
const usersByUsername = new Map();
const usersById = new Map();
const locationHistory = [];

const createUserId = () => crypto.randomUUID();

const signToken = (user) =>
  jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email
});

const registerHandler = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (usersByUsername.has(username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const user = {
    id: createUserId(),
    username,
    email,
    passwordHash: await bcrypt.hash(password, 10)
  };

  usersByUsername.set(username, user);
  usersById.set(user.id, user);

  res.status(201).json({
    message: 'Registration successful',
    user: sanitizeUser(user)
  });
};

const loginHandler = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = usersByUsername.get(username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    token: signToken(user),
    user: sanitizeUser(user)
  });
};

const meHandler = (req, res) => {
  const user = usersById.get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(sanitizeUser(user));
};

const saveLocationHandler = (req, res) => {
  const { latitude, longitude, timestamp } = req.body;

  if (latitude == null || longitude == null) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const entry = {
    userId: req.user.id,
    username: req.user.username,
    latitude,
    longitude,
    timestamp: timestamp || new Date().toISOString()
  };

  locationHistory.push(entry);
  res.status(201).json(entry);
};

const getLocationHistoryHandler = (req, res) => {
  const userId = req.params.userId;
  const history = locationHistory.filter((entry) => entry.userId === userId);
  res.json(history);
};

const mountAuthRoutes = (router) => {
  router.post('/auth/register', registerHandler);
  router.post('/auth/login', loginHandler);
  router.get('/auth/me', authenticateToken, meHandler);
  router.post('/locations', authenticateToken, saveLocationHandler);
  router.get('/locations/:userId', authenticateToken, getLocationHistoryHandler);
};

const apiRouter = express.Router();
mountAuthRoutes(apiRouter);
app.use('/api', apiRouter);

// Legacy routes without /api prefix (backward compatible)
mountAuthRoutes(app);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Real-Time Tracker Backend API',
    version: '2.0.0',
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Real-Time Tracker Backend API',
    version: '2.0.0',
    health: '/health',
    api: '/api'
  });
});

app.use(express.static(path.join(__dirname, 'public')));

const io = socketio(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    socket.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (${socket.user.username})`);

  socket.on('sendLocation', (data) => {
    io.emit('locationUpdate', {
      id: socket.id,
      username: socket.user.username,
      userId: socket.user.id,
      ...data
    });
  });

  socket.on('disconnect', () => {
    io.emit('userDisconnected', { id: socket.id });
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
