import Review from '../models/review.model.js';
import AppError from '../utils/AppError.js';
import tmdb from './tmdb.service.js';

const mapBaseMovie = (movie) => ({
    id: movie.id,
    title: movie.title,
    vote_average: movie.vote_average ?? 0,
    poster_path: movie.poster_path || ''
});

export const getMovieDetailsService = async (movieId) => {
    if (!movieId) {
        throw new AppError('O ID do filme é obrigatório', 400);
    }

    let detailsRes, creditsRes, reviews;

    try {
        [detailsRes, creditsRes, reviews] = await Promise.all([
            tmdb.get(`/movie/${movieId}`),
            tmdb.get(`/movie/${movieId}/credits`),
            Review.find({ movieId }).populate('userId', 'name')
        ]);
    } catch (error) {
        if (error.response?.status === 404) {
            throw new AppError('Filme não encontrado', 404);
        }
        throw error;
    }

    const movie = detailsRes.data;

    if (!movie) {
        throw new AppError('Dados do filme não encontrados', 404);
    }

    const directors = creditsRes.data?.crew
        ?.filter(member => member.job === 'Director')
        ?.map(d => d.name) || [];

    const cast = creditsRes.data?.cast
        ?.slice(0, 15)
        ?.map(actor => ({
            id: actor.id,
            name: actor.name,
            character: actor.character,
            profile_path: actor.profile_path || ''
    })) || [];

    return {
        ...mapBaseMovie(movie),
        overview: movie.overview || '',
        release_date: movie.release_date || '',
        genres: movie.genres || [],
        runtime: movie.runtime || 0,
        directors,
        cast,
        production_companies: movie.production_companies?.map(c => c.name) || [],
        reviews: reviews || []
    }
};

export const getPopularMoviesService = async () => {
    try {
        const response = await tmdb.get('/movie/popular');

        return response.data.results.map((movie, index) => {
            const base = mapBaseMovie(movie);

            return index < 5
                ? {
                    ...base,
                    backdrop_path: movie.backdrop_path || '',
                    overview: movie.overview || ''
                }
                : base
        });
    } catch (error) {
        throw new AppError('Erro ao buscar filmes populares', 500);
    }
};

export const getTopRatedMoviesService = async () => {
    try {
        const response = await tmdb.get('/movie/top_rated');
        
        return response.data.results.map(mapBaseMovie);
    } catch (error) {
        throw new AppError('Erro ao buscar filmes melhores avaliados do TMDB', 500);
    }
};

export const getGenresMoviesService = async () => {
    try {
        const response = await tmdb.get('/genre/movie/list');
        
        return response.data.genres;
    } catch (error) {
        throw new AppError('Erro ao buscar lista de gêneros no TMDB', 500);
    }
};

export const discoverMoviesService = async ({ with_genres, page }) => {
    try {
        const response = await tmdb.get('/discover/movie', {
            params: {
                with_genres,
                page: page || 1
            }
        });

        return response.data.results.map(mapBaseMovie);
    } catch (error) {
        throw new AppError('Erro ao filtrar filmes por gênero', 500);
    }
};