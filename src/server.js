import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movie.route.js';
import connectDB from './config/db.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.route.js';
import reviewRoutes from './routes/review.route.js';
import favoriteRoutes from './routes/favorite.route.js';
import env from './config/env.js';

const app = express();

connectDB();

app.use(cors({
    origin: env.corsOrigins,
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

app.listen(env.port, () => {
    console.log(`Servidor BFF rodando em http://localhost:${env.port}`)
})