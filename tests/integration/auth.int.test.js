import { expect, it, jest } from '@jest/globals';
import { connect, disconnect, clearDatabase } from './setup.int.js';

const mockTmdb = { get: jest.fn() };

jest.unstable_mockModule('../../src/services/tmdb.service.js', () => ({
    default: mockTmdb,
}));

jest.unstable_mockModule('../../src/config/cache.js', () => ({
    default: { del: jest.fn(), get: jest.fn(), set: jest.fn() },
}));

jest.unstable_mockModule('../../src/utils/cacheHelper.js', () => ({
    caching: jest.fn((key, ttl, fn) => fn()),
}));

const { default: app } = await import('../../src/app.js');

import request from 'supertest';

describe('[INTEGRAÇÃO] Auth — Fluxo Completo do Usuário', () => {
    let authCookie;

    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await clearDatabase();
        await disconnect();
    });

    afterEach(async () => { });

    describe('Cadastro', () => {
        it('Deve cadastrar um novo usuário e persistir no banco', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Pedro Avilar',
                    email: 'pedro@integration.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.user.name).toBe('Pedro Avilar');
            expect(res.body.user.email).toBe('pedro@integration.com');
            expect(res.body.user.id).toBeDefined();
        });

        it('Deve falhar cadastro com e-mail duplicado', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Pedro Clone',
                    email: 'pedro@integration.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('E-mail já cadastrado');
        });
    });

    describe('Login', () => {
        it('Deve logar com credenciais válidas e retornar cookie JWT', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@integration.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Login realizado com sucesso');
            expect(res.headers['set-cookie']).toBeDefined();
            expect(res.headers['set-cookie'][0]).toMatch(/token=/);

            authCookie = res.headers['set-cookie'];
        });

        it('Deve falhar login com senha incorreta', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@integration.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('E-mail ou senha incorretos');
        });

        it('Deve falhar login com e-mail inexistente', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'naoexiste@integration.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('E-mail ou senha incorretos');
        });
    });

    describe('Rota Protegida (/me)', () => {
        it('Deve retornar dados do usuário logado com cookie válido', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body.user.name).toBe('Pedro Avilar');
            expect(res.body.user.email).toBe('pedro@integration.com');
        });

        it('Deve bloquear acesso sem cookie', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Atualização de Perfil', () => {
        it('Deve atualizar o nome do usuário persistindo no banco', async () => {
            const res = await request(app)
                .put('/api/auth/update-profile')
                .set('Cookie', authCookie)
                .send({
                    name: 'Pedro Atualizado',
                    email: 'pedro@integration.com'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.user.name).toBe('Pedro Atualizado');
        });

        it('Deve confirmar o nome atualizado ao buscar', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', authCookie);

            expect(res.body.user.name).toBe('Pedro Atualizado');
        });
    });

    describe('Atualização de Senha', () => {
        it('Deve atualizar a senha com sucesso', async () => {
            const res = await request(app)
                .put('/api/auth/update-password')
                .set('Cookie', authCookie)
                .send({
                    currentPassword: 'password123',
                    newPassword: 'newpassword456'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Senha atualizada com sucesso');
        });

        it('Deve conseguir logar com a nova senha', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@integration.com',
                    password: 'newpassword456'
                });

            expect(res.statusCode).toBe(200);
            authCookie = res.headers['set-cookie'];
        });

        it('Deve falhar login com a senha antiga', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@integration.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('Logout', () => {
        it('Deve fazer logout e limpar o cookie', async () => {
            const res = await request(app).post('/api/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logout realizado com sucesso');
            expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
        });
    });

    describe('Exclusão de Conta', () => {
        it('Deve excluir a conta e limpar o cookie', async () => {
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@integration.com',
                    password: 'newpassword456'
                });

            authCookie = loginRes.headers['set-cookie'];

            const res = await request(app)
                .delete('/api/auth/delete-account')
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
        });

        it('Deve falhar ao tentar logar com a conta deletada', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@integration.com',
                    password: 'newpassword456'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});
