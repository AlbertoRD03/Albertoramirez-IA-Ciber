const { Router } = require('express');
const rpsRoutes = require('./users');
const { shouldUseGrok } = require('../services');

const router = Router();

router.get('/status', (req, res) => {
  const available = shouldUseGrok();
  res.json({ usingGrok: available, grokAvailable: available });
});

router.use('/rps', rpsRoutes);

module.exports = router;
