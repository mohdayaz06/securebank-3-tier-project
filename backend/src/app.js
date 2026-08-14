const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const transferRoutes = require('./routes/transferRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Trust the first proxy hop (load balancer / ingress) so req.ip reflects
// the real client address for audit logging and rate limiting.
app.set('trust proxy', 1);

// --- Security & parsing middleware ---
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// --- Logging ---
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- General rate limiting (auth routes have their own stricter limiter) ---
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

// --- Health check (for load balancers / Kubernetes probes) ---
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api', (req, res) => {
  res.json({
    name: 'SecureBank API',
    version: '1.0.0',
    endpoints: ['/api/auth', '/api/accounts', '/api/transactions', '/api/transfers'],
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
