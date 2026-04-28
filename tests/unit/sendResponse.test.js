import { expect, it, jest } from '@jest/globals';
import { sendSuccess, sendError } from '../../src/utils/sendResponse.js';

describe('Util - sendResponse', () => {
    let res;

    beforeEach(() => {
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('sendSuccess', () => {
        it('Deve enviar resposta de sucesso com valores padrão', () => {
            sendSuccess(res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Sucesso',
                type: 'success'
            });
        });

        it('Deve enviar resposta de sucesso com dados customizados', () => {
            sendSuccess(res, { user: { id: 1 } }, 'Criado', 201);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Criado',
                type: 'success',
                user: { id: 1 }
            });
        });

        it('Não deve permitir sobrescrever message/type via data', () => {
            sendSuccess(res, {
                message: 'hack',
                type: 'error',
                user: { id: 1 }
            })

            expect(res.json).toHaveBeenCalledWith({
                message: 'Sucesso',
                type: 'success',
                user: { id: 1 }
            });
        });

        it('Deve ignorar data undefined', () => {
            sendSuccess(res, undefined);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Sucesso',
                type: 'success'
            });
        });

        it('Deve ignorar data null', () => {
            sendSuccess(res, null);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Sucesso',
                type: 'success'
            });
        });

        it('Deve ignorar data não-objeto', () => {
            sendSuccess(res, 'string');

            expect(res.json).toHaveBeenCalledWith({
                message: 'Sucesso',
                type: 'success'
            });
        });

        it('Deve retornar o próprio res', () => {
            const result = sendSuccess(res);

            expect(result).toBe(res);
        });

        it('Deve aceitar status não numérico', () => {
            sendSuccess(res, {}, 'ok', 'abc');

            expect(res.status).toHaveBeenCalledWith('abc');
        });
    });

    describe('sendError', () => {
        it('Deve enviar resposta de erro com valores padrão', () => {
            sendError(res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro interno no servidor',
                type: 'error'
            });
        });

        it('Deve enviar resposta de erro com status e mensagem customizados', () => {
            sendError(res, 'Acesso Negado', 403, { code: 'FORBIDDEN' });

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Acesso Negado',
                type: 'error',
                code: 'FORBIDDEN'
            });
        });

        it('Não deve permitir sobrescrever message/type via extra', () => {
            sendError(res, 'Erro', 400, {
                message: 'hack',
                type: 'success',
                code: 'X'
            });

            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro',
                type: 'error',
                code: 'X'
            });
        });

        it('Deve ignorar extra undefined', () => {
            sendError(res, 'Erro', 500, undefined);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro',
                type: 'error'
            });
        });

        it('Deve ignorar extra null', () => {
            sendError(res, 'Erro', 500, null);

            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro',
                type: 'error'
            });
        });

        it('Deve ignorar extra não-objeto', () => {
            sendError(res, 'Erro', 500, 'string');

            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro',
                type: 'error'
            });
        });

        it('Deve incluir múltiplas propriedades do objeto extra', () => {
            sendError(res, 'Erro', 400, {
                code: 'VAL_ERR',
                fields: ['email']
            });

            expect(res.json).toHaveBeenCalledWith({
                message: 'Erro',
                type: 'error',
                code: 'VAL_ERR',
                fields: ['email']
            });
        });

        it('Deve retornar o próprio res', () => {
            const result = sendError(res);

            expect(result).toBe(res);
        });
    });
});
