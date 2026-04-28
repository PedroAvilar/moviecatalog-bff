export const sendSuccess = (res, data = {}, message = 'Sucesso', statusCode = 200) => {
    const safeData = data && typeof data === 'object'
        ? Object.fromEntries(
            Object.entries(data).filter(
                ([key]) => key !== 'message' && key !== 'type'
            )
        ) : {};

    return res.status(statusCode).json({
        message,
        type: 'success',
        ...safeData
    });
};

export const sendError = (res, message = 'Erro interno no servidor', statusCode = 500, extra = {}) => {
    const safeExtra = extra && typeof extra === 'object'
        ? Object.fromEntries(
            Object.entries(extra).filter(
                ([key]) => key !== 'message' && key !== 'type'
            )
        ) : {};

    return res.status(statusCode).json({
        message,
        type: 'error',
        ...safeExtra
    });
};