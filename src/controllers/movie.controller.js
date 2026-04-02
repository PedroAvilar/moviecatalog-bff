import { discoverMoviesService, getGenresMoviesService, getMovieDetailsService, getPopularMoviesService, getTopRatedMoviesService } from '../services/movie.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMovieDetails = asyncHandler(async (req, res) => {
    const response = await getMovieDetailsService(req.params.id);

    res.json(response);
});

export const getPopularMovies = asyncHandler(async (req, res) => {
    const movies = await getPopularMoviesService();

    res.json(movies);
});

export const getTopRatedMovies = asyncHandler(async (req, res) => {
    const movies = await getTopRatedMoviesService();

    res.json(movies);
});

export const getGenresMovies = asyncHandler(async (req, res) => {
    const genres = await getGenresMoviesService();

    res.json(genres);
});

export const discoverMovies = asyncHandler(async (req, res) => {
    const movies = await discoverMoviesService(req.query);

    res.json(movies);
});