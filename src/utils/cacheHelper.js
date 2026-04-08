import cache from '../config/cache.js';

export const caching = async (key, ttl, callback) => {
    const cached = cache.get(key);

    if (cached) return cached;

    const data = await callback();

    cache.set(key, data, ttl);

    return data;
};