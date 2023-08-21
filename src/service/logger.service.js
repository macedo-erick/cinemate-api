/* eslint-disable no-shadow */
import {
  createLogger, transports, format, config,
} from 'winston';

const {
  combine, timestamp, splat, printf,
} = format;

const loggerFormat = printf(
  ({
    level, component, message, timestamp,
  }) => `${timestamp} ${component} ${level}: ${message}`,
);

const LoggerService = (component) => {
  const logger = createLogger({
    levels: config.syslog.levels,
    format: combine(
      timestamp({ format: 'YYYY-MM-dd HH:mm:ss' }),
      splat(),
      loggerFormat,
    ),
    defaultMeta: { component },
    transports: [new transports.Console()],
  });

  const info = (message, ...args) => logger.log('info', message, ...args);
  const error = (message, ...args) => logger.log('error', message, ...args);

  return {
    info,
    error,
  };
};

export default LoggerService;
