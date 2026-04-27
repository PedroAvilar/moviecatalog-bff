import { expect, jest } from '@jest/globals';
import sanitizeInput from '../../src/middlewares/sanitizeInput.js';

describe('sanitizeInput Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {};
        next = jest.fn();
    });

    it('Deve remover tags HTML de strings no body', () => {
        req.body = {
            name: 'Pedro <script>alert("xss")</script>',
            bio: '<b>Desenvolvedor</b>'
        };

        sanitizeInput(req, res, next);

        expect(req.body.name).toBe('Pedro alert("xss")');
        expect(req.body.bio).toBe('Desenvolvedor');
        expect(next).toHaveBeenCalled();
    });

    it('Deve remover chaves com $ e . (NoSQL Injection', () => {
        req.body = {
            $where: 'this.password === "123"',
            'user.name': 'Pedro',
            valid: 'ok'
        };

        sanitizeInput(req, res, next);

        expect(req.body.$where).toBeUndefined();
        expect(req.body['user.name']).toBeUndefined();
        expect(req.body.valid).toBe('ok');
    });

    it('Deve remover javascript: de strings', () => {
        req.body = {
            url: 'javascript:alert("hack")'
        };

        sanitizeInput(req, res, next);

        expect(req.body.url).toBe('alert("hack")');
    });

    it('Deve sanitizar arrays com tipos mistos', () => {
        req.body = {
            data: [
                '<b>texto</b>',
                123,
                { comment: '<script>x</script>' }
            ]
        };

        sanitizeInput(req, res, next);

        expect(req.body.data[0]).toBe('texto');
        expect(req.body.data[1]).toBe(123);
        expect(req.body.data[2].comment).toBe('x');
    });

    it('Não deve quebrar se req.body for undefined', () => {
        req = {};
        
        sanitizeInput(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('Deve limpar strings dentro de arrays e objetos aninhados', () => {
        req.body = {
            tags: ['<p>React</p>', 'Node'],
            metadata: {
                comment: '<span>Ótimo filme!</span>'
            }
        };

        sanitizeInput(req, res, next);

        expect(req.body.tags[0]).toBe('React');
        expect(req.body.metadata.comment).toBe('Ótimo filme!');
    });

    it('Deve manter tipos não-string intactos', () => {
        req.body = {
            rating: 10,
            isActive: true,
            movieId: 550
        };

        sanitizeInput(req, res, next);

        expect(req.body.rating).toBe(10);
        expect(req.body.isActive).toBe(true);
        expect(req.body.movieId).toBe(550);
    });

    it('Deve fazer trim nas strings', () => {
        req.body = {
            username: '   pedro_avilar   '
        };

        sanitizeInput(req, res, next);

        expect(req.body.username).toBe('pedro_avilar');
    });
});