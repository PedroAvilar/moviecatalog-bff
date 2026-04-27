import { jest } from '@jest/globals';

const mockReview = {
    create: jest.fn(),
    find: jest.fn(),
    findOneAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
};

const mockTmdb = {
    get: jest.fn(),
};

const mockCache = {
    del: jest.fn(),
};

const mockUser = {
    findById: jest.fn(),
};

jest.unstable_mockModule('../../src/models/review.model.js', () => ({
    default: mockReview,
}));

jest.unstable_mockModule('../../src/services/tmdb.service.js', () => ({
    default: mockTmdb,
}));

jest.unstable_mockModule('../../src/config/cache.js', () => ({
    default: mockCache,
}));

jest.unstable_mockModule('../../src/models/user.model.js', () => ({
    default: mockUser,
}));

const { default: app } = await import('../../src/app.js');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import env from '../../src/config/env.js';

describe('Review Routes', () => {
    const token = jwt.sign({ id: 'user123' }, env.jwtSecret);

    beforeEach(() => {
        jest.clearAllMocks();
        mockUser.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({ 
                _id: 'user123', 
                name: 'Pedro' 
            })
        });
    });

    describe('POST /api/review', () => {
        it('Deve criar uma avaliação e limpar o cache do filme', async () => {
            const reviewData = {
                movieId: 550,
                rating: 9,
                comment: 'Filme fantástico!'
            };
            
            mockReview.create.mockResolvedValue(reviewData);

            const res = await request(app)
                .post('/api/review')
                .set('Cookie', [`token=${token}`])
                .send(reviewData);

            expect(res.statusCode).toBe(200);
            expect(mockCache.del).toHaveBeenCalledWith(`movies:details:550`);
            expect(res.body.message).toBe('Avaliação criada com sucesso');
        });

        it('Deve retornar 400 se o usuário já avaliou o filme (Erro 11000)', async () => {
            const error = new Error();

            error.code = 11000;
            mockReview.create.mockRejectedValue(error);

            const res = await request(app)
                .post('/api/review')
                .set('Cookie', [`token=${token}`])
                .send({
                    movieId: 550,
                    rating: 5,
                    comment: 'Repetido'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Você já avaliou esse filme');
        });

        it('Deve sanitizar o comentário antes de salvar', async () => {
            const reviewData = {
                movieId: 550,
                rating: 9,
                comment: '<script>alert("xss")</script>Filme bom'
            };

            mockReview.create.mockResolvedValue(reviewData);

            const res = await request(app)
                .post('/api/review')
                .set('Cookie', [`token=${token}`])
                .send(reviewData);

            expect(mockReview.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    comment: 'alert("xss")Filme bom'
                })
            );
        });

        it('Deve ignorar campos maliciosos no body', async () => {
            const reviewData = {
                movieId: 550,
                rating: 9,
                comment: 'ok',
                $where: 'malicious'
            };

            mockReview.create.mockResolvedValue(reviewData);

            const res = await request(app)
                .post('/api/review')
                .set('Cookie', [`token=${token}`])
                .send(reviewData);

            expect(res.statusCode).toBe(400);
        });

        it('Deve falhar na validação (Zod) se os dados estiverem incorretos ou ausentes', async () => {
            const res = await request(app)
                .post('/api/review')
                .set('Cookie', [`token=${token}`])
                .send({
                    movieId: 550
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/review/me', () => {
        it('Deve retornar as reviews do usuário com os dados do filme acoplados', async () => {
            const mockDbReviews = [
                { 
                    movieId: 550,
                    rating: 10,
                    comment: 'Top',
                    toJSON: () => ({ 
                        movieId: 550,
                        rating: 10,
                        comment: 'Top'
                    })
                }
            ];

            mockReview.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockDbReviews)
            });

            mockTmdb.get.mockResolvedValue({
                data: {
                    title: 'Fight Club',
                    poster_path: '/abc.jpg',
                    release_date: '1999-10-15'
                }
            });

            const res = await request(app)
                .get('/api/review/me')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body[0].movie.title).toBe('Fight Club');
            expect(res.body[0].rating).toBe(10);
        });
    });

    describe('DELETE /api/review/:id', () => {
        it('Deve remover a review e limpar o cache', async () => {
            mockReview.findOneAndDelete.mockResolvedValue({
                _id: 'rev123',
                movieId: 550
            });

            const res = await request(app)
                .delete('/api/review/rev123')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(mockCache.del).toHaveBeenCalledWith('movies:details:550');
        });

        it('Deve dar 404 se a review não existir ou não for do usuário', async () => {
            mockReview.findOneAndDelete.mockResolvedValue(null);

            const res = await request(app)
                .delete('/api/review/rev999')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Avaliação não encontrada ou sem permissão');
        });
    });

    describe('PUT /api/review/:id', () => {
        it('Deve atualizar a review com sucesso', async () => {
            mockReview.findOneAndUpdate.mockResolvedValue({
                _id: 'rev123',
                movieId: 550,
                rating: 10,
                comment: 'Editado'
            });

            const res = await request(app)
                .put('/api/review/rev123')
                .set('Cookie', [`token=${token}`])
                .send({ rating: 10, comment: 'Editado' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Avaliação alterada com sucesso');
            expect(mockCache.del).toHaveBeenCalledWith('movies:details:550');
        });

        it('Deve dar 404 se a review não for encontrada ou for de outro usuário', async () => {
            mockReview.findOneAndUpdate.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/review/rev999')
                .set('Cookie', [`token=${token}`])
                .send({ rating: 8, comment: 'Edit' });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Avaliação não encontrada ou sem permissão');
        });

        it('Deve falhar na validação (Zod) se enviar dados inválidos na atualização', async () => {
            const res = await request(app)
                .put('/api/review/rev123')
                .set('Cookie', [`token=${token}`])
                .send({ rating: 'não é um numero' });

            expect(res.statusCode).toBe(400);
        });
    });
});