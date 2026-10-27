import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import formsRouter from './routes/forms.js';

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '20kb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 150, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected'
  });
});

app.use('/api', formsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

app.use((error, _req, res, _next) => {
  if (error?.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ message: 'This website origin is not allowed to access the API.' });
  }
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must contain valid JSON.' });
  }
  if (error?.name === 'ValidationError') {
    return res.status(400).json({ message: 'Some submitted values are invalid.' });
  }
  console.error(error?.message || 'Unexpected server error');
  return res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI. Copy backend/.env.example to backend/.env and configure MongoDB Atlas.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('Connected to MongoDB.');
    app.listen(port, '0.0.0.0', () => console.log(`CampusConnect API listening on port ${port}.`));
  } catch (error) {
    console.error(`Could not connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

async function shutdown() {
  await mongoose.disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
