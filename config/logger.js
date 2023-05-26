/* eslint-disable no-shadow */
import { createLogger, transports, format } from 'winston';

const {
  combine, timestamp, splat, printf,
} = format;

const loggerFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`,
);

const logger = createLogger({
  format: combine(timestamp(), splat(), loggerFormat),
  transports: [new transports.Console()],
});

export default logger;
