import tmdb from '../services/tmdb.service.js';
import Review from '../models/review.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';

export const getMovieDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new AppError('O ID do filme é obrigatório', 400);
    }

    let detailsRes, creditsRes, reviews;

    try {
        [detailsRes, creditsRes, reviews] = await Promise.all([
            tmdb.get(`/movie/${id}`),
            tmdb.get(`/movie/${id}/credits`),
            Review.find({ movieId: id }).populate('userId', 'name')
        ]);
    } catch (error) {
        throw new AppError('Filme não encontrado', 404);
    }

    const movie = detailsRes.data;

    const directors = creditsRes.data.crew
        .filter(member => member.job === 'Director')
        .map(d => d.name);

    const cast = creditsRes.data.cast
        .slice(0, 15)
        .map(actor => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path || ""
    }));

    const movieData = {
        id: movie.id,
        title: movie.title,
        overview: movie.overview || "",
        poster_path: movie.poster_path || "",
        backdrop_path: movie.backdrop_path || "",
        release_date: movie.release_date || "",
        vote_average: movie.vote_average || 0,
        genres: movie.genres || [],
        runtime: movie.runtime || 0,
        directors: directors || [],
        cast: cast || [],
        production_companies: movie.production_companies?.map(c => c.name) || [],
        reviews: reviews || []
    };

    res.json(movieData);
});