import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movie.route.js';
import connectDB from './config/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use('/api/movie', movieRoutes);

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