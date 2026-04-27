import { jest } from '@jest/globals';
import { z } from 'zod';
import validateRequest from '../../src/middlewares/validateRequest.js';
import AppError from '../../src/utils/AppError.js';

describe('validateRequest Middleware', () => {
    let mockReq, mockRes, next;

    const testSchema = z.object({
        email: z.string().email('E-mail inválido'),
        password: z.number().min(4, 'Deve ter mais de 4 caracteres')
    });

    beforeEach(() => {
        mockReq = { body: {} };
        mockRes = {};
        next = jest.fn();
    });

    it('Deve chamar next() e atualizar o req.body se os dados forem válidos', () => {
        mockReq.body = {
            email: 'pedro@test.com',
            password: 123456,
            extra: 'remover'
        };

        const middleware = validateRequest(testSchema);

        middleware(mockReq, mockRes, next);

        expect(next).toHaveBeenCalledWith();
        expect(mockReq.body).not.toHaveProperty('extra');
        expect(mockReq.body.email).toBe('pedro@test.com');
    });

    it('Deve chamar next(AppError) com a mensagem correta se a validação falhar', () => {
        mockReq.body = {
            email: 'email-invalido',
            password: 12
        };

        const middleware = validateRequest(testSchema);

        middleware(mockReq, mockRes, next);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        const errorPassed = next.mock.calls[0][0];
        
        expect(errorPassed.message).toBe('E-mail inválido');
        expect(errorPassed.statusCode).toBe(400);
    });

    it('Deve usar mensagem padrão se o erro não tiver formato do Zod', () => {
        const brokenSchema = { parse: () => { throw new Error('Quebra fatal'); } };
        
        const middleware = validateRequest(brokenSchema);
        middleware(mockReq, mockRes, next);

        const errorPassed = next.mock.calls[0][0];
        expect(errorPassed.message).toBe('Dados inválidos');
    });
});