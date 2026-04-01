import Favorite from '../models/favorite.model.js';

export const toggleFavorite = async (req, res) => {
    try {
        const { movieId, title, poster_path, vote_average } = req.body;
        const userId = req.user.id;

        const existing = await Favorite.findOne({ userId, movieId });
        if (existing) {
            await Favorite.findByIdAndDelete(existing._id);
            return res.json({ message: "Removido dos favoritos", isFavorite: false });
        }

        const newFavorite = new Favorite({
            userId,
            movieId,
            title,
            poster_path,
            vote_average
        });
        await newFavorite.save();
        res.status(201).json({ message: 'Adicionado aos favoritos', isFavorite: true });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao processar favorito' });
    }
};

export const getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 });

        const formattedFavorites = favorites.map(fav => ({
            id: fav.movieId,
            title: fav.title,
            poster_path: fav.poster_path,
            vote_average: fav.vote_average,
            createdAt: fav.createdAt
        }));
        res.json(formattedFavorites);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar favoritos'});
    }
};