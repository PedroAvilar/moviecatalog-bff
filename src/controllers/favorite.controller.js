import { getFavoritesService, toggleFavoriteService } from '../services/favorite.service.js';
import { sendSuccess } from '../utils/sendResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const toggleFavorite = asyncHandler(async (req, res) => {
    const result = await toggleFavoriteService(req.user.id, req.body);

    return sendSuccess(
        res,
        { isFavorite: result.isFavorite },
        result.message,
        result.isFavorite ? 201 : 200
    );
});

export const getFavorites = asyncHandler(async (req, res) => {
    const favorites = await getFavoritesService(req.user.id);

    res.json(favorites);
});