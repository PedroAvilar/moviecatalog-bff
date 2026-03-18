import express from 'express';
import tmdb from '../services/tmdb.service.js';

const router = express.Router();

router.get('/popular', async (req, res) => {
    try {
        const response = await tmdb.get('/movie/popular');
        res.json(response.data);
    } catch (error) {
        console.error("Erro TMDB:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Erro ao buscar filmes do TMDB' });
    }
});

export default router;