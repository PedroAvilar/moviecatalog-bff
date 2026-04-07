import Favorite from '../models/favorite.model.js';

export const toggleFavoriteService = async (userId, data) => {
    const { movieId, title, poster_path, vote_average } = data;

    const existing = await Favorite.findOne({ userId, movieId });

    if (existing) {
        await Favorite.findByIdAndDelete(existing._id);

        return { 
            message: 'Removido dos favoritos', 
            isFavorite: false 
        };
    }

    await Favorite.create({
        userId,
        movieId,
        title,
        poster_path,
        vote_average
    });

    return {
        message: 'Adicionado aos favoritos',
        isFavorite: true
    }
};

export const getFavoritesService = async (userId) => {
    const favorites = await Favorite
        .find({ userId })
        .sort({ createdAt: -1 });
    
    return favorites.map(fav => ({
        id: fav.movieId,
        title: fav.title,
        poster_path: fav.poster_path,
        vote_average: fav.vote_average,
        createdAt: fav.createdAt
    }));
};