import { sendError } from '../utils/sendResponse.js';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    const statusCode = err.statusCode || 500;

    sendError(
        res,
        err.message || 'Erro interno no servidor',
        statusCode
    );
};

export default errorHandler;