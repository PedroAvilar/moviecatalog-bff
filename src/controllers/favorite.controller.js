import Favorite from '../models/favorite.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const toggleFavorite = asyncHandler(async (req, res) => {
    const { movieId, title, poster_path, vote_average } = req.body;
    const userId = req.user.id;

    if (!movieId) {
        throw new AppError('O ID do filme é obrigatório', 400);
    }

    const existing = await Favorite.findOne({ userId, movieId });
    if (existing) {
        await Favorite.findByIdAndDelete(existing._id);
        return res.json({ 
            message: "Removido dos favoritos", 
            isFavorite: false 
        });
    }

    await Favorite.create({
        userId,
        movieId,
        title,
        poster_path,
        vote_average
    });
    
    res.status(201).json({ 
        message: 'Adicionado aos favoritos',
        isFavorite: true
    });
});

export const getFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite
        .find({ userId: req.user.id })
        .sort({ createdAt: -1 });

    const formattedFavorites = favorites.map(fav => ({
        id: fav.movieId,
        title: fav.title,
        poster_path: fav.poster_path,
        vote_average: fav.vote_average,
        createdAt: fav.createdAt
    }));
    
    res.json(formattedFavorites);
});