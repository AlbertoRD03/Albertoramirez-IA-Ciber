const dotenv = require('dotenv');

dotenv.config();

const config = {
  port: process.env.PORT || 3050,
  env: process.env.NODE_ENV || 'development',
  grokApiKey: process.env.GROK_API_KEY || '',
  grokModel: process.env.GROK_MODEL || 'grok-beta',
};

module.exports = config;
