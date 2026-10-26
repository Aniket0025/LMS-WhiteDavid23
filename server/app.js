import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import connectDB from './config/mongodb.js';
import { connectCloudinary } from './config/cloudnary.js';
import { connectMega } from './config/mega.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import courseRouter from './routes/course.routes.js';
import chapterRouter from './routes/chapter.routes.js';
import lectureRouter from './routes/lecture.routes.js';
import videoRouter from './routes/video.routes.js';
import morgan from 'morgan';
import compression from 'compression';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Gzip/Deflate compression for all HTTP responses
app.use(compression());

// Trust reverse proxy (required for Render HTTPS and secure cookies)
app.set('trust proxy', 1);

// Increase server timeout for file uploads
app.timeout = 600000; // 10 minutes

app.use(morgan('dev'));

// CORS configuration supporting dynamic Vercel domains, custom domains, and local dev
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.CLIENT_URL,
  'https://lms-white-david23.vercel.app',
  'https://whitedavid23.org',
  'https://www.whitedavid23.org'
].filter(Boolean).map(url => url.replace(/\/$/, ''));

const isOriginAllowed = (origin) => {
  if (!origin) return true; // allow same-origin, curl, server-to-server
  const cleanOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(cleanOrigin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (/\.vercel\.app$/.test(cleanOrigin)) return true;
  if (/whitedavid23\.org$/.test(cleanOrigin)) return true;
  return false;
};

app.use(cors({
  origin: function (origin, callback) {
    if (isOriginAllowed(origin)) {
      return callback(null, origin || true);
    }
    // Return null, false rather than throwing an Error, so Express doesn't crash without CORS headers
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// app.use(cors(...)) already intercepts and handles OPTIONS preflight across all routes

app.use(cookieParser());

// Conditional middleware - skip body parsing for file upload routes
app.use((req, res, next) => {
  if ((req.path.includes('/api/lecture/') && req.method === 'POST') || 
      (req.path.includes('/api/course/') && req.path.includes('/update') && req.method === 'PATCH') ||
      (req.path.includes('/api/user/profile/upload-avatar') && req.method === 'POST') ||
      (req.path.includes('/api/video/upload') && req.method === 'POST')) {
    if (req.get('Content-Type')?.includes('multipart/form-data')) {
      // Set longer timeout for file uploads
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000); // 5 minutes
      return next();
    }
  }
  
  express.json({ limit: '600mb' })(req, res, next);
});

app.use((req, res, next) => {
  if ((req.path.includes('/api/lecture/') && req.method === 'POST') || 
      (req.path.includes('/api/course/') && req.path.includes('/update') && req.method === 'PATCH') ||
      (req.path.includes('/api/user/profile/upload-avatar') && req.method === 'POST') ||
      (req.path.includes('/api/video/upload') && req.method === 'POST')) {
    if (req.get('Content-Type')?.includes('multipart/form-data')) {
      // Set longer timeout for file uploads
      req.setTimeout(300000); // 5 minutes
      res.setTimeout(300000); // 5 minutes
      return next();
    }
  }
  
  express.urlencoded({ limit: '600mb', extended: true })(req, res, next);
});

connectDB();
connectCloudinary();
connectMega();

// Health check endpoint (for Render / Vercel liveness monitoring)
app.get('/api/health', (req, res) => {
  const readyState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    server: 'running',
    database: states[readyState] || 'unknown',
    databaseConnected: readyState === 1,
    mongoConfigured: Boolean(process.env.MONGODB_URI),
    mongoType: process.env.MONGODB_URI?.includes('mongodb+srv://') ? 'MongoDB Atlas (Cloud)' : (process.env.MONGODB_URI?.includes('127.0.0.1') ? 'Localhost (Invalid on cloud)' : 'Custom/Other'),
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
    res.send("Hare Krishna");
});

// Database connectivity guard for API routes: prevents 10-second query buffering freezes when DB is disconnected
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  
  // If MongoDB is completely disconnected, respond fast with 503 instead of hanging for 10 seconds
  if (mongoose.connection.readyState === 0) {
    return res.status(503).json({
      success: false,
      message: 'Database is currently unavailable. Please verify MONGODB_URI in Render dashboard.'
    });
  }
  next();
});

// all API Endpoints
app.use('/api/video', videoRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/course', courseRouter);
app.use('/api/chapter', chapterRouter);
app.use('/api/lecture', lectureRouter);

// Global Error Handler - guarantees CORS headers and JSON format even on unexpected errors
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const server = app.listen(PORT, () => {
    console.log("Server Started on port", PORT);
});

// Set server timeout for handling large file uploads
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 650000; // Keep alive timeout should be higher than server timeout
server.headersTimeout = 660000; // Headers timeout should be higher than keep alive timeout