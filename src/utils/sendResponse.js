export const sendSuccess = (res, data = {}, message = 'Sucesso', statusCode = 200) => {
    return res.status(statusCode).json({
        message,
        type: 'success',
        ...data
    });
};

export const sendError = (res, message = 'Erro interno no servidor', statusCode = 500, extra = {}) => {
    return res.status(statusCode).json({
        message,
        type: 'error',
        ...(extra || {})
    });
};