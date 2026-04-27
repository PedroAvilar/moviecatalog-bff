import { jest } from '@jest/globals'

const mockTmdb = {
    get: jest.fn(),
};

const mockReview = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn()
};

jest.unstable_mockModule('../../src/utils/cacheHelper.js', () => ({
    caching: jest.fn((key, ttl, fn) => fn()), 
}));

jest.unstable_mockModule('../../src/services/tmdb.service.js', () => ({
    default: mockTmdb,
}));

jest.unstable_mockModule('../../src/models/review.model.js', () => ({
    default: mockReview,
}));

const { default: app } = await import('../../src/app.js');

import request from 'supertest';

describe('Movie Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/movie/popular', () => {
        it('Deve retornar lista de filmes populares formatada', async () => {
            const mockMovies = {
                data: {
                    results: [
                        { 
                            id: 1,
                            title: 'Filme teste',
                            vote_average: 7.5,
                            poster_path: '/caminho.jpg',
                            backdrop_path: '/fundo.jpg',
                            overview: 'Resumo'
                        }
                    ]
                }
            };

            mockTmdb.get.mockResolvedValue(mockMovies);

            const res = await request(app).get('/api/movie/popular');

            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body[0]).toHaveProperty('backdrop_path');
        });

        it('Deve retornar erro 500 se o TMDB falhar', async () => {
            mockTmdb.get.mockRejectedValue(new Error('TMDB Offline'));

            const res = await request(app).get('/api/movie/popular');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Erro ao buscar filmes populares');
        });
    });

    describe('GET /api/movie/top_rated', () => {
        it('Deve retornar lista de filmes mais bem avaliados formatada', async () => {
            const mockMovies = {
                data: {
                    results: [
                        { 
                            id: 2,
                            title: 'Filme Top',
                            vote_average: 9.5,
                            poster_path: '/caminho2.jpg'
                        }
                    ]
                }
            };
            mockTmdb.get.mockResolvedValue(mockMovies);

            const res = await request(app).get('/api/movie/top_rated');

            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body[0]).toHaveProperty('title', 'Filme Top');
        });

        it('Deve retornar erro 500 se o TMDB falhar', async () => {
            mockTmdb.get.mockRejectedValue(new Error('TMDB Offline'));

            const res = await request(app).get('/api/movie/top_rated');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Erro ao buscar filmes melhores avaliados do TMDB');
        });
    });

    describe('GET /api/movie/genres', () => {
        it('Deve retornar a lista de gêneros', async () => {
            mockTmdb.get.mockResolvedValue({
                data: {
                    genres: [{
                        id: 28,
                        name: 'Ação'
                    }]
                }
            });

            const res = await request(app).get('/api/movie/genres');

            expect(res.statusCode).toBe(200);
            expect(res.body[0].name).toBe('Ação');
        });
    });

    describe('GET /api/movie/:id/details', () => {
        it('Deve retornar detalhes do filme e reviews mockados', async () => {
            const movieId = '123';
            
            mockTmdb.get.mockImplementation((url) => {
                if (url.includes('credits')) return Promise.resolve({ 
                    data: { 
                        cast: [], 
                        crew: [] 
                    } 
                });

                return Promise.resolve({
                    data: {
                        id: 123,
                        title: 'Detalhe',
                        genres: []
                    }
                });
            });

            mockReview.find.mockImplementation(() => ({
                populate: jest.fn().mockResolvedValue([{ 
                    content: 'Ótimo filme!',
                    userId: {
                        name: 'Pedro'
                    }
                }])
            }));

            const res = await request(app).get(`/api/movie/${movieId}/details`);

            expect(res.statusCode).toBe(200);
            expect(res.body.title).toBe('Detalhe');
            expect(res.body.reviews[0].content).toBe('Ótimo filme!');
        });

        it('Deve retornar 404 se o filme não existir no TMDB', async () => {
            const movieId = '999999';

            const error = new Error('Not Found');
            
            error.response = { status: 404 };
            mockTmdb.get.mockRejectedValue(error);

            const res = await request(app).get(`/api/movie/${movieId}/details`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Filme não encontrado');
        });
    });

    describe('GET /api/movie/discover', () => {
        it('Deve retornar a lista descoberta com formatação de páginas', async () => {
            mockTmdb.get.mockResolvedValue({
                data: {
                    page: 1,
                    total_pages: 5,
                    results: [{ id: 10, title: 'Disco' }]
                }
            });

            const res = await request(app).get('/api/movie/discover?with_genres=28&page=1');

            expect(res.statusCode).toBe(200);
            expect(res.body.page).toBe(1);
            expect(res.body.total_pages).toBe(5);
            expect(res.body.results[0].title).toBe('Disco');
        });
    });
});