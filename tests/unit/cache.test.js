import { expect, it, jest } from '@jest/globals';

const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushAll: jest.fn()
};

jest.unstable_mockModule('../../src/config/cache.js', () => ({
    default: mockCache
}));

const { caching } = await import('../../src/utils/cacheHelper.js');

describe('Util - cacheHelper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Deve retornar dados do cache se a chave existir', async () => {
        const key = 'test-key';
        const cachedData = { foo: 'bar' };
        mockCache.get.mockReturnValue(cachedData);

        const callback = jest.fn();
        
        const result = await caching(key, 100, callback);

        expect(result).toEqual(cachedData);
        expect(mockCache.get).toHaveBeenCalledWith(key);
        expect(callback).not.toHaveBeenCalled();
    });

    it('Deve executar callback e salvar no cache se a chave não existir', async () => {
        const key = 'new-key';
        const freshData = { title: 'Filme A' };
        mockCache.get.mockReturnValue(null);
        
        const callback = jest.fn().mockResolvedValue(freshData);

        const result = await caching(key, 100, callback);

        expect(result).toEqual(freshData);
        expect(callback).toHaveBeenCalled();
        expect(mockCache.set).toHaveBeenCalledWith(key, freshData, 100);
    });

    it('Deve repassar erros do callback e não salvar no cache', async () => {
        const key = 'error-key';
        mockCache.get.mockReturnValue(null);
        
        const error = new Error('Falha');
        const callback = jest.fn().mockRejectedValue(error);

        await expect(caching(key, 100, callback)).rejects.toThrow('Falha');
        expect(mockCache.set).not.toHaveBeenCalled();
    });
});
