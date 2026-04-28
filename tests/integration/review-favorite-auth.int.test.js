import { jest } from '@jest/globals';
import { connect, disconnect } from './setup.int.js';

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
import mongoose from 'mongoose';

describe('[INTEGRAÇÃO] Review & Favorite — Fluxo de Interação', () => {
    let authCookie;
    let reviewId;

    beforeAll(async () => {
        await connect();

        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Pedro',
                email: 'pedro@integration.com',
                password: 'password123'
            });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'pedro@integration.com',
                password: 'password123'
            });

        authCookie = loginRes.headers['set-cookie'];
    });

    afterAll(async () => {
        await disconnect();
    });

    describe('Reviews', () => {
        it('Deve criar uma avaliação e persistir no banco', async () => {
            const res = await request(app)
                .post('/api/review')
                .set('Cookie', authCookie)
                .send({
                    movieId: 550,
                    rating: 9,
                    comment: 'Filme fantástico!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Avaliação criada com sucesso');
        });

        it('Deve falhar avaliação duplicada do mesmo filme pelo mesmo usuário', async () => {
            const res = await request(app)
                .post('/api/review')
                .set('Cookie', authCookie)
                .send({
                    movieId: 550,
                    rating: 8,
                    comment: 'Repetido'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Você já avaliou esse filme');
        });

        it('Deve retornar as avaliações do usuário com dados do filme', async () => {
            mockTmdb.get.mockResolvedValue({
                data: {
                    title: 'Filme A',
                    poster_path: '/path.jpg',
                    release_date: '1999-10-15'
                }
            });

            const res = await request(app)
                .get('/api/review/me')
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].rating).toBe(9);
            expect(res.body[0].movie.title).toBe('Filme A');

            reviewId = res.body[0].id;
        });

        it('Deve atualizar a avaliação existente', async () => {
            const res = await request(app)
                .put(`/api/review/${reviewId}`)
                .set('Cookie', authCookie)
                .send({
                    rating: 10,
                    comment: 'Editado'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Avaliação alterada com sucesso');
        });

        it('Deve confirmar a atualização buscando novamente', async () => {
            mockTmdb.get.mockResolvedValue({
                data: {
                    title: 'Filme A',
                    poster_path: '/path.jpg',
                    release_date: '1999-10-15'
                }
            });

            const res = await request(app)
                .get('/api/review/me')
                .set('Cookie', authCookie);

            expect(res.body[0].rating).toBe(10);
            expect(res.body[0].comment).toBe('Editado');
        });

        it('Deve deletar a avaliação', async () => {
            const res = await request(app)
                .delete(`/api/review/${reviewId}`)
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Avaliação removida com sucesso');
        });

        it('Deve confirmar que não há mais avaliações após a exclusão', async () => {
            mockTmdb.get.mockResolvedValue({ data: {} });

            const res = await request(app)
                .get('/api/review/me')
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });
    });

    describe('Favorite', () => {
        it('Deve adicionar um filme aos favoritos', async () => {
            const res = await request(app)
                .post('/api/favorite/toggle')
                .set('Cookie', authCookie)
                .send({
                    movieId: 550,
                    title: 'Filme A',
                    poster_path: '/path.jpg',
                    vote_average: 8.8
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Adicionado aos favoritos');
            expect(res.body.isFavorite).toBe(true);
        });

        it('Deve listar os favoritos do usuário', async () => {
            const res = await request(app)
                .get('/api/favorite')
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe('Filme A');
            expect(res.body[0].id).toBe(550);
        });

        it('Deve remover o favorito ao dar toggle novamente', async () => {
            const res = await request(app)
                .post('/api/favorite/toggle')
                .set('Cookie', authCookie)
                .send({
                    movieId: 550,
                    title: 'Filme A',
                    poster_path: '/path.jpg',
                    vote_average: 8.8
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Removido dos favoritos');
            expect(res.body.isFavorite).toBe(false);
        });

        it('Deve confirmar que a lista de favoritos está vazia', async () => {
            const res = await request(app)
                .get('/api/favorite')
                .set('Cookie', authCookie);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });
    });

    describe('Segurança — Rotas protegidas sem autenticação', () => {
        it('Deve bloquear criação de avaliação sem cookie', async () => {
            const res = await request(app)
                .post('/api/review')
                .send({ movieId: 550, rating: 5, comment: 'Sem autenticação' });

            expect(res.statusCode).toBe(401);
        });

        it('Deve bloquear toggle de favorito sem cookie', async () => {
            const res = await request(app)
                .post('/api/favorite/toggle')
                .send({ movieId: 550, title: 'Filme A' });

            expect(res.statusCode).toBe(401);
        });

        it('Deve bloquear listagem de avaliações sem cookie', async () => {
            const res = await request(app).get('/api/review/me');

            expect(res.statusCode).toBe(401);
        });

        it('Deve bloquear listagem de favoritos sem cookie', async () => {
            const res = await request(app).get('/api/favorite');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('[INTEGRAÇÃO] Auth & Review & Favorites - Fluxo de Exclusão Completo', () => {
        it('Deve deletar usuário, avaliações e favoritos', async () => {
            await request(app).post('/api/auth/register').send({
                name: 'Pedro Teste Cascata',
                email: 'pedro@testecascata.com',
                password: 'password123'
            });

            const loginRes = await request(app).post('/api/auth/login').send({
                email: 'pedro@testecascata.com',
                password: 'password123'
            });

            const cookie = loginRes.headers['set-cookie'];
            const userId = loginRes.body.user.id;

            await request(app)
                .post('/api/favorite/toggle')
                .set('Cookie', cookie)
                .send({
                    movieId: 550,
                    title: 'Filme A',
                    poster_path: '/path.jpg',
                    vote_average: 8.8
                });

            await request(app)
                .post('/api/review')
                .set('Cookie', cookie)
                .send({
                    movieId: 550,
                    rating: 9,
                    comment: 'Filme fantástico!'
                });

            mockTmdb.get.mockResolvedValue({
                data: {
                    title: 'Filme A',
                    poster_path: '/path.jpg',
                    release_date: '1999-10-15'
                }
            });

            const reviewBefore = await request(app)
                .get('/api/review/me')
                .set('Cookie', cookie);

            expect(reviewBefore.body).toHaveLength(1);

            await request(app)
                .delete('/api/auth/delete-account')
                .set('Cookie', cookie);

            const resMe = await request(app)
                .get('/api/auth/me')
                .set('Cookie', cookie);
                
            expect(resMe.statusCode).toBe(401);

            const reviewCount = await mongoose.model('Review').countDocuments({ userId });
            const favoriteCount = await mongoose.model('Favorite').countDocuments({ userId });

            expect(reviewCount).toBe(0);
            expect(favoriteCount).toBe(0);
        });
    });
});
