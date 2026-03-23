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

router.get('/genres', async (req,res) => {
    try {
        const response = await tmdb.get('/genre/movie/list');
        res.json(response.data);
    } catch (error) {
        console.error("Erro TMDB Genres: ", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao buscar lista de gêneros no TMDB'});
    }
});

router.get('/discover', async (req, res) => {
    try {
        const { with_genres, page } = req.query;
        const response = await tmdb.get('/discover/movie', {
            params: {
                with_genres,
                page: page || 1
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Erro TMDB Discover: ", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao filtrar filmes por gênero'})
    }
})

router.get('/:id/details', getMovieDetails);

export default router;