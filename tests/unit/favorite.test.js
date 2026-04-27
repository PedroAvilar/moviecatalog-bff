import { jest } from '@jest/globals';

const mockFavorite = {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
};

const mockTmdb = {
    get: jest.fn(),
};

const mockUser = {
    findById: jest.fn(),
};

jest.unstable_mockModule('../../src/models/favorite.model.js', () => ({
    default: mockFavorite,
}));

jest.unstable_mockModule('../../src/services/tmdb.service.js', () => ({
    default: mockTmdb,
}));

jest.unstable_mockModule('../../src/models/user.model.js', () => ({
    default: mockUser,
}));

const { default: app } = await import('../../src/app.js');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import env from '../../src/config/env.js';

describe('Favorite Routes', () => {
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

    describe('POST /api/favorite/toggle', () => {
        it('Deve adicionar aos favoritos se não existir', async () => {
            mockFavorite.findOne.mockResolvedValue(null);
            mockFavorite.create.mockResolvedValue({
                movieId: 550,
                userId: 'user123'
            });

            const res = await request(app)
                .post('/api/favorite/toggle')
                .set('Cookie', [`token=${token}`])
                .send({ movieId: 550, title: 'Filme A', poster_path: '/path.jpg', vote_average: 8.8 });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Adicionado aos favoritos');
            expect(mockFavorite.create).toHaveBeenCalled();
        });

        it('Deve remover dos favoritos se já existir', async () => {
            mockFavorite.findOne.mockResolvedValue({
                _id: 'fav123',
                movieId: 550,
                userId: 'user123'
            });
            mockFavorite.findByIdAndDelete.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/favorite/toggle')
                .set('Cookie', [`token=${token}`])
                .send({ movieId: 550, title: 'Filme A', poster_path: '/path.jpg', vote_average: 8.8 });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Removido dos favoritos');
            expect(mockFavorite.findByIdAndDelete).toHaveBeenCalled();
        });

        it('Deve falhar na validação (Zod) se não enviar o movieId', async () => {
            const res = await request(app)
                .post('/api/favorite/toggle')
                .set('Cookie', [`token=${token}`])
                .send({ title: 'Filme A' });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/favorite', () => {
        it('Deve listar os favoritos com detalhes do filme', async () => {
            mockFavorite.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([
                    { movieId: 550, title: 'Filme A', poster_path: '/path.jpg', vote_average: 8.8 }
                ])
            });

            const res = await request(app)
                .get('/api/favorite')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body[0].title).toBe('Filme A');
        });

        it('Deve retornar um array vazio se o usuário não tiver favoritos', async () => {
            mockFavorite.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([])
            });

            const res = await request(app)
                .get('/api/favorite')
                .set('Cookie', [`token=${token}`]);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([]);
        });
    });
});
