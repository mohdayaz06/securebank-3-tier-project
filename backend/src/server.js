require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection();

  const server = app.listen(PORT, () => {
    console.log(`[server] SecureBank API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down gracefully...`);
    server.close(() => {
      console.log('[server] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (err) => {
  console.error(`[server] Unhandled rejection: ${err.message}`);
  process.exit(1);
});

startServer().catch((err) => {
  console.error(`[server] Failed to start: ${err.message}`);
  process.exit(1);
});
