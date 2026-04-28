import { expect, it, jest } from '@jest/globals';

const mockUser = {
    findById: jest.fn()
};

jest.unstable_mockModule('../../src/models/user.model.js', () => ({
    default: mockUser
}));

const { protect } = await import('../../src/middlewares/auth.middleware.js');

import { mockMongooseQuery } from '../utils/testUtils.js';
import jwt from 'jsonwebtoken';
import env from '../../src/config/env.js';
import AppError from '../../src/utils/AppError.js';

describe('Auth Middleware - protect', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            cookies: {},
            headers: {}
        };
        res = {};
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('Deve extrair token do cookie e autenticar com sucesso', async () => {
        const token = jwt.sign({ id: 'user123' }, env.jwtSecret);
        req.cookies.token = token;

        const userData = { _id: 'user123', name: 'Pedro' };

        mockUser.findById.mockReturnValue(mockMongooseQuery(userData));

        await protect(req, res, next);

        expect(req.user).toEqual(userData);
        expect(next).toHaveBeenCalled();
        expect(mockUser.findById).toHaveBeenCalledWith('user123');
    });

    it('Deve extrair token do header Authorization e autenticar', async () => {
        const token = jwt.sign({ id: 'user123' }, env.jwtSecret);
        req.headers.authorization = `Bearer ${token}`;

        const userData = { _id: 'user123', name: 'Pedro' };

        mockUser.findById.mockReturnValue(mockMongooseQuery(userData));

        await protect(req, res, next);

        expect(req.user).toEqual(userData);
        expect(next).toHaveBeenCalled();
    });

    it('Deve priorizar o token do cookie sobre o Authorization header', async () => {
        const tokenCookie = jwt.sign({ id: 'user-cookie' }, env.jwtSecret);
        const tokenHeader = jwt.sign({ id: 'user-header' }, env.jwtSecret);
        
        req.cookies.token = tokenCookie;
        req.headers.authorization = `Bearer ${tokenHeader}`;

        const userData = { _id: 'user-cookie', name: 'Pedro Cookie' };

        mockUser.findById.mockReturnValue(mockMongooseQuery(userData));

        await protect(req, res, next);

        expect(req.user).toEqual(userData);
        expect(mockUser.findById).toHaveBeenCalledWith('user-cookie');
    });

    it('Deve falhar se nenhum token for fornecido', async () => {
        await protect(req, res, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Não autorizado, token não encontrado');
        expect(error.statusCode).toBe(401);
    });

    it('Deve falhar se o token for inválido', async () => {
        req.cookies.token = 'token-invalido';

        await protect(req, res, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Não autorizado, token inválido');
        expect(error.statusCode).toBe(401);
    });

    it('Deve falhar se o usuário não existir no banco', async () => {
        const token = jwt.sign({ id: 'inexistente' }, env.jwtSecret);
        req.cookies.token = token;

        mockUser.findById.mockReturnValue(mockMongooseQuery(null));

        await protect(req, res, next);
        
        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        const error = next.mock.calls[0][0];
        expect(error.message).toBe('Não autorizado');
        expect(error.statusCode).toBe(401);
    });
});
