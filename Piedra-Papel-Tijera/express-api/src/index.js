const config = require('./config');
const app = require('./app');

const startServer = () => {
  const server = app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });

  return server;
};

// Only start server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
