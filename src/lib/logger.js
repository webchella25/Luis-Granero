// src/lib/logger.js
// Sistema de logging profesional para reemplazar console.log

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    // En producción solo mostrar errores y warnings
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
    this.enableColors = process.env.NODE_ENV !== 'production';
  }

  /**
   * Formatea el timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Formatea el mensaje con colores (solo en desarrollo)
   */
  formatMessage(level, message, data) {
    const timestamp = this.getTimestamp();
    const prefix = `[${timestamp}] [${level}]`;

    if (this.enableColors) {
      const colors = {
        ERROR: '\x1b[31m', // Rojo
        WARN: '\x1b[33m',  // Amarillo
        INFO: '\x1b[36m',  // Cyan
        DEBUG: '\x1b[90m', // Gris
      };
      const reset = '\x1b[0m';
      return `${colors[level]}${prefix}${reset} ${message}`;
    }

    return `${prefix} ${message}`;
  }

  /**
   * Log de error
   */
  error(message, error) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage('ERROR', message));
      if (error) {
        console.error(error);
      }
    }
  }

  /**
   * Log de warning
   */
  warn(message, data) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', message));
      if (data) {
        console.warn(data);
      }
    }
  }

  /**
   * Log de información
   */
  info(message, data) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('INFO', message));
      if (data) {
        console.log(data);
      }
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(message, data) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage('DEBUG', message));
      if (data) {
        console.log(data);
      }
    }
  }

  /**
   * Log específico para APIs
   */
  api(method, path, status, duration) {
    if (this.level >= LOG_LEVELS.INFO) {
      const statusColor = status >= 400 ? '🔴' : status >= 300 ? '🟡' : '🟢';
      this.info(`${statusColor} ${method} ${path} - ${status} (${duration}ms)`);
    }
  }

  /**
   * Log específico para autenticación
   */
  auth(action, details) {
    this.info(`🔐 Auth: ${action}`, details);
  }

  /**
   * Log específico para base de datos
   */
  db(action, details) {
    this.debug(`💾 DB: ${action}`, details);
  }

  /**
   * Log específico para emails
   */
  email(action, details) {
    this.info(`📧 Email: ${action}`, details);
  }
}

// Exportar instancia singleton
const logger = new Logger();

export default logger;
