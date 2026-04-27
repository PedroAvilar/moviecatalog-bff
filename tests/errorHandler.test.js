import { jest } from '@jest/globals';

const mockLogger = {
    error: jest.fn()
};

const mockSendError = jest.fn();

jest.unstable_mockModule('../src/config/logger.js', () => ({
    default: mockLogger
}));

jest.unstable_mockModule('../src/utils/sendResponse.js', () => ({
    sendError: mockSendError
}));

const { default: errorHandler } = await import('../src/middlewares/errorHandler.js');

describe('ErrorHandler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            originalUrl: '/api/test',
            method: 'GET'
        };
        res = {};
        next = jest.fn();
    });

    it('Deve logar o erro e chamar sendError com statusCode personalizado', () => {
        const error = new Error('Erro de validação');
        error.statusCode = 400;

        errorHandler(error, req, res, next);

        expect(mockLogger.error).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Erro de validação',
            path: '/api/test',
            method: 'GET'
        }));
        expect(mockSendError).toHaveBeenCalledWith(
            res,
            'Erro de validação',
            400
        );
    });

    it('Deve usar statusCode 500 e mensagem padrão se o erro não possuir esses dados', () => {
        const error = new Error('');

        errorHandler(error, req, res, next);

        expect(mockSendError).toHaveBeenCalledWith(
            res,
            'Erro interno no servidor',
            500
        );
    });
})
