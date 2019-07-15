const winston = require('winston');
const expressWinston = require('express-winston');

module.exports.middleware = expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.simple()
  ),
  meta: true,
  expressFormat: true,
  colorize: false
});

module.exports.logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});
