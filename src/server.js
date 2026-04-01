import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movie.route.js';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import reviewRoutes from './routes/review.route.js';
import favoriteRoutes from './routes/favorite.route.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
    origin: ['http://localhost:5173', 'https://pedroavilar.github.io'],
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use('/api/movie', movieRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/review', reviewRoutes);

app.use('/api/favorite', favoriteRoutes);

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'BFF rodando corretamente'
    })
})

app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada'
    })
})

app.listen(PORT, () => {
    console.log(`Servidor BFF rodando em http://localhost:${PORT}`)
})