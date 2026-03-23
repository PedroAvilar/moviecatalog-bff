import express, { json } from 'express';
import tmdb from '../services/tmdb.service.js';
import { getMovieDetails } from '../controllers/movie.controller.js';

const router = express.Router();

router.get('/popular', async (req, res) => {
    try {
        const response = await tmdb.get('/movie/popular');
        res.json(response.data);
    } catch (error) {
        console.error("Erro TMDB Popular: ", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao buscar filmes populares do TMDB' });
    }
});

router.get('/top_rated', async (req, res) => {
    try {
        const response = await tmdb.get('/movie/top_rated');
        res.json(response.data);
    } catch (error) {
        console.error("Erro TMDB Top Rated: ", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao buscar filmes melhores avaliados do TMDB'});
    }
});

router.get('/:id/details', getMovieDetails);

export default router;