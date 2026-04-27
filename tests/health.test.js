import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
    it('Deve retornar status 200 e a mensagem de saúde do sistema', async () => {
        const res = await request(app).get('/health');

        expect(res.statusCode).toBe(200);
        expect(res.body.type).toBe('success');
        expect(res.body.status).toEqual('ok');
    });
});