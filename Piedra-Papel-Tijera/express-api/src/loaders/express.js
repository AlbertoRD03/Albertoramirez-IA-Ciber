const path = require('path');
const express = require('express');
const routes = require('../routes');

const createExpressApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));
  app.use('/api', routes);

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });

  // Basic error handler
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

  return app;
};

module.exports = createExpressApp;
