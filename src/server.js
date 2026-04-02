import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import movieRoutes from './routes/movie.route.js';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.route.js';
import reviewRoutes from './routes/review.route.js';
import favoriteRoutes from './routes/favorite.route.js';
import env from './config/env.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

connectDB();

app.use(helmet());

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || env.corsOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Não permitido por CORS'));
        }
    },
    credentials: true
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: 'Muitas tentativas, tente novamente mais tarde'
    }
});

app.use(express.json());

app.use(cookieParser());

app.use('/api/movie', movieRoutes);

app.use('/api/auth', authLimiter, authRoutes);

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

app.use(errorHandler);

app.listen(env.port, () => {
    console.log(`Servidor BFF rodando em http://localhost:${env.port}`)
})