const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');


const app = express();

// Passport initialization
const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

//test only
if (process.env.NODE_ENV === 'test') {
  app.use('/api/test', require('./routes/testOnly'));
}

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/places', require('./routes/places'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/events', require('./routes/events'));
app.use('/api/saved', require('./routes/saved'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/quests', require('./routes/quests'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/game', require('./routes/game'));

const { optionalAuth } = require('./middleware/auth');

app.post('/api/chat/scan-image', optionalAuth, express.json({ limit: '10mb' }), (req, res) => {
  const http = require('http');
  const postData = JSON.stringify(req.body);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  };
  if (req.user && req.user.userId) {
    headers['x-user-id'] = req.user.userId;
  }
  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/scan-image',
    method: 'POST',
    headers: headers
  };
  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => res.status(proxyRes.statusCode).send(data));
  });
  proxyReq.on('error', err => res.status(500).json({ reply: 'Massar python server is offline.' }));
  proxyReq.write(postData);
  proxyReq.end();
});


app.use('/api/chat', optionalAuth, express.json({ limit: '10mb' }), (req, res) => {
  const http = require('http');
  const postData = JSON.stringify(req.body);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  };
  if (req.user && req.user.userId) {
    headers['x-user-id'] = req.user.userId;
  }
  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/chat',
    method: 'POST',
    headers: headers
  };
  const proxyReq = http.request(options, (proxyRes) => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode).setHeader('Content-Type', 'application/json').send(data);
    });
  });
  proxyReq.on('error', () => {
    res.status(500).json({ reply: 'Chat service unavailable' });
  });
  proxyReq.write(postData);
  proxyReq.end();
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(require('./middleware/errorHandler'));

module.exports = app;