import Review from '../models/review.model.js';
import tmdb from '../services/tmdb.service.js';

export const createReview = async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        const userId = req.user.id;

        if (!movieId || !rating || !userId || !comment) {
            return res.status(400).json({ error: 'Avaliação inválida'})
        }

        const review = await Review.create({
            movieId,
            userId,
            rating,
            comment
        });

        res.status(201).json(review);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Você já avaliou esse filme' });
        }
        console.error('Erro ao salvar avaliação: ', error);
        res.status(500).json({ error: 'Erro ao salvar avaliação' });
    }
};

export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.id }).sort('-createdAt');

        const reviewsWithDetails = await Promise.all(
            reviews.map(async (review) => {
                try {
                    const response = await tmdb.get(`/movie/${review.movieId}`);
                    const movieData = response.data;
                    const reviewJson = review.toJSON();
                    
                    return {
                        ...reviewJson,
                        movieId: {
                            id: review.movieId,
                            title: movieData.title,
                            poster_path: movieData.poster_path,
                            release_date: movieData.release_date
                        }
                    };
                } catch (error) {
                    return {
                        ...review.toJSON(),
                        movieId: { id: review.movieId, title: 'Filme não encontrado'}
                    };
                }
            })
        );
        res.json(reviewsWithDetails);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar suas avaliações'})
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await Review.findOneAndDelete({ _id: id, userId });

        if (!review) {
            return res.status(404).json({ error: 'Avaliação não encontrada ou sem permissão' });
        }

        res.json({ message: 'Avaliação removida com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover avaliação' });
    }
};