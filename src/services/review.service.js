import Review from '../models/review.model.js';
import tmdb from './tmdb.service.js';
import AppError from '../utils/AppError.js';
import cache from '../config/cache.js';

export const createReviewService = async (userId, { movieId, rating, comment }) => {
    try {
        await Review.create({
            movieId,
            userId,
            rating,
            comment
        });

        cache.del(`movies:details:${movieId}`);
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError('Você já avaliou esse filme', 400);
        }
        throw error;
    }
};

export const getMyReviewsService = async (userId) => {
    const reviews = await Review.find({ userId }).sort('-createdAt');

    return Promise.all(
        reviews.map(async (review) => {
            const { movieId, ...rest } = review.toJSON();

            try {
                const response = await tmdb.get(`/movie/${movieId}`);
                const movie = response.data;

                return {
                    ...rest,
                    movie: {
                        id: movieId,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        release_date: movie.release_date
                    }
                };
            } catch (error) {
                if (error.response?.status === 404) {
                    return {
                        ...rest,
                        movie: {
                            id: movieId,
                            title: 'Filme não encontrado'
                        }
                    };
                }
                throw new AppError('Erro ao buscar dados do filme', 500);
            }
        })
    );
};

export const deleteReviewService = async (userId, reviewId) => {
    const review = await Review.findOneAndDelete({
        _id: reviewId,
        userId
    });

    if (!review) {
        throw new AppError('Avaliação não encontrada ou sem permissão', 404);
    }

    cache.del(`movies:details:${review.movieId}`);
};

export const updateReviewService = async (userId, reviewId, { rating, comment }) => {
    const review = await Review.findOneAndUpdate(
        { _id: reviewId, userId },
        { rating, comment },
        { new: true, runValidators: true }
    );

    if (!review) {
        throw new AppError('Avaliação não encontrada ou sem permissão', 404);
    }

    cache.del(`movies:details:${review.movieId}`);
};
