import Review from '../models/review.model.js';
import tmdb from '../services/tmdb.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const createReview = asyncHandler(async (req, res) => {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!movieId || typeof rating !== 'number' || !userId || !comment) {
        throw new AppError('Avaliação inválida', 400);
    }

    try {
        await Review.create({
            movieId,
            userId,
            rating,
            comment
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError('Você já avaliou esse filme', 400);
        }
        throw error;
    }

    res.json({ message: 'Avaliação criada com sucesso' });
});

export const getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await Review
        .find({ userId: req.user.id })
        .sort('-createdAt');

    const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
            const reviewJson = review.toJSON();

            try {
                const response = await tmdb.get(`/movie/${review.movieId}`);
                const movieData = response.data;

                delete reviewJson.movieId;
                    
                return {
                    ...reviewJson,
                    movie: {
                        id: review.movieId,
                        title: movieData.title,
                        poster_path: movieData.poster_path,
                        release_date: movieData.release_date
                    }
                };
            } catch (error) {
                delete reviewJson.movieId;

                return {
                    ...reviewJson,
                    movie: { 
                        id: review.movieId, 
                        title: 'Filme não encontrado'
                    }
                };
            }
        })
    );
    
    res.json(reviewsWithDetails);
});

export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findOneAndDelete({ _id: id, userId });

    if (!review) {
        throw new AppError('Avaliação não encontrada ou sem permissão', 404);
    }

    res.json({ message: 'Avaliação removida com sucesso' });
});

export const updateReview = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    if (typeof rating !== 'number' || !comment) {
        throw new AppError('Dados insuficientes para atualização', 400);
    }

    const review = await Review.findOneAndUpdate(
        { _id: id, userId },
        { rating, comment },
        { new: true, runValidators: true }
    );

    if (!review) {
        throw new AppError('Avaliação não encontrada ou sem permissão', 404);
    }

    res.json({ message: 'Avaliação alterada com sucesso' });
});