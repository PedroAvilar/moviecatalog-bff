import { getMovieDetailsService } from '../services/movie.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getMovieDetails = asyncHandler(async (req, res) => {
    const response = await getMovieDetailsService(req.params.id);

    res.json(response);
});