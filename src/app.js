import { sendSuccess, sendError } from './utils/sendResponse.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import movieRoutes from './routes/movie.route.js';
import authRoutes from './routes/auth.route.js';
import reviewRoutes from './routes/review.route.js';
import favoriteRoutes from './routes/favorite.route.js';
import env from './config/env.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

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
    max: env.isProduction ? 10 : 1000,
    handler: (req, res) => {
        sendError(
            res,
            'Muitas tentativas. Tente novamente mais tarde.',
            429
        );
    }
});

app.use(express.json());

app.use(cookieParser());

app.use('/api/movie', movieRoutes);

app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/review', reviewRoutes);

app.use('/api/favorite', favoriteRoutes);

app.get('/health', (req, res) => {
    sendSuccess(
        res,
        { status: 'ok' },
        'BFF rodando corretamente'
    );
});

app.use((req, res) => {
    sendError(
        res,
        'Rota não encontrada',
        404
    );
});

app.use(errorHandler);

export default app;