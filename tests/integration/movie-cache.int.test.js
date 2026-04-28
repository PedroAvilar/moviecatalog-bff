import { expect, it, jest } from '@jest/globals';
import request from 'supertest';
import { connect, disconnect, clearDatabase } from './setup.int.js';

jest.unstable_mockModule('../../src/services/tmdb.service.js', () => ({
    default: {
        get: jest.fn()
    }
}));

const tmdbModule = await import('../../src/services/tmdb.service.js');

const mockTmdbGet = tmdbModule.default.get;

const { default: cache } = await import('../../src/config/cache.js');
const { default: app } = await import('../../src/app.js');

describe('[INTEGRAÇÃO] Movie & Cache', () => {
    beforeAll(async () => {
        await connect();
    });

    afterAll(async () => {
        await clearDatabase();
        await disconnect();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        cache.flushAll();
    });

    it('Deve buscar do TMDB na primeira chamada e do Cache na segunda', async () => {
        const movieData = {
            id: 550,
            title: 'Filme A'
        };
        
        mockTmdbGet
            .mockResolvedValueOnce({ data: movieData })
            .mockResolvedValueOnce({ data: { cast: [], crew: [] } });

        const res1 = await request(app).get('/api/movie/550/details');

        expect(res1.statusCode).toBe(200);
        expect(res1.body.title).toBe('Filme A');
        expect(mockTmdbGet).toHaveBeenCalledTimes(2);

        const res2 = await request(app).get('/api/movie/550/details');

        expect(res2.statusCode).toBe(200);
        expect(res2.body.title).toBe('Filme A');
        expect(mockTmdbGet).toHaveBeenCalledTimes(2);
    });

    it('Deve buscar filmes populares e cachear o resultado', async () => {
        mockTmdbGet.mockResolvedValue({ 
            data: { results: [{ id: 551, title: 'Filme B' }] } 
        });

        const res1 = await request(app).get('/api/movie/popular');

        expect(res1.statusCode).toBe(200);
        expect(mockTmdbGet).toHaveBeenCalledTimes(1);

        const res2 = await request(app).get('/api/movie/popular');

        expect(res2.statusCode).toBe(200);
        expect(mockTmdbGet).toHaveBeenCalledTimes(1);
    });

    it('Deve invalidar o cache e buscar novamente se o cache for limpo', async () => {
        mockTmdbGet.mockResolvedValue({ 
            data: { results: [{ id: 553, title: 'Filme C' }] } 
        });

        await request(app).get('/api/movie/popular');
        
        expect(mockTmdbGet).toHaveBeenCalledTimes(1);

        cache.flushAll();

        await request(app).get('/api/movie/popular');

        expect(mockTmdbGet).toHaveBeenCalledTimes(2);
    });
});
