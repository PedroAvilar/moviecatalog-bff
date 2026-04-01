import pino from 'pino';
import env from './env.js';

const logger = pino({
    level: env.isProduction ? 'info' : 'debug',
    transport: env.isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid, hostname'
            }
        }
});

export default logger;