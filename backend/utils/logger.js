const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.error('Failed to create logs directory:', err.message);
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };
  return JSON.stringify(logEntry);
};

const writeLogFile = (filePath, content) => {
  try {
    fs.appendFileSync(filePath, content + '\n');
  } catch (err) {
    console.error(`Failed to write to log file ${filePath}:`, err.message);
  }
};

const logger = {
  info: (message, data = null) => {
    const logMessage = formatLog('INFO', message, data);
    console.log(`[${getTimestamp()}] INFO:`, message, data ? JSON.stringify(data) : '');
    writeLogFile(path.join(logsDir, 'app.log'), logMessage);
  },

  warn: (message, data = null) => {
    const logMessage = formatLog('WARN', message, data);
    console.warn(`[${getTimestamp()}] WARN:`, message, data ? JSON.stringify(data) : '');
    writeLogFile(path.join(logsDir, 'app.log'), logMessage);
  },

  error: (message, error = null, data = null) => {
    const errorData = {
      message: error?.message,
      stack: error?.stack,
      ...data,
    };
    const logMessage = formatLog('ERROR', message, errorData);
    console.error(`[${getTimestamp()}] ERROR:`, message, error);
    writeLogFile(path.join(logsDir, 'error.log'), logMessage);
  },

  debug: (message, data = null) => {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = formatLog('DEBUG', message, data);
      console.log(`[${getTimestamp()}] DEBUG:`, message, data ? JSON.stringify(data) : '');
      writeLogFile(path.join(logsDir, 'app.log'), logMessage);
    }
  },
};

module.exports = logger;
