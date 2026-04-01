import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method
    });

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: err.message || 'Erro interno do servidor'
    });
};

export default errorHandler;