import { jest } from '@jest/globals';

const mockUser = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

const mockReview = {
    deleteMany: jest.fn(),
};

jest.unstable_mockModule('../src/models/review.model.js', () => ({
    default: mockReview,
}));

jest.unstable_mockModule('../src/models/user.model.js', () => ({
    default: mockUser,
}));

const { default: app } = await import('../src/app.js');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import env from '../src/config/env.js';

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('Deve registrar um novo usuário com sucesso', async () => {
            const newUser = {
                name: 'Pedro',
                email: 'pedro@test.com',
                password: 'password123'
            };
            
            mockUser.findOne.mockResolvedValueOnce(null);
            mockUser.create.mockResolvedValueOnce({
                _id: 'user123',
                name: 'Pedro',
                email: 'pedro@test.com'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(res.statusCode).toBe(201);
            expect(res.body.user.name).toBe('Pedro');
        });

        it('Deve falhar se o e-mail já existir', async () => {
            mockUser.findOne.mockResolvedValue({
                email: 'pedro@test.com'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Pedro',
                    email: 'pedro@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('E-mail já cadastrado');
        });

        it('Deve sanitizar dados no registro', async () => {
            const newUser = {
                name: '<b>Pedro</b>',
                email: 'pedro@test.com',
                password: 'password123'
            };

            mockUser.findOne.mockResolvedValueOnce(null);
            mockUser.create.mockResolvedValueOnce({
                _id: 'user123',
                name: 'Pedro',
                email: 'pedro@test.com'
            });

            await request(app)
                .post('/api/auth/register')
                .send(newUser);

            expect(mockUser.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Pedro'
                })
            );
        });

        it('Deve falhar na validação se enviar dados inválidos (Zod)', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'P', 
                    email: 'email-invalido',
                    password: '123' 
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('Deve logar e retornar um cookie de token', async () => {
            const userData = { 
                _id: 'user123', 
                email: 'pedro@test.com', 
                comparePassword: jest.fn().mockResolvedValue(true)
            };

            mockUser.findOne.mockReturnValueOnce({
                select: jest.fn().mockResolvedValue(userData)
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.headers['set-cookie'][0]).toMatch(/token=/);
            expect(res.body.user.id).toBeDefined();
        });

        it('Deve bloquear tentativa de NoSQL Injection no login', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: { $ne: null },
                    password: '123'
                });

            expect(res.statusCode).toBe(400);
        });

        it('Deve falhar com senha incorreta', async () => {
            const userData = { 
                _id: 'user123', 
                email: 'pedro@test.com', 
                comparePassword: jest.fn().mockResolvedValue(false)
            };

            mockUser.findOne.mockReturnValueOnce({
                select: jest.fn().mockResolvedValue(userData)
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'pedro@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('E-mail ou senha incorretos');
        });

        it('Deve falhar na validação se enviar dados ausentes ou inválidos (Zod)', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'not-an-email'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('Deve fazer logout e limpar o cookie', async () => {
            const res = await request(app).post('/api/auth/logout');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Logout realizado com sucesso');
            expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
        });
    });

    describe('GET /api/auth/me (Rota Protegida)', () => {
        it('Deve retornar dados do usuário se o token for válido', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);

            mockUser.findById.mockReturnValueOnce({
                select: jest.fn().mockResolvedValue({
                    _id: 'user123',
                    name: 'Pedro',
                    email: 'pedro@test.com'
                })
            });

            const res = await request(app)
                .get('/api/auth/me')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body.user.name).toBe('Pedro');
        });

        it('Deve retornar 401 Não Autorizado se não enviar o token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Não autorizado, token não encontrado');
        });
    });

    describe('PUT /api/auth/update-profile', () => {
        beforeEach(() => {
            const userData = {
                _id: 'user123',
                name: 'Pedro',
                email: 'pedro@test.com',
                save: jest.fn().mockResolvedValue(true)
            };
            const fakeQuery = Promise.resolve(userData);
            fakeQuery.select = jest.fn().mockReturnValue(fakeQuery);
            mockUser.findById.mockReturnValue(fakeQuery);
        });

        it('Deve atualizar o perfil do usuário', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);

            const res = await request(app)
                .put('/api/auth/update-profile')
                .set('Cookie', [`token=${token}`])
                .send({
                    name: 'Pedro Novo',
                    email: 'novo@test.com'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Perfil atualizado com sucesso');
            expect(res.body.user.name).toBe('Pedro Novo');
        });

        it('Deve falhar na validação (Zod) se enviar e-mail inválido', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);

            const res = await request(app)
                .put('/api/auth/update-profile')
                .set('Cookie', [`token=${token}`])
                .send({
                    email: 'emailinvalido'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /api/auth/update-password', () => {
        let fakeQuery;
        
        beforeEach(() => {
            const userData = {
                _id: 'user123',
                comparePassword: jest.fn().mockResolvedValue(true),
                password: 'oldHashedPassword',
                save: jest.fn().mockResolvedValue(true)
            };
            fakeQuery = Promise.resolve(userData);
            fakeQuery.select = jest.fn().mockReturnValue(fakeQuery);
            mockUser.findById.mockReturnValue(fakeQuery);
        });

        it('Deve atualizar a senha com sucesso', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);

            const res = await request(app)
                .put('/api/auth/update-password')
                .set('Cookie', [`token=${token}`])
                .send({
                    currentPassword: 'oldPassword',
                    newPassword: 'newPassword123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Senha atualizada com sucesso');
        });

        it('Deve falhar se a senha atual estiver incorreta', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);
            
            const userData = {
                _id: 'user123',
                comparePassword: jest.fn().mockResolvedValue(false)
            };

            const fQ = Promise.resolve(userData);

            fQ.select = jest.fn().mockReturnValue(fQ);
            mockUser.findById.mockReturnValue(fQ);

            const res = await request(app)
                .put('/api/auth/update-password')
                .set('Cookie', [`token=${token}`])
                .send({
                    currentPassword: 'wrongPassword',
                    newPassword: 'newPassword123'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Senha atual incorreta');
        });

        it('Deve falhar na validação (Zod) se nova senha não for informada', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);

            const res = await request(app)
                .put('/api/auth/update-password')
                .set('Cookie', [`token=${token}`])
                .send({
                    currentPassword: 'oldPassword'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('DELETE /api/auth/delete-account', () => {
        it('Deve deletar conta e reviews, e limpar o cookie', async () => {
            const token = jwt.sign({ id: 'user123' }, env.jwtSecret);
            
            mockUser.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue({ 
                    _id: 'user123',
                    id: 'user123'
                })
            });

            mockReview.deleteMany.mockResolvedValue({ deletedCount: 1 });
            mockUser.findByIdAndDelete.mockResolvedValue(true);

            const res = await request(app)
                .delete('/api/auth/delete-account')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(mockReview.deleteMany).toHaveBeenCalledWith({
                userId: 'user123'
            });
            expect(res.headers['set-cookie'][0]).toMatch(/token=;/);
        });
    });
});