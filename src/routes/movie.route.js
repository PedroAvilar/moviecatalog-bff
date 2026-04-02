import { discoverMovies, getGenresMovies, getMovieDetails, getPopularMovies, getTopRatedMovies } from '../controllers/movie.controller.js';
import express from 'express';

const router = express.Router();

router.get('/:id/details', getMovieDetails);

router.get('/popular', getPopularMovies);

router.get('/top_rated', getTopRatedMovies);

router.get('/genres', getGenresMovies);

router.get('/discover', discoverMovies);

export default router;