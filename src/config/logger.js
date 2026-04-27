import pino from 'pino';
import env from './env.js';

const isTest = process.env.NODE_ENV === 'test';

const logger = pino({
    level: isTest
        ? 'silent'
        : env.isProduction
            ? 'info'
            : 'debug',
    transport: env.isProduction || isTest
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