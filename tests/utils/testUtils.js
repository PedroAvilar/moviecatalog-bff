import { jest } from '@jest/globals';

export const mockMongooseQuery = (resolvedValue) => {
    const query = Promise.resolve(resolvedValue);
    query.select = jest.fn().mockReturnValue(query);
    return query;
};