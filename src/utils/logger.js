const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data
  };

  // Console output
  const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  if (data) {
    console.log(consoleMessage, data);
  } else {
    console.log(consoleMessage);
  }

  // File output
  const fileMessage = JSON.stringify(logEntry) + '\n';
  fs.appendFileSync(logFile, fileMessage);
}

const logger = {
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data) => log('error', message, data),
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      log('debug', message, data);
    }
  }
};

module.exports = logger;
